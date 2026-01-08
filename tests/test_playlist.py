import requests
import json
import re

url = 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

r = requests.get(url, headers=headers, timeout=10)
print(f"Status: {r.status_code}")

json_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.+?)</script>', r.text, re.DOTALL)
if json_match:
    data = json.loads(json_match.group(1))
    props = data.get('props', {}).get('pageProps', {})
    state = props.get('state', {}).get('data', {}).get('entity', {})
    track_list = state.get('trackList', [])
    
    print(f"TrackList length: {len(track_list)}")
    
    if track_list:
        first = track_list[0]
        print(f"\n=== First track structure ===")
        print(json.dumps(first, indent=2, default=str)[:2000])
