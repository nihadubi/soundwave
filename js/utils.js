const Utils = {
    /**
     * Translations dictionary
     */
    translations: {
        az: {
            tagline: "Feel the Rhythm, Catch the Wave",
            inputPlaceholder: "Spotify linkini yapışdırın...",
            clearTitle: "Təmizlə",
            downloadBtn: "YÜKLƏ",
            progressTitle: "Yüklənir...",
            progressStatus: "Hazırlanır...",
            selectAll: "Hamısını Seç",
            downloadAll: "Hamısını Yüklə",
            historyTitle: "Son Yükləmələr",
            clearHistory: "Tarixçəni Təmizlə",
            footerText: "© 2026 SoundWave. Yalnız şəxsi istifadə üçün.",
            statusFetching: "Məlumatlar əldə edilir...",
            statusDownloading: "Yüklənir...",
            statusVerifying: "Yoxlanılır...",
            statusSuccess: "Uğurla tamamlandı!",
            statusError: "Xəta baş verdi",
            justNow: "İndicə",
            minutesAgo: "dəq əvvəl",
            hoursAgo: "saat əvvəl",
            daysAgo: "gün əvvəl",
            tracks: "mahnı",
            track: "Mahnı",
            album: "Albom",
            playlist: "Playlist",
            logStarting: "Spotify bağlantısı başladıldı...",
            logErrorLink: "XƏTA: Düzgün Spotify linki deyil",
            logFetchingMetadata: "Mahnı məlumatları serverdən sorğulanır...",
            logErrorMetadata: "XƏTA: Məlumat alına bilmədi",
            logCacheRead: "Məlumat yaddaşdan (cache) oxundu.",
            logFound: "Mahnı tapıldı",
            logSendingPost: "Serverə yükləmə POST sorğusu göndərilir...",
            logWaitingYouTube: "Gözləyin: YouTube axtarışı və MP3 konvertasiyası işləyir...",
            logErrorBackend: "XƏTA: Backend yükləməni icra edə bilmədi",
            logReceivingFile: "Fayl translyasiyası qəbul edilir...",
            logFileReady: "Fayl hazır",
            logBrowserDownload: "Brauzer yükləməsi başladı.",
            historyCleared: "Tarixçə təmizləndi",
            invalidLink: "Zəhmət olmasa düzgün Spotify linki daxil edin",
            deselectAll: "Seçimi Ləğv Et",
            noTracksSelected: "Heç bir mahnı seçilməyib",
            noTracksFound: "Mahnılar tapılmadı",
            anotherDownloadInProgress: "Başqa yükləmə davam edir",
            trackNotFound: "Mahnı tapılmadı",
            previewLoading: "YouTube axtarılır...",
            previewDuration: "Müddət: ",
            previewDurationMismatch: "⚠️ Müddt fərqli - yoxlayın!",
            logSearchingYouTube: "YouTube-da mahnı axtarılır...",
            serverOnline: "Server: Aktiv",
            serverOffline: "Server: Offline",
            clipboardDetected: "📋 Spotify linki clipboard-dan aşkar edildi",
            // Features
            featFastTitle: "Super Sürətli",
            featFastText: "Ani çevirmə və yükləmə.",
            featQualityTitle: "Yüksək Keyfiyyət",
            featQualityText: "320kbps səs keyfiyyəti.",
            featSecureTitle: "Təhlükəsiz və Pulsuz",
            featSecureText: "Reklamsız, izləmədən, açıq mənbə.",
            // Settings
            settingsTitle: "⚙️ Ayarlar",
            settingsQuality: "🎧 Keyfiyyət"
        },
        en: {
            tagline: "Feel the Rhythm, Catch the Wave",
            inputPlaceholder: "Paste Spotify link...",
            clearTitle: "Clear",
            downloadBtn: "DOWNLOAD",
            progressTitle: "Downloading...",
            progressStatus: "Preparing...",
            selectAll: "Select All",
            downloadAll: "Download All",
            historyTitle: "Recent Downloads",
            clearHistory: "Clear History",
            footerText: "© 2026 SoundWave. For individual use only.",
            statusFetching: "Fetching info...",
            statusDownloading: "Downloading...",
            statusVerifying: "Verifying...",
            statusSuccess: "Completed successfully!",
            statusError: "An error occurred",
            justNow: "Just now",
            minutesAgo: "min ago",
            hoursAgo: "hours ago",
            daysAgo: "days ago",
            tracks: "tracks",
            track: "Track",
            album: "Album",
            playlist: "Playlist",
            logStarting: "Spotify connection started...",
            logErrorLink: "ERROR: Invalid Spotify link",
            logFetchingMetadata: "Requesting track metadata from server...",
            logErrorMetadata: "ERROR: Metadata could not be fetched",
            logCacheRead: "Metadata read from cache.",
            logFound: "Track found",
            logSendingPost: "Sending download POST request to server...",
            logWaitingYouTube: "Please wait: YouTube search and MP3 conversion in progress...",
            logErrorBackend: "ERROR: Backend failed to execute download",
            logReceivingFile: "Receiving file stream...",
            logFileReady: "File ready",
            logBrowserDownload: "Browser download started.",
            historyCleared: "History cleared",
            invalidLink: "Please enter a valid Spotify link",
            deselectAll: "Deselect All",
            noTracksSelected: "No tracks selected",
            noTracksFound: "No tracks found",
            anotherDownloadInProgress: "Another download in progress",
            trackNotFound: "Track not found",
            previewLoading: "Searching YouTube...",
            previewDuration: "Duration: ",
            previewDurationMismatch: "⚠️ Duration mismatch - please verify!",
            logSearchingYouTube: "Searching for song on YouTube...",
            serverOnline: "Server: Online",
            serverOffline: "Server: Offline",
            clipboardDetected: "📋 Spotify link detected from clipboard",
            // Features
            featFastTitle: "Super Fast",
            featFastText: "Instant conversion & download.",
            featQualityTitle: "High Quality",
            featQualityText: "Up to 320kbps audio support.",
            featSecureTitle: "Secure & Free",
            featSecureText: "No ads, no tracking, open source.",
            // Settings
            settingsTitle: "⚙️ Settings",
            settingsQuality: "🎧 Quality"
        }
    },

    currentLang: 'az',

    /**
     * Change site language
     * @param {string} lang - 'az' or 'en'
     */
    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        document.documentElement.setAttribute('data-i18n-lang', lang);

        // Update elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[lang][key]) {
                el.textContent = this.translations[lang][key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (this.translations[lang][key]) {
                el.placeholder = this.translations[lang][key];
            }
        });

        // Update titles
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (this.translations[lang][key]) {
                el.title = this.translations[lang][key];
            }
        });

        // Update language buttons active state
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        // Redraw history to update relative times
        this.renderHistory();
    },

    /**
     * Get translation by key
     * @param {string} key - Translation key
     * @returns {string} Translated text
     */
    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    /**
     * Platform detection patterns
     */
    patterns: {
        spotify: {
            track: /^https?:\/\/open\.spotify\.com\/track\/[\w]+(?:\?.*)?$/,
            playlist: /^https?:\/\/open\.spotify\.com\/playlist\/[\w]+(?:\?.*)?$/,
            album: /^https?:\/\/open\.spotify\.com\/album\/[\w]+(?:\?.*)?$/,
            any: /^https?:\/\/open\.spotify\.com\//
        }
    },

    /**
     * Detect platform from URL
     * @param {string} url - The URL to analyze
     * @returns {object|null} Platform info or null
     */
    detectPlatform(url) {
        if (!url || typeof url !== 'string') return null;

        url = url.trim();



        // Spotify
        if (this.patterns.spotify.any.test(url)) {
            if (this.patterns.spotify.playlist.test(url)) {
                return { platform: 'spotify', type: 'playlist' };
            }
            if (this.patterns.spotify.album.test(url)) {
                return { platform: 'spotify', type: 'album' };
            }
            if (this.patterns.spotify.track.test(url)) {
                return { platform: 'spotify', type: 'track' };
            }
            return { platform: 'spotify', type: 'unknown' };
        }

        return null;
    },

    /**
     * Extract ID from Spotify URL
     * @param {string} url - Spotify URL
     * @returns {string|null} Track/Playlist/Album ID
     */
    extractSpotifyId(url) {
        const match = url.match(/\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
        return match ? match[2] : null;
    },

    /**
     * Format seconds to MM:SS
     * @param {number|string} seconds 
     * @returns {string}
     */
    formatDuration(seconds) {
        if (!seconds || seconds === '?') return '?';
        const s = parseInt(seconds);
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Parse YouTube's YYYYMMDD date to timestamp
     * @param {string} dateStr 
     * @returns {number|null}
     */
    parseYoutubeDate(dateStr) {
        if (!dateStr || dateStr.length !== 8) return null;
        try {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return new Date(`${year}-${month}-${day}`).getTime();
        } catch {
            return null;
        }
    },

    /**
     * Show status message
     * @param {string} message - Message to display
     * @param {string} type - Message type (info, success, error, warning)
     */
    showStatus(message, type = 'info') {
        const container = document.getElementById('status-container');
        if (!container) return;

        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        const statusEl = document.createElement('div');
        statusEl.className = `status-message ${type}`;
        statusEl.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;

        // Remove old messages of same type
        const oldMessages = container.querySelectorAll(`.status-message.${type}`);
        oldMessages.forEach(msg => msg.remove());

        container.appendChild(statusEl);

        // Auto-remove after delay
        if (type !== 'error') {
            setTimeout(() => {
                statusEl.style.opacity = '0';
                statusEl.style.transform = 'translateY(-10px)';
                setTimeout(() => statusEl.remove(), 300);
            }, 5000);
        }
    },

    /**
     * Clear all status messages
     */
    clearStatus() {
        const container = document.getElementById('status-container');
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * Update progress bar with smooth simulation
     * @param {number} targetPercent - Target percentage (0-100)
     * @param {string} status - Optional status key for i18n
     * @param {number} duration - Animation duration in ms
     */
    updateProgress(targetPercent, status = '', duration = 500) {
        const container = document.getElementById('progress-container');
        const fill = document.getElementById('progress-fill');
        const percentEl = document.getElementById('progress-percent');
        const statusEl = document.getElementById('progress-status');

        if (container) container.style.display = 'block';

        if (status && statusEl) {
            statusEl.textContent = this.t(status) || status;
        }

        // Fix: Instantly reset to 0% when new task starts (small targetPercent indicates new download)
        if (targetPercent <= 15) {
            // Temporarily disable CSS transitions
            fill.style.transition = 'none';
            fill.style.width = '0%';
            if (percentEl) percentEl.textContent = '0%';

            // Force browser reflow to apply the change instantly
            fill.offsetWidth;

            // Re-enable CSS transition
            fill.style.transition = 'width 0.5s ease-out';
        }

        const currentPercent = parseFloat(fill.style.width) || 0;
        const start = performance.now();

        const animate = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

            const current = currentPercent + (targetPercent - currentPercent) * easeProgress;

            if (fill) fill.style.width = `${current}%`;
            if (percentEl) percentEl.textContent = `${Math.round(current)}%`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

        // Start a slow background "drift" if we reach the target but haven't finished
        // This makes the bar feel alive during long backend waits
        if (this.driftInterval) clearInterval(this.driftInterval);

        if (targetPercent < 100 && targetPercent >= 40) {
            this.driftInterval = setInterval(() => {
                const nowPercent = parseFloat(fill.style.width) || 0;
                if (nowPercent < 95) {
                    const nextPercent = nowPercent + 0.1;
                    if (fill) fill.style.width = `${nextPercent}%`;
                    if (percentEl) percentEl.textContent = `${Math.round(nextPercent)}%`;
                }
            }, 500);
        } else if (targetPercent === 100 || targetPercent === 0) {
            if (this.driftInterval) clearInterval(this.driftInterval);
        }
    },

    /**
     * Hide progress bar
     */
    hideProgress() {
        const container = document.getElementById('progress-container');
        if (container) container.style.display = 'none';
    },

    /**
     * Show/hide track info
     * @param {object} track - Track information
     */
    showTrackInfo(track) {
        // Clear status messages when showing track info (cleaner UI)
        this.clearStatus();

        const container = document.getElementById('track-info');
        if (!container) return;

        const cover = document.getElementById('track-cover');
        const title = document.getElementById('track-title');
        const artist = document.getElementById('track-artist');
        const type = document.getElementById('track-type');

        if (cover) cover.src = track.cover || '';
        if (title) title.textContent = track.title || 'Unknown Title';
        if (artist) artist.textContent = track.artist || 'Unknown Artist';
        if (type) type.textContent = this.t(track.type.toLowerCase()) || track.type;

        container.style.display = 'block';

        // Auto-fetch preview for audio player
        if (track.title && track.artist) {
            this.fetchAndSetupPreview(track.title, track.artist, track.duration);
        }
    },

    /**
     * Fetch preview and setup audio player
     * @param {string} title - Track title
     * @param {string} artist - Artist name
     * @param {number} duration - Track duration in seconds
     */
    async fetchAndSetupPreview(title, artist, duration) {
        try {
            const response = await fetch(`${Spotify.apiBase}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, artist, duration })
            });

            if (response.ok) {
                const preview = await response.json();
                if (preview.youtube_url) {
                    this.setupAudioPlayer(preview.youtube_url);
                }
            }
        } catch (error) {
            console.error('Preview fetch failed:', error);
            // Silently fail - audio player just won't show
        }
    },

    /**
     * Hide track info
     */
    hideTrackInfo() {
        const container = document.getElementById('track-info');
        if (container) container.style.display = 'none';
        this.hidePreview();
    },

    /**
     * Show preview loading state
     */
    showPreviewLoading() {
        const section = document.getElementById('preview-section');
        const status = document.getElementById('preview-status');
        const link = document.getElementById('preview-link');
        const audio = document.getElementById('preview-audio');

        if (section) section.style.display = 'block';
        if (status) {
            status.className = 'preview-status loading';
            status.textContent = this.t('previewLoading') || 'YouTube axtarılır...';
        }
        if (link) {
            link.textContent = '...';
            link.href = '#';
        }
        if (audio) audio.src = '';
    },

    /**
     * Show preview data
     * @param {object} preview - Preview data from API
     */
    showPreview(preview) {
        const section = document.getElementById('preview-section');
        const status = document.getElementById('preview-status');
        const link = document.getElementById('preview-link');
        const audio = document.getElementById('preview-audio');

        if (section) section.style.display = 'block';

        if (link && preview.youtube_url) {
            link.href = preview.youtube_url;
            link.textContent = preview.youtube_title || preview.youtube_url;

            // Enable audio player if YouTube URL is available
            this.setupAudioPlayer(preview.youtube_url);
        }

        if (audio && preview.preview_audio) {
            audio.src = `data:audio/mp3;base64,${preview.preview_audio}`;
            audio.style.display = 'block';
        } else if (audio) {
            audio.style.display = 'none';
        }

        if (status) {
            if (preview.duration_match === false) {
                status.className = 'preview-status error';
                status.textContent = this.t('previewDurationMismatch') || '⚠️ Müddət fərqli - yoxlayın!';
            } else {
                status.className = 'preview-status';
                status.textContent = '';
            }
        }
    },

    /**
     * Setup audio player with YouTube URL
     * @param {string} youtubeUrl - YouTube video URL
     */
    async setupAudioPlayer(youtubeUrl) {
        const playerControls = document.getElementById('audio-player-controls');
        const audioElement = document.getElementById('track-audio');
        const playBtn = document.getElementById('audio-play-btn');
        const progressBar = document.getElementById('audio-progress');
        const currentTimeEl = document.getElementById('audio-current-time');
        const durationEl = document.getElementById('audio-duration');
        const volumeSlider = document.getElementById('audio-volume');

        if (!playerControls || !audioElement || !playBtn) return;

        // Show player controls
        playerControls.style.display = 'flex';

        // Set initial volume (30%)
        if (volumeSlider) {
            audioElement.volume = 0.3;
        }

        try {
            // Fetch audio stream URL from backend
            const response = await fetch(`${Spotify.apiBase}/stream_audio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ youtube_url: youtubeUrl })
            });

            if (!response.ok) {
                throw new Error('Could not get audio stream');
            }

            const data = await response.json();

            // Set audio source to the proxied stream
            audioElement.src = data.audio_url;
            audioElement.load();

            console.log('[AudioPlayer] Stream ready:', data.title);

        } catch (error) {
            console.error('[AudioPlayer] Stream failed:', error);
            // Fallback: button will open YouTube
            audioElement.src = '';
        }

        // Format time helper
        const formatTime = (seconds) => {
            if (!seconds || isNaN(seconds)) return '0:00';
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // Update duration when metadata loads
        audioElement.onloadedmetadata = () => {
            if (durationEl && progressBar) {
                durationEl.textContent = formatTime(audioElement.duration);
                progressBar.max = audioElement.duration;
            }
        };

        // Update progress bar and time as audio plays
        audioElement.ontimeupdate = () => {
            if (currentTimeEl && progressBar) {
                currentTimeEl.textContent = formatTime(audioElement.currentTime);
                progressBar.value = audioElement.currentTime;
            }
        };

        // Seek functionality - user drags timeline
        if (progressBar) {
            progressBar.oninput = () => {
                audioElement.currentTime = progressBar.value;
            };
        }

        // Volume control
        if (volumeSlider) {
            volumeSlider.oninput = () => {
                audioElement.volume = volumeSlider.value / 100;
            };
        }

        // Setup play/pause button
        playBtn.onclick = async () => {
            if (!audioElement.src) {
                // No audio available, open YouTube
                window.open(youtubeUrl, '_blank');
                return;
            }

            if (audioElement.paused) {
                try {
                    await audioElement.play();
                    playBtn.classList.add('playing');
                    playBtn.querySelector('.audio-btn-text').textContent = 'Pause';
                    playBtn.querySelector('svg path').setAttribute('d', 'M6 4h4v16H6V4zm8 0h4v16h-4V4z'); // Pause icon
                } catch (err) {
                    console.error('Audio playback failed:', err);
                    // Fallback: Open YouTube in new tab
                    window.open(youtubeUrl, '_blank');
                }
            } else {
                audioElement.pause();
                playBtn.classList.remove('playing');
                playBtn.querySelector('.audio-btn-text').textContent = 'Play';
                playBtn.querySelector('svg path').setAttribute('d', 'M8 5v14l11-7z'); // Play icon
            }
        };

        // Reset button when audio ends
        audioElement.onended = () => {
            playBtn.classList.remove('playing');
            playBtn.querySelector('.audio-btn-text').textContent = 'Play';
            playBtn.querySelector('svg path').setAttribute('d', 'M8 5v14l11-7z');
            if (progressBar) progressBar.value = 0;
            if (currentTimeEl) currentTimeEl.textContent = '0:00';
        };
    },

    /**
     * Hide preview section
     */
    hidePreview() {
        const section = document.getElementById('preview-section');
        if (section) section.style.display = 'none';
    },

    /**
     * Show playlist with tracks
     * @param {object} playlist - Playlist information with tracks array
     */
    showPlaylist(playlist) {
        const container = document.getElementById('playlist-container');
        const titleEl = document.getElementById('playlist-title');
        const countEl = document.getElementById('playlist-count');
        const tracksEl = document.getElementById('playlist-tracks');

        if (!container || !tracksEl) return;

        if (titleEl) titleEl.textContent = playlist.title || 'Playlist';
        if (countEl) countEl.textContent = `${playlist.tracks?.length || 0} ${this.t('tracks')}`;

        tracksEl.innerHTML = '';

        playlist.tracks?.forEach((track, index) => {
            const trackEl = document.createElement('div');
            trackEl.className = 'playlist-track';
            trackEl.dataset.index = index;
            trackEl.dataset.url = track.url || '';
            trackEl.dataset.title = track.title || 'Unknown';
            trackEl.dataset.artist = track.artist || '';
            trackEl.dataset.duration = track.duration || '';

            trackEl.innerHTML = `
                <div class="track-main-row">
                    <input type="checkbox" class="track-checkbox" checked>
                    <span class="track-number">${index + 1}</span>
                    <span class="track-name">${track.title || 'Unknown'} - ${track.artist || ''}</span>
                    <button class="track-download-btn" data-index="${index}">📥</button>
                </div>
                <div class="track-preview" id="track-preview-${index}" style="display: none;">
                    <div class="preview-loading">${this.t('previewLoading')}</div>
                </div>
            `;

            // Add click handler to toggle preview
            const mainRow = trackEl.querySelector('.track-main-row');
            mainRow.addEventListener('click', (e) => {
                // Don't toggle if clicking checkbox or download button
                if (e.target.classList.contains('track-checkbox') ||
                    e.target.classList.contains('track-download-btn')) {
                    return;
                }
                this.toggleTrackPreview(index, track);
            });

            tracksEl.appendChild(trackEl);
        });

        container.style.display = 'block';
    },

    /**
     * Toggle preview section for a playlist track
     * @param {number} index - Track index
     * @param {object} track - Track data
     */
    async toggleTrackPreview(index, track) {
        const previewEl = document.getElementById(`track-preview-${index}`);
        if (!previewEl) return;

        // Toggle visibility
        if (previewEl.style.display === 'block') {
            previewEl.style.display = 'none';
            return;
        }

        previewEl.style.display = 'block';

        // Check if already loaded
        if (previewEl.dataset.loaded === 'true') {
            return;
        }

        // Show loading
        previewEl.innerHTML = `<div class="preview-loading">${this.t('previewLoading')}</div>`;

        try {
            const response = await fetch(`${Spotify.apiBase}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: track.title,
                    artist: track.artist,
                    duration: track.duration
                })
            });

            if (response.ok) {
                const preview = await response.json();
                previewEl.innerHTML = `
                    <div class="track-preview-content">
                        <div class="preview-row">
                            <span class="preview-icon">🎬</span>
                            <a href="${preview.youtube_url}" target="_blank" class="preview-link">${preview.youtube_title || 'YouTube'}</a>
                        </div>
                        ${preview.preview_audio ? `
                        <div class="preview-row">
                            <span class="preview-icon">🎵</span>
                            <audio controls class="track-preview-audio">
                                <source src="data:audio/mp3;base64,${preview.preview_audio}" type="audio/mp3">
                            </audio>
                        </div>
                        ` : ''}
                        <div class="preview-status ${preview.duration_match === false ? 'warning' : ''}">
                            ${preview.duration_match === false ? '⚠️ ' + this.t('previewDurationMismatch') : ''}
                        </div>
                    </div>
                `;
                previewEl.dataset.loaded = 'true';
            } else {
                previewEl.innerHTML = `<div class="preview-error">❌ ${this.t('trackNotFound')}</div>`;
            }
        } catch (error) {
            console.error('Preview error:', error);
            previewEl.innerHTML = `<div class="preview-error">❌ ${error.message}</div>`;
        }
    },

    /**
     * Hide playlist
     */
    hidePlaylist() {
        const container = document.getElementById('playlist-container');
        if (container) container.style.display = 'none';
    },

    /**
     * Update track download status in playlist
     * @param {number} index - Track index
     * @param {string} status - Status (downloading, downloaded, error)
     */
    updateTrackStatus(index, status) {
        const btn = document.querySelector(`.track-download-btn[data-index="${index}"]`);
        if (!btn) return;

        btn.classList.remove('downloading', 'downloaded');

        switch (status) {
            case 'downloading':
                btn.classList.add('downloading');
                btn.textContent = '⏳';
                break;
            case 'downloaded':
                btn.classList.add('downloaded');
                btn.textContent = '✅';
                break;
            case 'error':
                btn.textContent = '❌';
                break;
            default:
                btn.textContent = '⬇️';
        }
    },

    /**
     * Add to download history
     * @param {object} item - Download item info
     */
    addToHistory(item) {
        const history = this.getHistory();
        history.unshift({
            ...item,
            timestamp: Date.now()
        });

        // Keep only last 20 items
        const trimmed = history.slice(0, 20);
        localStorage.setItem('soundwave_history', JSON.stringify(trimmed));

        this.renderHistory();
    },

    /**
     * Get download history
     * @returns {array} History items
     */
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('soundwave_history') || '[]');
        } catch {
            return [];
        }
    },

    /**
     * Clear download history
     */
    clearHistory() {
        localStorage.removeItem('soundwave_history');
        this.renderHistory();
    },

    /**
     * Render history section
     */
    renderHistory() {
        const section = document.getElementById('history-section');
        const list = document.getElementById('history-list');
        const history = this.getHistory();

        if (!section || !list) return;

        if (history.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = '';

        history.slice(0, 10).forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'history-item';

            const icon = '🟢';
            const time = this.formatRelativeTime(item.timestamp);

            itemEl.innerHTML = `
                <span class="history-icon">${icon}</span>
                <span class="history-name">${item.artist ? item.artist + ' - ' : ''}${item.title || 'Unknown'}</span>
                <span class="history-time">${time}</span>
            `;

            list.appendChild(itemEl);
        });
    },

    /**
     * Format timestamp to relative time
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted time
     */
    formatRelativeTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return this.t('justNow');
        if (minutes < 60) return `${minutes} ${this.t('minutesAgo')}`;
        if (hours < 24) return `${hours} ${this.t('hoursAgo')}`;
        return `${days} ${this.t('daysAgo')}`;
    },

    /**
     * Set button loading state
     * @param {HTMLElement} btn - Button element
     * @param {boolean} loading - Loading state
     */
    setButtonLoading(btn, loading) {
        if (!btn) return;

        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    },

    /**
     * Update platform badges active state
     * @param {string} platform - Active platform (soundcloud, spotify, or null)
     */
    updateBadges(platform) {
        const spBadge = document.getElementById('badge-spotify');
        spBadge?.classList.toggle('active', platform === 'spotify');
    },

    /**
     * Sanitize filename
     * @param {string} name - Original filename
     * @returns {string} Sanitized filename
     */
    sanitizeFilename(name) {
        return name
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200);
    },

    /**
     * Trigger file download
     * @param {string} url - Download URL
     * @param {string} filename - Suggested filename
     */
    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },

    /**
     * Delay helper
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Add log entry to the console
     * @param {string} message - Message to log
     * @param {boolean} highlight - Whether to highlight the message
     */
    addLog(message, highlight = false) {
        const container = document.getElementById('log-container');
        if (!container) return;

        const time = new Date().toLocaleTimeString('az-AZ', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const entry = document.createElement('div');
        entry.className = 'log-entry';

        entry.innerHTML = `
            <span class="log-time">[${time}]</span>
            <span class="log-msg ${highlight ? 'highlight' : ''}">${message}</span>
        `;

        container.appendChild(entry);

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Clear all log entries
     */
    clearLogs() {
        const container = document.getElementById('log-container');
        if (container) {
            container.innerHTML = '';
        }
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
