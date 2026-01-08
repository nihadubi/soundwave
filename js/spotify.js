/**
 * SoundWave - Spotify Integration
 * Uses local backend server for CORS-free downloads
 */

const Spotify = {
    /**
     * Backend API endpoint - configurable for production
     */
    apiBase: window.API_BASE || 'http://localhost:5000/api',

    /**
     * Internal logging helper
     */
    _log(keyOrMsg, highlight = false) {
        if (typeof Utils !== 'undefined' && Utils.addLog) {
            const msg = Utils.t(keyOrMsg) || keyOrMsg;
            Utils.addLog(msg, highlight);
        } else {
            console.log(`[Spotify] ${keyOrMsg}`);
        }
    },

    /**
     * Get track/playlist info
     * @param {string} url - Spotify URL
     * @returns {Promise<object>} Info object
     */
    async getInfo(url) {
        try {
            const response = await fetch(`${this.apiBase}/info?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Məlumat alına bilmədi');
            }
            return await response.json();
        } catch (error) {
            console.error('Spotify info error:', error);
            throw error;
        }
    },

    /**
     * Download a single track from Spotify
     * @param {string} url - Spotify track URL
     * @param {object} [preFetchedInfo] - Optional pre-fetched metadata
     * @param {string} [youtubeUrl] - Optional YouTube URL from preview
     * @returns {Promise<object>} Download result
     */
    async downloadTrack(url, preFetchedInfo = null, youtubeUrl = null) {
        Utils.showStatus(Utils.t('statusFetching'), 'info');
        Utils.updateProgress(10, 'statusFetching');

        try {
            this._log('logStarting');
            const trackId = Utils.extractSpotifyId(url);
            if (!trackId) {
                this._log('logErrorLink', true);
                throw new Error(Utils.t('logErrorLink'));
            }

            let info = preFetchedInfo;

            // Get track info if not provided
            if (!info) {
                this._log('logFetchingMetadata');
                Utils.updateProgress(20, 'statusFetching');
                const infoResponse = await fetch(`${this.apiBase}/info?url=${encodeURIComponent(url)}`);

                if (!infoResponse.ok) {
                    this._log('logErrorMetadata', true);
                    const error = await infoResponse.json();
                    throw new Error(error.error || Utils.t('logErrorMetadata'));
                }
                info = await infoResponse.json();
            } else {
                this._log('logCacheRead');
                Utils.updateProgress(30, 'statusFetching');
            }

            this._log(`${Utils.t('logFound')}: ${info.artist} - ${info.title}`, true);

            // Show track info
            Utils.showTrackInfo({
                title: info.title || 'Spotify Track',
                artist: info.artist || 'Unknown Artist',
                cover: info.thumbnail || '',
                type: 'Track'
            });

            Utils.updateProgress(40, 'statusDownloading');
            Utils.showStatus(Utils.t('statusDownloading'), 'info');
            this._log('logSendingPost');
            this._log('logWaitingYouTube');

            // Download the file
            const downloadResponse = await fetch(`${this.apiBase}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: url,
                    title: info.title,
                    artist: info.artist,
                    duration: info.duration,
                    youtube_url: youtubeUrl,  // Use preview URL if available
                    quality: window.selectedQuality || '320'  // User selected quality
                })
            });

            if (!downloadResponse.ok) {
                this._log('logErrorBackend', true);
                const error = await downloadResponse.json();
                throw new Error(error.error || Utils.t('statusError'));
            }

            // Get YouTube URL from response headers
            const responseYoutubeUrl = downloadResponse.headers.get('X-YouTube-URL');
            if (responseYoutubeUrl) {
                Utils.showPreview({
                    youtube_url: responseYoutubeUrl,
                    youtube_title: responseYoutubeUrl
                });
            }

            this._log('logReceivingFile');
            Utils.updateProgress(80, 'statusVerifying');

            // Get the file blob
            const blob = await downloadResponse.blob();

            // Create download link
            const filename = Utils.sanitizeFilename(`${info.title || 'spotify-track'}.mp3`);
            const downloadUrl = URL.createObjectURL(blob);

            // Trigger download
            this._log(`${Utils.t('logFileReady')}: ${filename}`, true);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this._log('logBrowserDownload');

            // Cleanup
            URL.revokeObjectURL(downloadUrl);

            Utils.updateProgress(100, 'statusSuccess');
            Utils.showStatus(Utils.t('statusSuccess'), 'success');

            // Add to history
            Utils.addToHistory({
                platform: 'spotify',
                title: info.title || 'Unknown Track',
                artist: info.artist || '',
                url: url
            });

            await Utils.delay(2000);
            Utils.hideProgress();

            return { success: true };

        } catch (error) {
            console.error('Spotify download error:', error);
            Utils.hideProgress();
            Utils.showStatus(`${Utils.t('statusError')}: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    },

    /**
     * Download a playlist from Spotify
     * @param {string} url - Spotify playlist URL
     * @returns {Promise<object>} Download result
     */
    async downloadPlaylist(url) {
        Utils.showStatus(Utils.t('statusFetching'), 'info');
        Utils.updateProgress(10, 'statusFetching');

        try {
            const response = await fetch(`${this.apiBase}/info?url=${encodeURIComponent(url)}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Playlist alına bilmədi');
            }

            const info = await response.json();

            if (info.type === 'playlist' && info.tracks && info.tracks.length > 0) {
                Utils.updateProgress(40, 'statusFetching');

                // Show playlist UI
                Utils.showPlaylist({
                    title: info.title || 'Spotify Playlist',
                    tracks: info.tracks.map((track, i) => ({
                        title: track.title || `Track ${i + 1}`,
                        artist: track.artist || 'Unknown',
                        url: track.url || url,
                        duration: track.duration
                    }))
                });

                Utils.hideProgress();
                Utils.showStatus(`${info.tracks.length} ${Utils.t('tracks')} ${Utils.t('found') || 'tapıldı'}.`, 'success');

                return {
                    success: true,
                    isPlaylist: true,
                    tracks: info.tracks
                };
            } else {
                // Single track
                return await this.downloadTrack(url);
            }

        } catch (error) {
            console.error('Spotify playlist error:', error);
            Utils.hideProgress();
            Utils.showStatus(`${Utils.t('statusError')}: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    },

    /**
     * Download an album from Spotify
     * @param {string} url - Spotify album URL
     * @returns {Promise<object>} Download result
     */
    async downloadAlbum(url) {
        // Albums are handled same as playlists
        return await this.downloadPlaylist(url);
    },

    /**
     * Download individual track from playlist
     * @param {number} index - Track index
     * @param {object} track - Track data
     */
    async downloadPlaylistTrack(index, track) {
        Utils.updateTrackStatus(index, 'downloading');

        try {
            // First, get YouTube URL via preview (same as single track)
            let youtubeUrl = null;
            try {
                const previewResponse = await fetch(`${this.apiBase}/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: track.title,
                        artist: track.artist,
                        duration: track.duration
                    })
                });
                if (previewResponse.ok) {
                    const preview = await previewResponse.json();
                    youtubeUrl = preview.youtube_url;
                }
            } catch (e) {
                console.log(`Track ${index} preview failed, will search on download`);
            }

            const response = await fetch(`${this.apiBase}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: track.url,
                    title: track.title,
                    artist: track.artist,
                    duration: track.duration,
                    youtube_url: youtubeUrl,  // Now includes YouTube URL like single track
                    quality: window.selectedQuality || '320'
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Track ${index} server error (${response.status}):`, errorText);
                let errorData = {};
                try { errorData = JSON.parse(errorText); } catch { }
                throw new Error(errorData.error || `Server xətası: ${response.status}`);
            }

            const blob = await response.blob();

            // Check if blob is valid
            if (!blob || blob.size < 1000) {
                console.error(`Track ${index} received empty or too small file:`, blob?.size);
                throw new Error('Fayl boşdur');
            }

            const filename = Utils.sanitizeFilename(`${track.title || 'track'}.mp3`);
            const downloadUrl = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            Utils.addToHistory({
                platform: 'spotify',
                title: track.title,
                artist: track.artist,
                url: track.url
            });

            Utils.updateTrackStatus(index, 'downloaded');
            return true;

        } catch (error) {
            console.error(`Track ${index} download error:`, error.message);
            Utils.updateTrackStatus(index, 'error');
            return false;
        }
    },

    /**
     * Download all selected tracks
     * @param {array} tracks - All tracks
     * @param {array} selectedIndices - Selected indices
     */
    async downloadAllTracks(tracks, selectedIndices) {
        const total = selectedIndices.length;
        let completed = 0;
        let failed = 0;
        const failedTracks = [];

        Utils.showStatus(`${total} ${Utils.t('tracks')} ${Utils.t('statusDownloading')}`, 'info');

        for (const index of selectedIndices) {
            const track = tracks[index];
            const success = await this.downloadPlaylistTrack(index, track);

            if (success) {
                completed++;
            } else {
                failed++;
                failedTracks.push({ index, track });
            }

            // Longer delay between downloads to avoid rate limiting
            await Utils.delay(3000);
        }

        // Retry failed tracks once with longer delay
        if (failedTracks.length > 0) {
            Utils.showStatus(`Uğursuz mahnılar üçün təkrar cəhd...`, 'info');
            await Utils.delay(5000);

            for (const { index, track } of failedTracks) {
                const success = await this.downloadPlaylistTrack(index, track);
                if (success) {
                    completed++;
                    failed--;
                }
                await Utils.delay(4000);
            }
        }

        if (failed === 0) {
            Utils.showStatus(Utils.t('statusSuccess'), 'success');
        } else {
            Utils.showStatus(`${completed} ${Utils.t('statusSuccess')}, ${failed} ${Utils.t('statusError')}`, 'warning');
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Spotify;
}
