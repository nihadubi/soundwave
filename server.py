"""
SoundWave Backend Server
Handles music downloads from Spotify via YouTube
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import yt_dlp
import sys
import os
import tempfile
import uuid
import threading
import re
import time
import shutil
import warnings
from unidecode import unidecode
import json
import requests
from dotenv import load_dotenv
from youtubesearchpython import VideosSearch

# Load environment variables from .env file
load_dotenv()

warnings.filterwarnings('ignore')

# Set console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except:
    pass

# Get FFmpeg path
try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except:
    FFMPEG_PATH = 'ffmpeg'

app = Flask(__name__)
CORS(app)

DOWNLOAD_DIR = os.path.join(tempfile.gettempdir(), 'soundwave_downloads')
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

download_lock = threading.Lock()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for server status."""
    return jsonify({'status': 'ok', 'message': 'SoundWave server is running'}), 200

def is_spotify_url(url):
    return 'spotify.com' in url or 'spotify:' in url

def get_spotify_url_type(url):
    """Detect Spotify URL type: track, album, or playlist."""
    if '/track/' in url or 'spotify:track:' in url:
        return 'track'
    elif '/album/' in url or 'spotify:album:' in url:
        return 'album'
    elif '/playlist/' in url or 'spotify:playlist:' in url:
        return 'playlist'
    return 'unknown'

def extract_spotify_id(url, url_type):
    """Extract ID from a Spotify URL."""
    pattern = rf'{url_type}/([a-zA-Z0-9]+)'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    # Also handle spotify: URI format
    pattern_uri = rf'spotify:{url_type}:([a-zA-Z0-9]+)'
    match_uri = re.search(pattern_uri, url)
    if match_uri:
        return match_uri.group(1)
    return None

def get_playlist_tracks(playlist_id, url_type='playlist'):
    """Fetch track list from a Spotify playlist or album using web scraping."""
    tracks = []
    try:
        # Use the embed page which has less protection
        embed_url = f"https://open.spotify.com/embed/{url_type}/{playlist_id}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(embed_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Try to find JSON data in script tags
            json_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.+?)</script>', response.text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(1))
                # Navigate to tracks in the JSON structure
                props = data.get('props', {}).get('pageProps', {})
                state = props.get('state', {}).get('data', {}).get('entity', {})
                
                track_list = state.get('trackList', [])
                for track_data in track_list:
                    # Track data structure: uri, title, subtitle, duration (in ms), isPlayable
                    track_id = track_data.get('uri', '').split(':')[-1] if track_data.get('uri') else None
                    if track_id:
                        # duration is in milliseconds as a direct integer
                        duration_ms = track_data.get('duration')
                        duration_sec = duration_ms // 1000 if duration_ms else None
                        
                        tracks.append({
                            'title': track_data.get('title', 'Unknown'),
                            'artist': track_data.get('subtitle', 'Unknown'),
                            'duration': duration_sec,
                            'url': f"https://open.spotify.com/track/{track_id}"
                        })
                
                print(f"[Playlist] Extracted {len(tracks)} tracks")
        
        # Fallback: Use oEmbed to get basic info
        if not tracks:
            print(f"[Playlist] Embed scraping failed, trying alternative method...")
            # For playlists, we can try the public oembed for the overall info
            # But individual tracks need a different approach
            
    except Exception as e:
        print(f"[Playlist] Error fetching tracks: {e}")
    
    return tracks

@app.route('/')
def index():
    return jsonify({'status': 'ok', 'ffmpeg': FFMPEG_PATH})

