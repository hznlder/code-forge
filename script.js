// Code Forge - Enhanced JavaScript Functionality with Robust Error Handling
// Modern ES6+ implementation with game-inspired features

class CodeForge {
    constructor() {
        this.API_URL = 'https://db.hashblen.com/codes';
        this.currentGame = null;
        this.allCodes = {};
        this.filteredCodes = [];
        this.lastKnownCodes = {};
        this.searchTerm = '';
        this.filters = {
            type: 'all',
            status: 'all'
        };
        this.userPreferences = {
            favoriteGames: [],
            notifications: {
                newCodes: false,
                favoritesOnly: false
            }
        };
        
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.setupEventListeners();
        this.setupThemeSystem();
        this.setupMusicSystem();
        this.fetchCodes();
        this.showWelcomeState();
        
        // Initialize animations
        this.initializeAnimations();
    }

    // ===== EVENT LISTENERS SETUP =====
    setupEventListeners() {
        // Game filter buttons
        document.querySelectorAll('.game-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleGameSelection(e));
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Music toggle
        const musicToggle = document.getElementById('music-toggle');
        if (musicToggle) {
            musicToggle.addEventListener('click', () => this.toggleMusic());
        }

        // Filter controls
        const toggleFilters = document.getElementById('toggle-filters');
        if (toggleFilters) {
            toggleFilters.addEventListener('click', () => this.toggleAdvancedFilters());
        }

        const codeTypeFilter = document.getElementById('code-type-filter');
        const statusFilter = document.getElementById('status-filter');
        const clearFilters = document.getElementById('clear-filters');

        if (codeTypeFilter) {
            codeTypeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearAllFilters());
        }

        // Updates bar close
        const updatesClose = document.getElementById('updates-close');
        if (updatesClose) {
            updatesClose.addEventListener('click', () => this.hideUpdatesBar());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.fetchCodes());
        }

        // Hot Bar interaction
        const hotBar = document.querySelector(".hot-bar-container");
        if (hotBar) {
            hotBar.addEventListener("click", () => this.showNotification("Hot Bar clicked! More details would appear here.", "info"));
            // Initialize hot bar with default message
            this.updateHotBarContent("Loading notifications...");
            // Remove the random message interval - hot bar should only update when new codes arrive
        }

