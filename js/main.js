/**
 * SoundWave - Main Application
 * Handles UI interactions and orchestrates downloads
 */

(function () {
    'use strict';

    // DOM Elements
    const elements = {
        urlInput: document.getElementById('url-input'),
        clearBtn: document.getElementById('clear-btn'),
        downloadBtn: document.getElementById('download-btn'),
        selectAllBtn: document.getElementById('select-all-btn'),
        downloadAllBtn: document.getElementById('download-all-btn'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        playlistTracks: document.getElementById('playlist-tracks'),
        langBtns: document.querySelectorAll('.lang-btn')
    };

    // Current state
    let currentPlatform = null;
    let currentTracks = [];
    let currentTrackInfo = null;
    let currentPreviewUrl = null;  // YouTube URL from preview
    let isDownloading = false;

    /**
     * Initialize the application
     */
    function init() {
        // Initialize language
        const savedLang = localStorage.getItem('soundwave_lang') || 'az';
        Utils.setLanguage(savedLang);

        // Initialize theme
        let savedTheme = localStorage.getItem('soundwave_theme') || 'mint';
        if (savedTheme === 'blue') savedTheme = 'mint';
        setTheme(savedTheme);

        // Initialize quality
        const savedQuality = localStorage.getItem('soundwave_quality') || '320';
        setQuality(savedQuality);

        setupEventListeners();
        setupSettingsListeners();
        Utils.renderHistory();

        // Check server status on load and every 30 seconds
        checkServerStatus();
        setInterval(checkServerStatus, 30000);

        // Focus input on load
        elements.urlInput?.focus();
    }

    /**
     * Set theme
     */
    function setTheme(theme) {
        if (theme === 'mint') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('soundwave_theme', theme);

        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    /**
     * Set quality
     */
    function setQuality(quality) {
        window.selectedQuality = quality;
        localStorage.setItem('soundwave_quality', quality);

        // Update active button
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.quality === quality);
        });
    }

    /**
     * Setup settings panel listeners
     */
    function setupSettingsListeners() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsClose = document.getElementById('settings-close');

        settingsBtn?.addEventListener('click', () => {
            settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        });

        settingsClose?.addEventListener('click', () => {
            settingsPanel.style.display = 'none';
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => setTheme(btn.dataset.theme));
        });

        // Quality buttons
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', () => setQuality(btn.dataset.quality));
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPanel?.contains(e.target) && !settingsBtn?.contains(e.target)) {
                if (settingsPanel) settingsPanel.style.display = 'none';
            }
        });
    }

    /**
     * Check if backend server is online
     */
    async function checkServerStatus() {
        const statusEl = document.getElementById('server-status');
        const statusText = statusEl?.querySelector('.status-text');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${Spotify.apiBase}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                statusEl?.classList.remove('offline');
                if (statusText) statusText.textContent = Utils.t('serverOnline') || 'Server: Online';
            } else {
                throw new Error('Server error');
            }
        } catch (e) {
            statusEl?.classList.add('offline');
            if (statusText) statusText.textContent = Utils.t('serverOffline') || 'Server: Offline';
        }
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // URL Input changes
        elements.urlInput?.addEventListener('input', Utils.debounce(handleInputChange, 300));
        elements.urlInput?.addEventListener('paste', () => {
            setTimeout(() => handleInputChange(), 50);
        });

        // Clear button
        elements.clearBtn?.addEventListener('click', clearInput);

        // Download button
        elements.downloadBtn?.addEventListener('click', handleDownload);

        // Keyboard shortcuts
        elements.urlInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleDownload();
            }
        });

        // Select All button
        elements.selectAllBtn?.addEventListener('click', toggleSelectAll);

        // Download All button
        elements.downloadAllBtn?.addEventListener('click', downloadSelectedTracks);

        // Clear history button
        elements.clearHistoryBtn?.addEventListener('click', () => {
            Utils.clearHistory();
            Utils.showStatus(Utils.t('historyCleared'), 'info');
        });

        // Playlist track clicks (event delegation)
        elements.playlistTracks?.addEventListener('click', handleTrackClick);

        // Language switcher
        elements.langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.getAttribute('data-lang');
                Utils.setLanguage(lang);
                localStorage.setItem('soundwave_lang', lang);
            });
        });
    }

    /**
     * Handle input changes - detect platform
     */
    function handleInputChange() {
        const url = elements.urlInput?.value.trim() || '';

        if (!url) {
            currentPlatform = null;
            Utils.updateBadges(null);
            Utils.hideTrackInfo();
            Utils.hidePlaylist();
            Utils.clearStatus();
            return;
        }

        const detected = Utils.detectPlatform(url);

        if (detected) {
            currentPlatform = detected;
            Utils.updateBadges(detected.platform);

            const typeText = detected.type === 'playlist' ? 'Playlist' :
                detected.type === 'album' ? 'Album' :
                    detected.type === 'track' ? 'Track' : '';

            if (typeText) {
                Utils.showStatus(`Spotify ${Utils.t(typeText.toLowerCase())} ${Utils.t('detected') || 'aşkarlandı'}`, 'info');
            }

            // Auto-fetch metadata
            fetchMetadata(url, detected);
        } else {
            currentPlatform = null;
            Utils.updateBadges(null);

            if (url.length > 10) {
                Utils.showStatus(Utils.t('inputPlaceholder'), 'warning');
            }
        }
    }

    /**
     * Clear input field
     */
    function clearInput() {
        if (elements.urlInput) {
            elements.urlInput.value = '';
            elements.urlInput.focus();
        }

        currentPlatform = null;
        currentTracks = [];
        currentTrackInfo = null;

        Utils.updateBadges(null);
        Utils.clearStatus();
        Utils.hideTrackInfo();
        Utils.hidePlaylist();
        Utils.hideProgress();
    }

    /**
     * Fetch metadata for the URL
     * @param {string} url - The URL to fetch info for
     * @param {object} platformInfo - Detected platform info
     */
    async function fetchMetadata(url, platformInfo) {
        Utils.showStatus(Utils.t('statusFetching'), 'info');
        Utils.hideTrackInfo();
        Utils.hidePlaylist();

        try {
            let info;
            if (platformInfo.platform === 'spotify') {
                info = await Spotify.getInfo(url);
            }

            if (info) {
                if (info.type === 'playlist' || info.type === 'album') {
                    if (info.tracks) {
                        currentTracks = info.tracks;
                        Utils.showPlaylist({
                            title: info.title,
                            tracks: info.tracks,
                            platform: platformInfo.platform
                        });
                        Utils.showStatus(`${info.tracks.length} ${Utils.t('tracks')} ${Utils.t('found') || 'tapıldı'}`, 'success');
                    }
                } else {
                    // Single track
                    currentTrackInfo = info;
                    Utils.showTrackInfo({
                        title: info.title,
                        artist: info.artist,
                        cover: info.thumbnail,
                        type: 'Track'
                    });
                    Utils.showStatus(`${Utils.t('found') || 'Tapıldı'}: ${info.artist} - ${info.title}`, 'success');

                    // Fetch and show YouTube preview BEFORE download
                    currentPreviewUrl = null;  // Reset
                    Utils.showPreviewLoading();
                    fetch(`${Spotify.apiBase}/preview`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: info.title,
                            artist: info.artist,
                            duration: info.duration
                        })
                    })
                        .then(res => res.ok ? res.json() : null)
                        .then(preview => {
                            if (preview) {
                                currentPreviewUrl = preview.youtube_url;  // Save for download
                                Utils.showPreview(preview);
                            } else {
                                Utils.hidePreview();
                            }
                        })
                        .catch(() => Utils.hidePreview());
                }
            }
        } catch (error) {
            console.error('Metadata fetch error:', error);
            Utils.showStatus(`${Utils.t('statusError')}: ` + error.message, 'error');
        }
    }

    /**
     * Handle main download button click
     */
    async function handleDownload() {
        if (isDownloading) {
            Utils.showStatus(Utils.t('statusDownloading'), 'warning');
            return;
        }

        const url = elements.urlInput?.value.trim();

        if (!url) {
            Utils.showStatus(Utils.t('inputPlaceholder'), 'warning');
            elements.urlInput?.focus();
            return;
        }

        if (!currentPlatform) {
            Utils.showStatus(Utils.t('invalidLink'), 'error');
            return;
        }

        isDownloading = true;
        Utils.setButtonLoading(elements.downloadBtn, true);
        Utils.hideTrackInfo();
        Utils.hidePlaylist();
        Utils.clearLogs();

        try {
            let result;

            if (currentPlatform.platform === 'spotify') {
                if (currentPlatform.type === 'playlist') {
                    result = await Spotify.downloadPlaylist(url);
                } else if (currentPlatform.type === 'album') {
                    result = await Spotify.downloadAlbum(url);
                } else {
                    // Check if we have cached info 
                    let cached = null;
                    if (currentTrackInfo) {
                        // Normalize URLs for comparison (remove trailing slashes, query params like si=...)
                        const norm = (u) => u.split('?')[0].replace(/\/+$/, '');
                        if (norm(currentTrackInfo.url) === norm(url)) {
                            cached = currentTrackInfo;
                        }
                    }
                    result = await Spotify.downloadTrack(url, cached, currentPreviewUrl);
                }
            }

            // Store tracks if playlist
            if (result?.isPlaylist && result?.tracks) {
                currentTracks = result.tracks;
            }

        } catch (error) {
            console.error('Download error:', error);
            Utils.showStatus(`${Utils.t('statusError')}: ${error.message}`, 'error');
        } finally {
            isDownloading = false;
            Utils.setButtonLoading(elements.downloadBtn, false);
        }
    }

    /**
     * Toggle select all tracks in playlist
     */
    function toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.track-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(cb => {
            cb.checked = !allChecked;
        });

        elements.selectAllBtn.textContent = allChecked ? Utils.t('selectAll') : Utils.t('deselectAll');
    }

    /**
     * Download all selected tracks
     */
    async function downloadSelectedTracks() {
        const checkboxes = document.querySelectorAll('.track-checkbox:checked');
        const selectedIndices = Array.from(checkboxes).map(cb => {
            return parseInt(cb.closest('.playlist-track')?.dataset.index || '0');
        });

        if (selectedIndices.length === 0) {
            Utils.showStatus(Utils.t('noTracksSelected'), 'warning');
            return;
        }

        if (currentTracks.length === 0) {
            Utils.showStatus(Utils.t('noTracksFound'), 'error');
            return;
        }

        isDownloading = true;
        Utils.setButtonLoading(elements.downloadAllBtn, true);

        try {
            if (currentPlatform?.platform === 'spotify') {
                await Spotify.downloadAllTracks(currentTracks, selectedIndices);
            }
        } catch (error) {
            console.error('Batch download error:', error);
            Utils.showStatus(`Xəta: ${error.message}`, 'error');
        } finally {
            isDownloading = false;
            Utils.setButtonLoading(elements.downloadAllBtn, false);
        }
    }

    /**
     * Handle click on individual track in playlist
     * @param {Event} e - Click event
     */
    async function handleTrackClick(e) {
        const btn = e.target.closest('.track-download-btn');
        if (!btn) return;

        if (isDownloading) {
            Utils.showStatus(Utils.t('anotherDownloadInProgress'), 'warning');
            return;
        }

        const index = parseInt(btn.dataset.index);
        const track = currentTracks[index];

        if (!track) {
            Utils.showStatus(Utils.t('trackNotFound'), 'error');
            return;
        }

        isDownloading = true;

        // Reset error state if retrying
        btn.textContent = '⏳';
        btn.classList.remove('downloaded');

        try {
            if (currentPlatform?.platform === 'spotify') {
                await Spotify.downloadPlaylistTrack(index, track);
            }
        } catch (error) {
            console.error('Track download error:', error);
            Utils.updateTrackStatus(index, 'error');
        } finally {
            isDownloading = false;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