@app.route('/api/info', methods=['GET'])
def get_info():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'URL tələb olunur'}), 400
    
    if not is_spotify_url(url):
        return jsonify({'error': 'Yalnız Spotify linkləri dəstəklənir'}), 400
    
    url_type = get_spotify_url_type(url)
    
    # Handle playlists and albums
    if url_type in ['playlist', 'album']:
        spotify_id = extract_spotify_id(url, url_type)
        if spotify_id:
            print(f"[Info] Detected {url_type}: {spotify_id}")
            tracks = get_playlist_tracks(spotify_id, url_type)
            
            if tracks:
                # Get playlist/album title via oEmbed
                try:
                    oembed_url = f"https://open.spotify.com/oembed?url={url}"
                    oembed_resp = requests.get(oembed_url, timeout=5)
                    title = 'Spotify Collection'
                    if oembed_resp.status_code == 200:
                        title = oembed_resp.json().get('title', 'Spotify Collection')
                except:
                    title = 'Spotify Collection'
                
                return jsonify({
                    'type': url_type,
                    'platform': 'spotify',
                    'title': title,
                    'tracks': tracks,
                    'url': url
                })
            else:
                # Fallback: return empty tracks list, frontend can handle
                return jsonify({
                    'type': url_type,
                    'platform': 'spotify',
                    'title': 'Spotify Collection',
                    'tracks': [],
                    'url': url,
                    'error': 'Mahnı siyahısı alına bilmədi. Xahiş edirik hər mahnını ayrıca yükləyin.'
                })
    
    # Handle single tracks
    try:
        return get_spotify_info(url, log_error=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



def scrape_spotify_duration(url):
    """Try to extract duration from Spotify HTML meta tags or script data."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code != 200:
            return None
            
        # Try OG meta tag
        match = re.search(r'<meta property="music:duration" content="(\d+)"', r.text)
        if match:
            return int(match.group(1)) # This is usually in seconds
            
        # Try JSON-LD or script data
        match = re.search(r'"durationMS":(\d+)', r.text)
        if match:
            return int(match.group(1)) // 1000 # Convert MS to Seconds
            
        return None
    except:
        return None

def fast_youtube_search(query, limit=1):
    """
    Fast YouTube search using youtube-search-python library.
    3-5x faster than yt-dlp ytsearch for search-only operations.
    
    Args:
        query: Search query string
        limit: Number of results (default 1)
    
    Returns:
        dict with video info or None
    """
    try:
        print(f"[FastSearch] Searching: {query}")
        search = VideosSearch(query, limit=limit)
        results = search.result()
        
        if results and 'result' in results and len(results['result']) > 0:
            video = results['result'][0]
            print(f"[FastSearch] Found: {video.get('title')}")
            
            # Convert duration from "MM:SS" or "HH:MM:SS" to seconds
            duration_str = video.get('duration', '')
            duration_seconds = None
            if duration_str:
                parts = duration_str.split(':')
                if len(parts) == 2:  # MM:SS
                    duration_seconds = int(parts[0]) * 60 + int(parts[1])
                elif len(parts) == 3:  # HH:MM:SS
                    duration_seconds = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            
            return {
                'webpage_url': video.get('link'),
                'title': video.get('title'),
                'duration': duration_seconds,
                'upload_date': None,  # Not provided by this library
                'timestamp': None
            }
        
        print("[FastSearch] No results found")
        return None
        
    except Exception as e:
        print(f"[FastSearch] Error: {e}")
        # Fallback to yt-dlp if youtube-search-python fails
        return None

def get_file_duration(filepath):
    """Get duration of a media file using ffprobe (via yt-dlp)."""
    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(filepath, download=False)
            return info.get('duration')
    except:
        return None

def is_duration_valid(expected, actual, threshold=15):
    """Check if the duration is within the threshold."""
    if expected is None or actual is None:
        return True # Can't validate, assume OK
    return abs(expected - actual) <= threshold

def is_title_accurate(target_title, target_artist, found_title):
    """Check if the found title is a reasonable match for target title/artist."""
    if not found_title:
        return True
    
    # Normalize everything using unidecode to handle special characters (e, o, u, s, etc.)
    found_title_norm = unidecode(found_title.lower())
    target_title_norm = unidecode((target_title or "").lower())
    target_artist_norm = unidecode((target_artist or "").lower())
    
    # Noise words to ignore
    noise_words = ['official', 'video', 'lyrics', 'audio', 'full', 'remastered', 'hd', '4k', 'mv', 'visualizer', 'spotify']
    
    def clean_text(text):
        # Remove non-alphanumeric (keep spaces)
        cleaned = re.sub(r'[^a-z0-9\s]', ' ', text)
        # Filter out noise words and short words
        words = [w for w in cleaned.split() if w not in noise_words and len(w) > 1]
        return words

    # 0. If it's the exact same normalized, True
    if target_title_norm == found_title_norm:
        return True
        
    # 1. Simple inclusion check
    if target_title_norm in found_title_norm:
        # If artist is generic, we trust the title
        if target_artist_norm in ["spotify", "unknown", ""]:
            return True
        # If artist is specified, check for at least some overlap
        artist_words = clean_text(target_artist_norm)
        if not artist_words or any(w in found_title_norm for w in artist_words):
            return True
            
    # 2. Advanced Keyword overlap
    target_words = clean_text(target_title_norm)
    
    if not target_words:
        return True # Can't validate if we have no words
        
    found_words = set(clean_text(found_title_norm))
    match_count = sum(1 for w in target_words if w in found_words or w in found_title_norm)
    
    # Threshold: Significantly lower for better reliability
    # If more than 25% of the target title's significant words match, it's likely okay
    match_ratio = match_count / len(target_words)
    print(f"[Match] Ratio: {match_ratio:.2f}, Target: '{target_title_norm}', Found: '{found_title_norm}'")
    
    if match_ratio >= 0.25:
        return True
        
    return False

def get_spotify_info(url, log_error=False):
    # Method 1: Spotify oEmbed API (Official, Reliable, No blocking)
    try:
        oembed_url = f"https://open.spotify.com/oembed?url={url}"
        response = requests.get(oembed_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            full_title = data.get('title', '')
            thumbnail = data.get('thumbnail_url', '')
            
            title = 'Spotify Track'
            artist = data.get('author_name', 'Spotify')
            if not artist or artist.startswith('http'):
                artist = 'Spotify'
            
            # Parse "Song by Artist"
            if ' by ' in full_title:
                parts = full_title.rsplit(' by ', 1)
                title = parts[0]
                # Only use parsed artist if author_name is generic
                if artist == 'Spotify':
                    artist = parts[1]
            else:
                title = full_title
                
            # If artist is still 'Spotify', try to scrape from HTML meta tags with multiple UAs
            if artist == 'Spotify' or artist == 'Unknown':
                uas = [
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'facebookexternalhit/1.1',
                    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
                ]
                
                for ua in uas:
                    try:
                        og_res = requests.get(url, headers={'User-Agent': ua}, timeout=5)
                        if og_res.status_code == 200:
                            html_text = og_res.text
                            
                            # 1. Try specific meta tags
                            tags = [
                                r'<meta property="twitter:audio:artist_name" content="([^"]+)"',
                                r'<meta property="music:musician" content="([^"]+)"',
                                r'<meta name="music:musician" content="([^"]+)"',
                                r'<meta name="twitter:creator" content="([^"]+)"'
                            ]
                            for tag in tags:
                                match = re.search(tag, html_text)
                                if match:
                                    val = match.group(1).strip()
                                    # Reject URLs or obviously wrong names
                                    if val and val not in ['Spotify', 'Unknown'] and not val.startswith('http') and len(val) < 100:
                                        artist = val
                                        break
                            
                            if artist != 'Spotify' and artist != 'Unknown': break
                            
                            # 2. Try og:description (Artist · Song · Year)
                            desc = re.search(r'<meta property="og:description" content="([^"]+)"', html_text)
                            if not desc:
                                desc = re.search(r'<meta name="description" content="([^"]+)"', html_text)
                                
                            if desc:
                                desc_text = desc.group(1)
                                if " · " in desc_text:
                                    # Format: "[Artist] · Song · [Year]"
                                    desc_parts = desc_text.split(" · ")
                                    artist_candidate = desc_parts[0]
                                    if "Listen to " in artist_candidate:
                                        # Sometimes it's "Listen to [Song] on Spotify. [Artist] · ...."
                                        if "on Spotify. " in artist_candidate:
                                            artist_candidate = artist_candidate.split("on Spotify. ")[-1]
                                    if artist_candidate not in ['Spotify', 'Unknown']:
                                        artist = artist_candidate
                                        break
                                        
                            # 3. Try HTML title tag parsing
                            page_title = re.search(r'<title>([^<]+)</title>', html_text)
                            if page_title:
                                title_text = page_title.group(1).replace(" | Spotify", "").replace(" - Single", "")
                                if " by " in title_text:
                                    artist_candidate = title_text.split(" by ")[-1].strip()
                                    if artist_candidate not in ['Spotify', 'Unknown']:
                                        artist = artist_candidate
                                        break
                                elif " - " in title_text:
                                    artist_candidate = title_text.split(" - ")[0].strip()
                                    if artist_candidate not in ['Spotify', 'Unknown']:
                                        artist = artist_candidate
                                        break
                    except:
                        continue
            
            # Final cleanup: If we have "Title - Artist" in the title, and artist is Spotify
            if artist == 'Spotify' and " - " in title:
                # Sometimes oEmbed puts both in the title but doesn't set author_name
                parts = title.split(" - ", 1)
                title = parts[0]
                artist = parts[1]
            
            print(f"[oEmbed] Success: {title} by {artist}")
            
            # Scrape duration separately as oEmbed doesn't have it
            duration = scrape_spotify_duration(url)
            
            return jsonify({
                'type': 'track',
                'platform': 'spotify',
                'title': title,
                'artist': artist,
                'thumbnail': thumbnail,
                'duration': duration,
                'url': url
            })
    except Exception as e:
        if log_error:
            print(f"[oEmbed] Error: {e}")

    # Method 2: Fallback to yt-dlp (Dump JSON)
    try:
        ydl_opts = {
            'quiet': True, 
            'no_warnings': True, 
            'extract_flat': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
        title = info.get('title')
        artist = info.get('artist') or info.get('uploader') or 'Spotify'
        
        if title and title != "Spotify":
             duration = info.get('duration') or scrape_spotify_duration(url)
             return jsonify({
                'type': 'track',
                'platform': 'spotify',
                'title': title,
                'artist': artist,
                'thumbnail': info.get('thumbnail'),
                'duration': duration,
                'url': url
            })
    except:
        pass
        
    # Panic fallback: Just get duration if everything else failed but we want to return SOMETHING
    duration = scrape_spotify_duration(url)
        
    return jsonify({
        'type': 'track',
        'platform': 'spotify',
        'title': 'Spotify Track',
        'artist': 'Spotify',
        'duration': duration,
        'url': url
    })

@app.route('/api/preview', methods=['POST'])
def preview_track():
    """Quick YouTube search to show link before download - uses single fast query."""
    data = request.get_json()
    title = data.get('title', '')
    artist = data.get('artist', '')
    duration = data.get('duration')
    
    if not title:
        return jsonify({'error': 'Title required'}), 400
    
    # Single fast search query
    search_query = f'{artist} {title}' if artist else title
    print(f"[Preview] Fast search: {search_query}")
    
    try:
        # Try fast search first
        video = fast_youtube_search(search_query, limit=1)
        
        # Fallback to yt-dlp if fast search fails
        if not video:
            print("[Preview] Fast search failed, falling back to yt-dlp...")
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'format': 'bestaudio/best',
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"ytsearch1:{search_query}", download=False)
                if 'entries' in info and len(info['entries']) > 0:
                    video = info['entries'][0]
                else:
                    return jsonify({'error': 'No results'}), 404
        
        youtube_url = video.get('webpage_url')
        youtube_title = video.get('title')
        youtube_duration = video.get('duration')
        
        # Check duration match
        duration_match = True
        if duration and youtube_duration:
            duration_match = abs(duration - youtube_duration) <= 15
        
        print(f"[Preview] Found: {youtube_title}")
        
        return jsonify({
            'success': True,
            'youtube_url': youtube_url,
            'youtube_title': youtube_title,
            'youtube_duration': youtube_duration,
            'youtube_upload_date': video.get('upload_date'),
            'youtube_timestamp': video.get('timestamp'),
            'duration_match': duration_match
        })
                
    except Exception as e:
        print(f"[Preview] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stream_audio', methods=['POST'])
def stream_audio():
    """
    Stream audio from YouTube URL for in-browser playback.
    This bypasses CORS restrictions by proxying the audio through our server.
    """
    data = request.get_json()
    youtube_url = data.get('youtube_url') if data else None
    
    if not youtube_url:
        return jsonify({'error': 'YouTube URL required'}), 400
    
    print(f"[Stream] Preparing audio stream for: {youtube_url}")
    
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=False)
            
            # Get the best audio URL
            if 'url' in info:
                audio_url = info['url']
            elif 'formats' in info:
                # Find best audio format
                audio_formats = [f for f in info['formats'] if f.get('acodec') != 'none']
                if audio_formats:
                    audio_url = audio_formats[0]['url']
                else:
                    return jsonify({'error': 'No audio stream found'}), 404
            else:
                return jsonify({'error': 'Could not extract audio URL'}), 404
            
            print(f"[Stream] Returning audio stream URL")
            return jsonify({
                'success': True,
                'audio_url': audio_url,
                'title': info.get('title'),
                'duration': info.get('duration')
            })
            
    except Exception as e:
        print(f"[Stream] Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/download', methods=['POST'])
def download_track():
    data = request.get_json()
    url = data.get('url') if data else None
    
    # Extract metadata passed from frontend
    title = data.get('title')
    artist = data.get('artist')
    duration = data.get('duration') # Get duration from frontend
    youtube_url = data.get('youtube_url')  # YouTube URL from preview
    quality = data.get('quality', '320')  # Audio quality (128, 192, 320)
    
    if not url:
        return jsonify({'error': 'URL tələb olunur'}), 400
    
    if not is_spotify_url(url):
        return jsonify({'error': 'Yalnız Spotify linkləri dəstəklənir'}), 400
        
    try:
        return download_spotify(url, title, artist, duration, youtube_url, quality)
    except Exception as e:
        return jsonify({'error': str(e)}), 500



def download_spotify(url, passed_title=None, passed_artist=None, passed_duration=None, passed_youtube_url=None, quality='320'):
    with download_lock:
        file_id = str(uuid.uuid4())[:8]
        current_download_dir = os.path.join(DOWNLOAD_DIR, file_id)
        os.makedirs(current_download_dir, exist_ok=True)
        
        # --- RESEARCH PHASE ---
        # Always fetch fresh metadata from the track's own Spotify page
        # This ensures accuracy, especially for playlist tracks
        print(f"[Research] Fetching fresh metadata for: {url}")
        
        researched_title = passed_title
        researched_artist = passed_artist
        researched_duration = passed_duration
        
        try:
            oembed_url = f"https://open.spotify.com/oembed?url={url}"
            oembed_resp = requests.get(oembed_url, timeout=5)
            if oembed_resp.status_code == 200:
                data = oembed_resp.json()
                full_title = data.get('title', '')
                author = data.get('author_name', '')
                
                if ' by ' in full_title:
                    parts = full_title.rsplit(' by ', 1)
                    researched_title = parts[0]
                    if author and author != 'Spotify':
                        researched_artist = author
                    else:
                        researched_artist = parts[1]
                else:
                    researched_title = full_title
                    researched_artist = author if author and author != 'Spotify' else passed_artist
                
                # Fetch duration
                researched_duration = scrape_spotify_duration(url) or passed_duration
                
                print(f"[Research] Confirmed: '{researched_artist} - {researched_title}' ({researched_duration}s)")
        except Exception as e:
            print(f"[Research] oEmbed failed: {e}, using passed metadata")
        
        fallback_title = researched_title or passed_title or "Spotify Track"
        
        # Clean directory
        for f in os.listdir(current_download_dir):
            try:
                os.remove(os.path.join(current_download_dir, f))
            except:
                pass

        output_path = os.path.join(current_download_dir, f'{fallback_title}.%(ext)s')
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_path,
            'noplaylist': True,
            'quiet': True,
            'ffmpeg_location': FFMPEG_PATH,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': str(quality),  # User selected quality
            }],
        }
        
        try:
            youtube_url_used = passed_youtube_url  # Use preview URL if provided
            
            # If we have a YouTube URL from preview, use it directly!
            if youtube_url_used:
                print(f"[Download] Using preview YouTube URL: {youtube_url_used}")
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([youtube_url_used])
                print("Download from preview URL success!")
                return process_and_send_spotify_file(current_download_dir, file_id, youtube_url_used)
            
            # Otherwise, search YouTube
            search_query = f"{researched_artist} {researched_title}" if researched_artist and researched_title else None
            
            if not search_query or search_query == "Spotify Track":
                print(f"Download aborted: Bad metadata")
                try:
                    shutil.rmtree(current_download_dir)
                except:
                    pass
                return jsonify({'error': 'Mahnı tapılmadı (Spotify məlumatları oxuna bilmədi)'}), 404
            
            print(f"[Download] Searching YouTube: {search_query}")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Get info first to validate
                info_found = ydl.extract_info(f"ytsearch1:{search_query}", download=False)
                if 'entries' in info_found and len(info_found['entries']) > 0:
                    best_match = info_found['entries'][0]
                    found_title = best_match.get('title')
                    found_dur = best_match.get('duration')
                    youtube_url_used = best_match.get('webpage_url')
                    
                    print(f"Found: {found_title} ({found_dur}s)")
                    print(f"YouTube URL: {youtube_url_used}")
                    
                    # Validate using RESEARCHED metadata for accuracy
                    dur_ok = is_duration_valid(researched_duration, found_dur)
                    title_ok = is_title_accurate(researched_title or fallback_title, researched_artist or "Spotify", found_title)
                    
                    if dur_ok and title_ok:
                        print("Validation passed, downloading...")
                        ydl.download([youtube_url_used])
                    elif dur_ok:
                        # Duration matches but title doesn't - likely still correct, proceed with warning
                        print(f"[Warning] Title mismatch but duration OK - proceeding anyway")
                        print(f"  Expected: {researched_title} by {researched_artist}")
                        print(f"  Found: {found_title}")
                        ydl.download([youtube_url_used])
                    else:
                        error_detail = []
                        if not dur_ok: error_detail.append(f"Müddət (Gözlənilən: {researched_duration}s, Tapılan: {found_dur}s)")
                        if not title_ok: error_detail.append(f"Ad")
                        
                        error_msg = f"Məlumat uyğunsuzluğu: {', '.join(error_detail)}"
                        print(f"Validation failed: {error_msg}")
                        return jsonify({'error': f'Mahnı tapılmadı ({error_msg})', 'youtube_url': youtube_url_used}), 404
                else:
                    return jsonify({'error': 'YouTube-da nəticə tapılmadı'}), 404
                    
            print("Download success!")
            return process_and_send_spotify_file(current_download_dir, file_id, youtube_url_used)
            
        except Exception as e:
            print(f"Fallback failed: {e}")
            try:
                shutil.rmtree(current_download_dir)
            except:
                pass
            return jsonify({'error': f'Yükləmə xətası: {str(e)}'}), 404

def process_and_send_spotify_file(download_dir, file_id, youtube_url=None):
    filepath = None
    title = 'Spotify Track'
    
    try:
        files = os.listdir(download_dir)
        for f in files:
            if f.endswith('.mp3'):
                filepath = os.path.join(download_dir, f)
                title = f[:-4]
                break
    except:
        pass
        
    if not filepath:
        return jsonify({'error': 'Fayl tapılmadı'}), 404
        
    new_filepath = os.path.join(DOWNLOAD_DIR, f"{file_id}_{title}.mp3")
    shutil.move(filepath, new_filepath)
    try:
        shutil.rmtree(download_dir)
    except:
        pass
        
    return send_audio_file(new_filepath, title, youtube_url)

def send_audio_file(filepath, title, youtube_url=None):
    ext = os.path.splitext(filepath)[1].lower() or '.mp3'
    content_type = 'audio/mpeg' if ext == '.mp3' else 'audio/mp4'
    
    safe_title = unidecode(title)
    filename = re.sub(r'[\\/:\"*?<>|]', '', safe_title).strip()
    
    if not filename:
        filename = 'track'
    if not filename.endswith(ext):
        filename = f"{filename}{ext}"
    
    try:
        file_size = os.path.getsize(filepath)
    except:
        return jsonify({'error': 'Fayl oxuna bilmədi'}), 500
    
    def generate():
        with open(filepath, 'rb') as f:
            while chunk := f.read(8192):
                yield chunk
        try:
            os.remove(filepath)
        except:
            pass
    
    response = Response(generate(), mimetype=content_type)
    response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
    response.headers['Content-Length'] = file_size
    response.headers['X-File-Name'] = filename
    if youtube_url:
        response.headers['X-YouTube-URL'] = youtube_url
    return response

@app.route('/api/cleanup', methods=['POST'])
def cleanup():
    count = 0
    for f in os.listdir(DOWNLOAD_DIR):
        try:
            path = os.path.join(DOWNLOAD_DIR, f)
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
            count += 1
        except:
            pass
    return jsonify({'deleted': count})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 50)
    print("🎵 SoundWave Backend Server")
    print(f"🎬 FFmpeg: {FFMPEG_PATH}")
    print(f"🌐 Server running on 0.0.0.0:{port}")
    print("=" * 50)
    app.run(host='0.0.0.0', port=port, debug=False)
