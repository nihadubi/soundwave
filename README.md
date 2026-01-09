# 🎵 SoundWave - Advanced Spotify Downloader

**SoundWave** is a modern, web-based application that allows users to download high-quality MP3 tracks from Spotify links. It utilizes a powerful backend to cross-reference Spotify metadata with **YouTube Music**, ensuring the download of official audio tracks while filtering out remixes, covers, and incorrect versions.


## ✨ Key Features

* **🎧 Smart Audio Matching:**
    * Uses **YouTube Music API** for higher accuracy (finding official audio).
    * **Triple Validation System:** Checks Artist match, Title similarity, and filters out unwanted "Remix/Cover/Live" versions unless specified.
    * Handles complex queries (e.g., specific versions like "-second season ver-").
* **📥 Batch Downloading:** Support for single **Tracks**, **Albums**, and **Playlists**.
* **🚀 High Performance:**
    * Concurrent processing for playlists.
    * Real-time progress bar with smooth animations.
    * Fast MP3 conversion using FFmpeg.
* **🎨 Modern UI/UX:**
    * **Glassmorphism Design:** Sleek, dark-themed UI with blur effects.
    * **Live Preview:** Listen to a 30s preview (or full track via proxy) before downloading.
    * **Multi-language Support:** Available in Azerbaijani (AZ) and English (EN).
* **🛡️ Robust Error Handling:** Automatically retries failed downloads and sanitizes filenames.

## 🛠️ Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.0-black?style=for-the-badge&logo=flask&logoColor=white)
![FFmpeg](https://img.shields.io/badge/FFmpeg-Audio-green?style=for-the-badge&logo=ffmpeg&logoColor=white)

* **Libraries:** `yt-dlp`, `ytmusicapi`, `ffmpeg-python`

### Frontend
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Structure-orange?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-blue?style=for-the-badge&logo=css3&logoColor=white)

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.8+
* FFmpeg (Recommended to have it installed in system PATH)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/soundwave.git](https://github.com/yourusername/soundwave.git)
cd soundwave
```

### 2. Install Python Dependencies

Create a requirements.txt file (or install manually):
```Bash

pip install flask flask-cors yt-dlp ytmusicapi imageio-ffmpeg unidecode requests python-dotenv youtube-search-python
```

### 3. Run the Server
```Bash

python server.py
```
The backend will start on http://0.0.0.0:5000.

### 4. Launch the Frontend

Simply open index.html in your browser.
## 🧠 How It Works (The "Smart Search" Logic)

SoundWave doesn't just blindly download the first result. It employs a strict filtering logic in `server.py`:

1. **Sanitization:** Cleans search queries (e.g., removes hyphens that YouTube interprets as exclusion operators).
2. **Search:** Queries **YouTube Music** (Songs category) instead of standard YouTube to avoid video clips.
3. **Filtration Loop:** Fetches top 5 results and checks:
   * Does the **Artist** name match?
   * If the Spotify title is original, does the YouTube result contain "Remix", "Cover", or "Live"? If yes, **Discard**.
   * Is the **Title Similarity** score high enough?
4. **Fallback:** If no valid match is found, it aborts rather than downloading the wrong song.

## Project Structure

```text
soundwave/
├── server.py        # Flask Backend & Downloading Logic
├── main.js          # UI Interaction & Event Listeners
├── spotify.js       # Spotify API & Download Orchestration
├── utils.js         # Helper functions (Logging, Progress Bar, Formatter)
├── styles.css       # Visual Styling (Glassmorphism)
└── index.html       # Main Entry Point

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please respect copyright laws and the Terms of Service of Spotify and YouTube. Do not use this tool for piracy or distributing copyrighted content.

## 🤝 Contribution

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---
*Developed with ❤️ by nihadubi*