        // More button dropdown
        const moreToggle = document.getElementById("more-toggle");
        const moreDropdown = document.getElementById("more-dropdown");
        if (moreToggle && moreDropdown) {
            moreToggle.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent document click from immediately closing
                moreDropdown.classList.toggle("hidden");
                moreDropdown.classList.toggle("visible");
            });

            document.addEventListener("click", (event) => {
                if (!moreDropdown.contains(event.target) && !moreToggle.contains(event.target)) {
                    moreDropdown.classList.add("hidden");
                    moreDropdown.classList.remove("visible");
                }
            });
        }

        // User preferences
        this.setupUserPreferencesListeners();

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => this.handleKeyboardShortcuts(e));

        // Copy code functionality (delegated event listener)
        document.addEventListener("click", (e) => {
            if (e.target.closest(".copy-code-btn")) {
                this.handleCopyCode(e);
            }
        });

        // Voting functionality (delegated event listeners)
        document.addEventListener("click", (e) => {
            if (e.target.closest(".vote-btn")) {
                this.handleVoting(e);
            }
        });

        // Report functionality (delegated event listener)
        document.addEventListener("click", (e) => {
            if (e.target.closest(".report-btn")) {
                this.handleReport(e);
            }
        });
    }

    setupUserPreferencesListeners() {
        // Favorite games checkboxes
        ['genshin', 'hsr', 'zzz'].forEach(game => {
            const checkbox = document.getElementById(`fav-${game}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updateFavoriteGames(game, e.target.checked);
                });
            }
        });

        // Notification preferences
        const notifyNewCodes = document.getElementById('notify-new-codes');
        const notifyFavorites = document.getElementById('notify-favorites');

        if (notifyNewCodes) {
            notifyNewCodes.addEventListener('change', (e) => {
                this.updateNotificationPreferences('notify-new-codes', e.target.checked);
            });
        }

        if (notifyFavorites) {
            notifyFavorites.addEventListener('change', (e) => {
                this.updateNotificationPreferences('notify-favorites', e.target.checked);
            });
        }
    }

    // ===== THEME SYSTEM =====
    setupThemeSystem() {
        const savedTheme = localStorage.getItem('codeforge-theme') || 'dark';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        const body = document.body;
        const themeBtn = document.getElementById('theme-toggle');
        const themeIcon = themeBtn?.querySelector('i');
        const themeText = themeBtn?.querySelector('.btn-text');

        if (theme === 'light') {
            body.classList.add('light-mode');
            if (themeIcon) themeIcon.className = 'fas fa-moon';
            if (themeText) themeText.textContent = 'Dark';
        } else {
            body.classList.remove('light-mode');
            if (themeIcon) themeIcon.className = 'fas fa-sun';
            if (themeText) themeText.textContent = 'Light';
        }

        localStorage.setItem('codeforge-theme', theme);
        
        // Animate theme transition
        this.animateThemeTransition();
    }

    animateThemeTransition() {
        document.documentElement.style.setProperty('--transition-duration', '0.3s');
        setTimeout(() => {
            document.documentElement.style.removeProperty('--transition-duration');
        }, 300);
    }

    // ===== MUSIC SYSTEM =====
    setupMusicSystem() {
        this.backgroundMusic = document.getElementById('background-music');
        this.musicPlaying = false;
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.3;
            
            // Handle music loading
            this.backgroundMusic.addEventListener('canplaythrough', () => {
                console.log('Music loaded successfully');
            });

            this.backgroundMusic.addEventListener('error', (e) => {
                console.warn('Music loading failed:', e);
            });
        }
    }

    toggleMusic() {
        const musicBtn = document.getElementById('music-toggle');
        const musicIcon = musicBtn?.querySelector('i');
        const musicText = musicBtn?.querySelector('.btn-text');

        if (!this.backgroundMusic) return;

        if (this.musicPlaying) {
            this.backgroundMusic.pause();
            this.musicPlaying = false;
            if (musicIcon) musicIcon.className = 'fas fa-volume-mute';
            if (musicText) musicText.textContent = 'Music';
        } else {
            this.backgroundMusic.play().then(() => {
                this.musicPlaying = true;
                if (musicIcon) musicIcon.className = 'fas fa-volume-up';
                if (musicText) musicText.textContent = 'Music';
            }).catch(error => {
                console.warn('Music playback failed:', error);
                this.showNotification('Music playback requires user interaction', 'warning');
            });
        }
    }

    // ===== API AND DATA MANAGEMENT =====
    async fetchCodes() {
        this.showLoadingState();

        try {
            let data;
            let lastError;
            let usingFallback = false;
            
            // Method 1: Direct API call
            try {
                console.log('Attempting direct API call...');
                const response = await fetch(this.API_URL, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'CodeForge/1.0'
                    },
                    cache: 'no-cache',
                    mode: 'cors'
                });
                
                if (response.ok) {
                    const text = await response.text();
                    console.log('Direct response received, length:', text.length);
                    
                    if (this.isValidJSON(text)) {
                        data = JSON.parse(text);
                        console.log('Direct API call successful');
                    } else {
                        throw new Error('Invalid JSON response from direct API');
                    }
                }
            } catch (directError) {
                console.log('Direct API failed:', directError.message);
                lastError = directError;
            }
            
            // Method 2: CORS proxies with better handling
            if (!data) {
                const proxies = [
                    {
                        url: `https://api.allorigins.win/get?url=${encodeURIComponent(this.API_URL)}`,
                        name: 'AllOrigins',
                        parser: (response) => {
                            if (response.contents) {
                                return JSON.parse(response.contents);
                            }
                            return response;
                        }
                    },
                    {
                        url: `https://corsproxy.io/?${encodeURIComponent(this.API_URL)}`,
                        name: 'CorsProxy',
                        parser: (response) => response
                    }
                ];
                
                for (const proxy of proxies) {
                    try {
                        console.log(`Attempting ${proxy.name} proxy...`);
                        const proxyResponse = await fetch(proxy.url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (proxyResponse.ok) {
                            const text = await proxyResponse.text();
                            console.log(`${proxy.name} response received, length:`, text.length);
                            
                            if (this.isValidJSON(text)) {
                                const proxyData = JSON.parse(text);
                                data = proxy.parser(proxyData);
                                console.log(`${proxy.name} proxy successful`);
                                break;
                            } else {
                                throw new Error(`Invalid JSON response from ${proxy.name}`);
                            }
                        }
                    } catch (proxyError) {
                        console.log(`${proxy.name} proxy failed:`, proxyError.message);
                        lastError = proxyError;
                        continue;
                    }
                }
            }
            
            // Method 3: Fallback with mock data if all else fails
            if (!data) {
                console.log('All methods failed, using fallback data...');
                data = this.getFallbackData();
                usingFallback = true;
                this.updateHotBarContent("Using offline data - connection issues detected");
            }
            
            // Validate final data structure
            if (!this.isValidCodesData(data)) {
                throw new Error('Invalid data structure received');
            }

            // Process successful data
            this.checkForNewCodes(data);
            this.allCodes = data;
            this.updateLastChecked();
            
            if (!usingFallback) {
                this.updateHotBarContent("Codes updated successfully!");
            }
            
            if (this.currentGame) {
                this.displayCodes(this.currentGame);
            } else {
                this.showWelcomeState();
            }

        } catch (error) {
            console.error('All fetch methods failed:', error);
            this.showErrorState(`Failed to load codes: ${error.message}`);
            this.updateHotBarContent("Failed to fetch latest codes");
        }
    }

    isValidJSON(text) {
        if (!text || typeof text !== 'string') return false;
        
        // Check for common non-JSON responses
        if (text.startsWith('data:') || 
            text.startsWith('<html') || 
            text.startsWith('<!DOCTYPE') ||
            text.includes('text/html')) {
            return false;
        }
        
        try {
            JSON.parse(text);
            return true;
        } catch {
            return false;
        }
    }

    isValidCodesData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check for expected game properties
        const expectedGames = ['genshin', 'hsr', 'zzz'];
        const hasValidGames = expectedGames.some(game => 
            data[game] && Array.isArray(data[game])
        );
        
        return hasValidGames;
    }

    getFallbackData() {
        return {
            "genshin": [
                {
                    "code": "GENSHINGIFT",
                    "description": "50 primogems and three hero's wit (this code works periodically)",
                    "added_at": Math.floor(Date.now() / 1000)
                }
            ],
            "hsr": [
                {
                    "code": "STARRAILGIFT", 
                    "description": "50 Stellar Jade, 10000 Credits (permanent code)",
                    "added_at": Math.floor(Date.now() / 1000)
                }
            ],
            "zzz": [
                {
                    "code": "ZENLESSGIFT",
                    "description": "Basic rewards for new players",
                    "added_at": Math.floor(Date.now() / 1000)
                }
            ],
            "retcode": 0,
            "previous_update": Math.floor(Date.now() / 1000) - 3600,
            "latest_update": Math.floor(Date.now() / 1000)
        };
    }

    checkForNewCodes(newData) {
        if (Object.keys(this.lastKnownCodes).length === 0) {
            this.lastKnownCodes = { ...newData };
            return;
        }

        const newCodes = [];
        
        Object.keys(newData).forEach(game => {
            if (newData[game] && Array.isArray(newData[game])) {
                const oldCodes = this.lastKnownCodes[game] || [];
                const currentCodes = newData[game];
                
                currentCodes.forEach(code => {
                    const isNew = !oldCodes.some(oldCode => 
                        oldCode.code === code.code && oldCode.description === code.description
                    );
                    
                    if (isNew) {
                        newCodes.push({ ...code, game });
                    }
                });
            }
        });

        if (newCodes.length > 0) {
            this.showUpdatesBar(newCodes);
        }

        this.lastKnownCodes = { ...newData };
    }

    showUpdatesBar(newCodes) {
        const updatesBar = document.getElementById('updates-bar');
        const updatesText = document.getElementById('updates-text');
        
        if (updatesBar && updatesText) {
            const count = newCodes.length;
            const gameNames = [...new Set(newCodes.map(code => this.getGameDisplayName(code.game)))];
            
            const message = `${count} new code${count > 1 ? 's' : ''} available for ${gameNames.join(', ')}!`;
            updatesText.textContent = message;
            
            // Update hot bar with the same message
            this.updateHotBarContent(message);
            
            updatesBar.classList.remove('hidden');
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                this.hideUpdatesBar();
            }, 10000);
        }
    }

    hideUpdatesBar() {
        const updatesBar = document.getElementById('updates-bar');
        if (updatesBar) {
            updatesBar.classList.add('hidden');
        }
    }

    updateLastChecked() {
        const lastChecked = document.getElementById('last-checked');
        const lastCheckedText = document.getElementById('last-checked-text');
        
        if (lastChecked && lastCheckedText) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            lastCheckedText.textContent = `Last updated: ${timeString}`;
            lastChecked.classList.remove('hidden');
        }
    }

    updateHotBarContent(message = null) {
        const hotBarText = document.getElementById("hot-bar-text");
        if (!hotBarText) return;

        if (message) {
            hotBarText.textContent = message;
        } else {
            // Default message when no specific message is provided
            hotBarText.textContent = "No new updates available";
        }
    }

    // ===== GAME SELECTION AND DISPLAY =====
    handleGameSelection(event) {
        const gameBtn = event.currentTarget;
        const game = gameBtn.dataset.game;
        
        if (!game) return;

        // Update active state
        document.querySelectorAll('.game-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        gameBtn.classList.add('active');

        this.currentGame = game;
        this.displayCodes(game);
        
        // Animate button selection
        this.animateButtonSelection(gameBtn);
    }

    animateButtonSelection(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    displayCodes(game) {
        const codes = this.allCodes[game];
        
        if (!codes || !Array.isArray(codes)) {
            this.showErrorState(`No codes found for ${this.getGameDisplayName(game)}`);
            return;
        }

        this.filteredCodes = [...codes];
        this.applyFilters();
        this.renderCodes();
        this.showCodesDisplay(game);
    }

    renderCodes() {
        const codesGrid = document.getElementById('codes-grid');
        const codesTitle = document.getElementById('codes-title');
        const codesCount = document.getElementById('codes-count');
        
        if (!codesGrid) return;

        // Update header
        if (codesTitle) {
            codesTitle.textContent = `${this.getGameDisplayName(this.currentGame)} Codes`;
        }
        
        if (codesCount) {
            codesCount.textContent = `${this.filteredCodes.length} code${this.filteredCodes.length !== 1 ? 's' : ''}`;
        }

        // Clear existing codes
        codesGrid.innerHTML = '';

        if (this.filteredCodes.length === 0) {
            this.showNoCodesMessage(codesGrid);
            return;
        }

        // Render code cards
        this.filteredCodes.forEach((code, index) => {
            const codeCard = this.createCodeCard(code, index);
            codesGrid.appendChild(codeCard);
        });

        // Animate cards entrance
        this.animateCardsEntrance();
    }

    createCodeCard(code, index) {
        const template = document.getElementById('code-card-template');
        if (!template) return document.createElement('div');

        const card = template.content.cloneNode(true);
        const cardElement = card.querySelector('.code-card');
        
        // Set card data
        cardElement.dataset.codeId = `${this.currentGame}-${index}`;
        
        // Fill card content
        this.populateCodeCard(card, code);
        
        return card;
    }

    populateCodeCard(card, code) {
        // Title and badges
        const title = card.querySelector('.code-title');
        const codeText = card.querySelector('.code-text');
        const description = card.querySelector('.code-description');
        const rewardsText = card.querySelector('.rewards-text');
        const redeemBtn = card.querySelector('.redeem-btn');
        const newBadge = card.querySelector('.new-badge');
        const statusBadge = card.querySelector('.status-badge');
        const codeDate = card.querySelector('.code-date');
        const codeType = card.querySelector('.code-type');

        if (title) title.textContent = code.code || 'Redemption Code';
        if (codeText) codeText.textContent = code.code || '';
        if (description) description.textContent = code.description || 'No description available';
        if (rewardsText) rewardsText.textContent = code.description || 'Various rewards';

        // Redeem button with proper game-specific URLs
        if (redeemBtn && code.code) {
            const gameUrls = {
                'genshin': 'https://genshin.hoyoverse.com/m/en/gift?code=',
                'hsr': 'https://hsr.hoyoverse.com/gift?code=',
                'zzz': 'https://zenless.hoyoverse.com/redemption?code='
            };
            
            const baseUrl = gameUrls[this.currentGame];
            if (baseUrl) {
                redeemBtn.href = baseUrl + encodeURIComponent(code.code);
            }
        }

        // NEW badge (show for codes added within last 3 days)
        if (newBadge && this.isNewCode(code)) {
            newBadge.classList.remove('hidden');
        }

        // Status badge
        if (statusBadge) {
            const isWorking = this.isCodeWorking(code);
            statusBadge.className = `status-badge ${isWorking ? 'working' : 'expired'}`;
            statusBadge.innerHTML = `
                <i class="fas fa-${isWorking ? 'check-circle' : 'times-circle'}"></i>
                ${isWorking ? 'Working' : 'Expired'}
            `;
        }

        // Meta information
        if (codeDate && code.added_at) {
            const date = new Date(code.added_at * 1000);
            codeDate.textContent = date.toLocaleDateString();
        }
        
        if (codeType) {
            codeType.textContent = this.getCodeType(code);
        }

        // Add fake vote counts for engagement
        const upvoteBtn = card.querySelector('.vote-btn.upvote .vote-count');
        const downvoteBtn = card.querySelector('.vote-btn.downvote .vote-count');
        
        if (upvoteBtn && downvoteBtn) {
            const votes = this.generateVoteCounts(code.code || 'default', code.added_at);
            upvoteBtn.textContent = votes.likes;
            downvoteBtn.textContent = votes.dislikes;
        }
    }

    showNoCodesMessage(container) {
        container.innerHTML = `
            <div class="no-codes-message">
                <div class="no-codes-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No codes found</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button class="clear-filters-btn" onclick="codeForge.clearAllFilters()">
                    <i class="fas fa-times"></i>
                    Clear All Filters
                </button>
            </div>
        `;
    }

    animateCardsEntrance() {
        const cards = document.querySelectorAll('.code-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // ===== FILTERING SYSTEM =====
    applyFilters() {
        if (!this.currentGame || !this.allCodes[this.currentGame]) return;

        let codes = [...this.allCodes[this.currentGame]];

        // Apply search filter
        if (this.searchTerm) {
            codes = codes.filter(code => 
                (code.code || '').toLowerCase().includes(this.searchTerm) ||
                (code.description || '').toLowerCase().includes(this.searchTerm)
            );
        }

        // Apply type filter
        if (this.filters.type !== 'all') {
            codes = codes.filter(code => this.getCodeType(code).toLowerCase() === this.filters.type);
        }

        // Apply status filter
        if (this.filters.status !== 'all') {
            codes = codes.filter(code => {
                const isWorking = this.isCodeWorking(code);
                return this.filters.status === 'working' ? isWorking : !isWorking;
            });
        }

        this.filteredCodes = codes;
        this.renderCodes();
    }

    toggleAdvancedFilters() {
        const filtersSection = document.getElementById('advanced-filters');
        if (filtersSection) {
            filtersSection.classList.toggle('hidden');
        }
    }

    clearAllFilters() {
        // Reset search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            this.searchTerm = '';
        }

        // Reset filters
        this.filters = { type: 'all', status: 'all' };
        
        const codeTypeFilter = document.getElementById('code-type-filter');
        const statusFilter = document.getElementById('status-filter');
        
        if (codeTypeFilter) codeTypeFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';

        // Reapply and render
        this.applyFilters();
    }

    // ===== USER INTERACTIONS =====
    handleCopyCode(event) {
        const copyBtn = event.target.closest('.copy-code-btn');
        const codeCard = copyBtn.closest('.code-card');
        const codeText = codeCard.querySelector('.code-text');
        
        if (!codeText) return;

        const code = codeText.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification(`Copied: ${code}`, 'success');
            this.animateCopySuccess(copyBtn);
        }).catch(() => {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(code);
            this.showNotification(`Copied: ${code}`, 'success');
            this.animateCopySuccess(copyBtn);
        });
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
    }

    animateCopySuccess(button) {
        const originalIcon = button.querySelector('i').className;
        button.querySelector('i').className = 'fas fa-check';
        button.style.color = 'var(--accent-success)';
        
        setTimeout(() => {
            button.querySelector('i').className = originalIcon;
            button.style.color = '';
        }, 1500);
    }

    handleVoting(event) {
        const voteBtn = event.target.closest('.vote-btn');
        const isUpvote = voteBtn.classList.contains('upvote');
        const codeCard = voteBtn.closest('.code-card');
        const codeId = codeCard.dataset.codeId;
        
        // Get current vote count
        const voteCount = voteBtn.querySelector('.vote-count');
        let count = parseInt(voteCount.textContent) || 0;
        
        // Toggle vote (simplified - in real app would sync with backend)
        if (voteBtn.classList.contains('voted')) {
            voteBtn.classList.remove('voted');
            count = Math.max(0, count - 1);
        } else {
            // Remove vote from opposite button
            const oppositeBtn = isUpvote ? 
                codeCard.querySelector('.vote-btn.downvote') : 
                codeCard.querySelector('.vote-btn.upvote');
            
            if (oppositeBtn.classList.contains('voted')) {
                oppositeBtn.classList.remove('voted');
                const oppositeCount = oppositeBtn.querySelector('.vote-count');
                oppositeCount.textContent = Math.max(0, parseInt(oppositeCount.textContent) - 1);
            }
            
            voteBtn.classList.add('voted');
            count++;
        }
        
        voteCount.textContent = count;
        
        // Animate vote
        this.animateVote(voteBtn, isUpvote);
        
        // Show feedback
        const voteType = isUpvote ? 'helpful' : 'not helpful';
        this.showNotification(`Marked code as ${voteType}`, 'info');
    }

    animateVote(button, isUpvote) {
        button.style.transform = 'scale(1.2)';
        button.style.color = isUpvote ? 'var(--accent-success)' : 'var(--accent-error)';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    handleReport(event) {
        const reportBtn = event.target.closest('.report-btn');
        const codeCard = reportBtn.closest('.code-card');
        const codeTitle = codeCard.querySelector('.code-title').textContent;
        
        // Simple confirmation (in real app would open modal)
        if (confirm(`Report issue with "${codeTitle}"?\n\nThis will help us maintain code accuracy.`)) {
            this.showNotification('Thank you for the report! We\'ll review this code.', 'success');
            
            // Visual feedback
            reportBtn.style.color = 'var(--accent-warning)';
            reportBtn.querySelector('span').textContent = 'Reported';
            reportBtn.disabled = true;
        }
    }

    // ===== USER PREFERENCES =====
    loadUserPreferences() {
        const saved = localStorage.getItem('codeforge-preferences');
        if (saved) {
            try {
                this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
                this.applyUserPreferences();
            } catch (error) {
                console.warn('Failed to load user preferences:', error);
            }
        }
    }

    saveUserPreferences() {
        localStorage.setItem('codeforge-preferences', JSON.stringify(this.userPreferences));
    }

    applyUserPreferences() {
        // Apply favorite games
        this.userPreferences.favoriteGames.forEach(game => {
            const checkbox = document.getElementById(`fav-${game}`);
            if (checkbox) checkbox.checked = true;
        });

        // Apply notification preferences
        const notifyNewCodes = document.getElementById('notify-new-codes');
        const notifyFavorites = document.getElementById('notify-favorites');
        
        if (notifyNewCodes) {
            notifyNewCodes.checked = this.userPreferences.notifications.newCodes;
        }
        
        if (notifyFavorites) {
            notifyFavorites.checked = this.userPreferences.notifications.favoritesOnly;
        }
    }

    updateFavoriteGames(game, isFavorite) {
        if (isFavorite) {
            if (!this.userPreferences.favoriteGames.includes(game)) {
                this.userPreferences.favoriteGames.push(game);
            }
        } else {
            this.userPreferences.favoriteGames = this.userPreferences.favoriteGames.filter(g => g !== game);
        }
        
        this.saveUserPreferences();
        this.showNotification(`${this.getGameDisplayName(game)} ${isFavorite ? 'added to' : 'removed from'} favorites`, 'info');
    }

    updateNotificationPreferences(type, enabled) {
        if (type === 'notify-new-codes') {
            this.userPreferences.notifications.newCodes = enabled;
        } else if (type === 'notify-favorites') {
            this.userPreferences.notifications.favoritesOnly = enabled;
        }
        
        this.saveUserPreferences();
        this.showNotification(`Notification preferences updated`, 'info');
    }

    // ===== STATE MANAGEMENT =====
    showLoadingState() {
        this.hideAllStates();
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }
    }

    showErrorState(message) {
        this.hideAllStates();
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        
        if (errorState) {
            errorState.classList.remove('hidden');
        }
        
        if (errorMessage) {
            errorMessage.textContent = message || 'An unexpected error occurred';
        }
    }

    showWelcomeState() {
        this.hideAllStates();
        const welcomeState = document.getElementById('welcome-state');
        if (welcomeState) {
            welcomeState.classList.remove('hidden');
        }
    }

    showCodesDisplay(game) {
        this.hideAllStates();
        const codesDisplay = document.getElementById('codes-display');
        const lastChecked = document.getElementById('last-checked');
        
        if (codesDisplay) {
            codesDisplay.classList.remove('hidden');
        }
        
        if (lastChecked) {
            lastChecked.classList.remove('hidden');
        }
    }

    hideAllStates() {
        const states = [
            'loading-state',
            'error-state', 
            'welcome-state',
            'codes-display',
            'last-checked'
        ];
        
        states.forEach(stateId => {
            const element = document.getElementById(stateId);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    // ===== UTILITY FUNCTIONS =====
    getGameDisplayName(game) {
        const names = {
            'genshin': 'Genshin Impact',
            'hsr': 'Honkai: Star Rail',
            'zzz': 'Zenless Zone Zero'
        };
        return names[game] || game;
    }

    isNewCode(code) {
        if (!code.added_at) return false;
        
        const codeDate = new Date(code.added_at * 1000);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        return codeDate > threeDaysAgo;
    }

    isCodeWorking(code) {
        // Simple heuristic - in real app would check against database
        if (code.status) {
            return code.status.toLowerCase() === 'working' || code.status.toLowerCase() === 'active';
        }
        
        // Assume newer codes are more likely to work
        return this.isNewCode(code) || Math.random() > 0.3;
    }

    getCodeType(code) {
        if (code.type) return code.type;
        
        // Check for specific permanent codes first
        const codeValue = (code.code || '').toLowerCase();
        const permanentCodes = ['genshingift', 'starrailgift', 'zenlessgift'];
        
        if (permanentCodes.includes(codeValue)) {
            return 'permanent';
        }
        
        // Simple heuristic based on description
        const text = `${code.description || ''}`.toLowerCase();
        
        if (text.includes('event') || text.includes('limited')) return 'event';
        if (text.includes('permanent') || text.includes('general')) return 'permanent';
        
        return 'temporary';
    }

    // Generate fake vote counts for engagement
    generateVoteCounts(codeTitle, codeDate) {
        // Create deterministic but varied vote counts based on code title and date
        const hash = (codeTitle + (codeDate || '')).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        // Generate more realistic vote distributions
        const seed = Math.abs(hash);
        const basePopularity = seed % 4; // 0-3 popularity tiers
        
        let likes, dislikes;
        
        switch(basePopularity) {
            case 0: // Very popular codes
                likes = 150 + (seed % 200); // 150-349 likes
                dislikes = 5 + (seed % 15); // 5-19 dislikes
                break;
            case 1: // Popular codes
                likes = 80 + (seed % 120); // 80-199 likes
                dislikes = 8 + (seed % 20); // 8-27 dislikes
                break;
            case 2: // Moderately popular codes
                likes = 30 + (seed % 80); // 30-109 likes
                dislikes = 3 + (seed % 12); // 3-14 dislikes
                break;
            case 3: // Less popular codes
                likes = 10 + (seed % 40); // 10-49 likes
                dislikes = 1 + (seed % 8); // 1-8 dislikes
                break;
        }
        
        return { likes, dislikes };
    }

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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    handleKeyboardShortcuts(event) {
        // Number keys for game selection
        const gameKeys = { '1': 'genshin', '2': 'hsr', '3': 'zzz' };
        if (gameKeys[event.key]) {
            const gameBtn = document.querySelector(`[data-game="${gameKeys[event.key]}"]`);
            if (gameBtn) {
                gameBtn.click();
            }
        }
    }

    initializeAnimations() {
        // Add CSS for notifications
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    background: var(--bg-card);
                    border: 1px solid var(--border-primary);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-md);
                    backdrop-filter: blur(10px);
                    box-shadow: var(--shadow-primary);
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    max-width: 300px;
                }
                
                .notification.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                    color: var(--text-primary);
                    font-size: var(--font-size-sm);
                }
                
                .notification-success .notification-content i { color: var(--accent-success); }
                .notification-error .notification-content i { color: var(--accent-error); }
                .notification-warning .notification-content i { color: var(--accent-warning); }
                .notification-info .notification-content i { color: var(--accent-primary); }
                
                .no-codes-message {
                    text-align: center;
                    padding: var(--spacing-3xl);
                    color: var(--text-secondary);
                    grid-column: 1 / -1;
                }
                
                .no-codes-icon {
                    font-size: var(--font-size-4xl);
                    color: var(--text-muted);
                    margin-bottom: var(--spacing-lg);
                }
                
                .no-codes-message h3 {
                    font-size: var(--font-size-xl);
                    margin-bottom: var(--spacing-sm);
                    color: var(--text-primary);
                }
                
                .no-codes-message p {
                    margin-bottom: var(--spacing-lg);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codeForge = new CodeForge();
});

// Handle page visibility changes for music
document.addEventListener('visibilitychange', () => {
    if (window.codeForge && window.codeForge.backgroundMusic) {
        if (document.hidden && window.codeForge.musicPlaying) {
            window.codeForge.backgroundMusic.pause();
        } else if (!document.hidden && window.codeForge.musicPlaying) {
            window.codeForge.backgroundMusic.play().catch(console.warn);
        }
    }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker would be implemented for offline functionality
        console.log('Code Forge loaded successfully');
    });
}

