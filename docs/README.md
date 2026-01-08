# 🎵 SoundWave

**SoundWave** — A modern web application for downloading Spotify tracks via YouTube with ease.

## 📋 Features

- ✅ **Spotify Link Downloads**: Paste any Spotify track, album, or playlist link
- 🎧 **Quality Selection**: Choose between 128kbps, 192kbps, or 320kbps MP3 format
- 📱 **Playlist Support**: Download entire playlists or albums with a single click
- 🔍 **Preview Function**: Preview YouTube results before downloading
- 🎨 **Modern Interface**: User-friendly and dynamic design
- ⚡ **Fast Performance**: Parallel downloads and optimized backend

## 🛠️ Technologies

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design (mobile-friendly)

### Backend
- Python 3.9+
- Flask (Web Framework)
- yt-dlp (YouTube downloader)
- Flask-CORS (Cross-origin support)

### Other
- FFmpeg (Audio processing)
- Spotify oEmbed API (metadata)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/soundwave.git
cd soundwave/music-downloader
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the backend server
```bash
python server.py
```

Server will run on `http://localhost:5000`

### 4. Start the frontend server
In a separate terminal:
```bash
python -m http.server 8000
```

Frontend will be available at `http://localhost:8000`

## 🌐 Live Demo

Try the application here: **[sound-wave-rouge.vercel.app](https://sound-wave-rouge.vercel.app)**

## 📦 Project Structure

```
music-downloader/
├── server.py           # Flask backend API
├── index.html          # Main page
├── config.js           # API configuration
├── css/
│   └── styles.css      # Styling
├── js/
│   ├── main.js         # Main JavaScript
│   ├── spotify.js      # Spotify API functions
│   └── utils.js        # Utility functions
├── assets/             # Images and media
└── requirements.txt    # Python dependencies
```

## 💡 Usage

1. Copy a track, album, or playlist link from Spotify
2. Paste the link into SoundWave
3. Select audio quality (optional)
4. Click the "Download" button
5. The track will automatically download to your device

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the [MIT](LICENSE) License.

## ⚠️ Disclaimer

This application is intended for personal use and educational purposes only. Please respect copyright laws and artists' rights.
