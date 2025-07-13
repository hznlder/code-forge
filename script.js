// Code Forge - Enhanced JavaScript Functionality
// Modern ES6+ implementation with robust error handling and notification system

class CodeForge {
    constructor() {
        this.API_URL = 'https://db.hashblen.com/codes';
        this.currentGame = null;
        this.allCodes = {};
        this.filteredCodes = [];
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
        
        // XP System Properties
        this.xpSystem = {
            currentXP: 0,
            userName: '',
            currentRank: null,
            lastActivity: Date.now(),
            dailyXPEarned: 0,
            lastXPDate: new Date().toDateString(),
            redeemedCodes: new Set(),
            clickedAds: 0,
            sessionStartTime: Date.now(),
            totalVisits: 0,
            achievements: []
        };
        
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.initializeXPSystem();
        this.setupEventListeners();
        this.setupThemeSystem();
        this.setupMusicSystem();
        this.fetchAndProcessCodes();
        this.showWelcomeState();
        
        // Initialize animations
        this.initializeAnimations();
        
        // Start XP tracking
        this.startXPTracking();
    }

    // ===== XP ENGAGEMENT SYSTEM =====
    initializeXPSystem() {
        this.loadXPData();
        this.checkDailyReset();
        this.incrementVisitCount();
        this.showXPWelcomeIfNeeded();
    }

    loadXPData() {
        try {
            const savedXP = localStorage.getItem('codeforge-xp-data');
            if (savedXP) {
                const data = JSON.parse(savedXP);
                this.xpSystem = { ...this.xpSystem, ...data };
                
                // Convert Set back from array
                if (data.redeemedCodes && Array.isArray(data.redeemedCodes)) {
                    this.xpSystem.redeemedCodes = new Set(data.redeemedCodes);
                }
            }
        } catch (error) {
            console.warn('Failed to load XP data:', error);
        }
    }

    saveXPData() {
        try {
            const dataToSave = {
                ...this.xpSystem,
                redeemedCodes: Array.from(this.xpSystem.redeemedCodes)
            };
            localStorage.setItem('codeforge-xp-data', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save XP data:', error);
        }
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.xpSystem.lastXPDate !== today) {
            this.xpSystem.dailyXPEarned = 0;
            this.xpSystem.lastXPDate = today;
            this.saveXPData();
        }
    }

    incrementVisitCount() {
        this.xpSystem.totalVisits++;
        this.awardXP(5, 'Daily visit bonus!');
        this.saveXPData();
    }

    showXPWelcomeIfNeeded() {
        if (!this.xpSystem.userName) {
            setTimeout(() => this.showUserNamePrompt(), 2000);
        } else {
            this.updateXPDisplay();
        }
    }

    showUserNamePrompt() {
        const modal = this.createXPWelcomeModal();
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 100);
    }

    createXPWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'xp-modal-overlay';
        modal.innerHTML = `
            <div class="xp-modal">
                <div class="xp-modal-header">
                    <h2>🎉 Welcome to Our XP System!</h2>
                    <p>Earn XP by engaging with the platform and compete on our leaderboard!</p>
                </div>
                <div class="xp-modal-content">
                    <div class="xp-info">
                        <h3>How You Earn XP:</h3>
                        <ul>
                            <li>📱 Daily visits: +5 XP</li>
                            <li>🎮 Interacting with codes: +2-8 XP (random)</li>
                            <li>📋 Copying working codes: +3-10 XP</li>
                            <li>📺 Clicking ads: +10 XP</li>
                            <li>⭐ Using favorite games: +5 XP bonus</li>
                        </ul>
                        <p class="xp-note">Points are awarded randomly to keep things fair and exciting!</p>
                    </div>
                    <div class="name-input-section">
                        <label for="user-name-input">Choose your display name:</label>
                        <input type="text" id="user-name-input" placeholder="Enter your name..." maxlength="20">
                        <p class="name-note">No login required! This is just for the leaderboard.</p>
                    </div>
                </div>
                <div class="xp-modal-footer">
                    <button class="xp-btn-secondary" onclick="codeForge.skipNameSetup()">Skip for now</button>
                    <button class="xp-btn-primary" onclick="codeForge.saveUserName()">Start Earning XP!</button>
                </div>
            </div>
        `;
        return modal;
    }

    saveUserName() {
        const input = document.getElementById('user-name-input');
        const name = input?.value.trim();
        
        if (name && name.length >= 2) {
            this.xpSystem.userName = name;
            this.awardXP(25, 'Welcome bonus for setting up your profile!');
            this.saveXPData();
            this.closeXPModal();
            this.updateXPDisplay();
            this.showNotification(`Welcome ${name}! You earned 25 XP!`, 'success');
        } else {
            this.showNotification('Please enter a name with at least 2 characters', 'warning');
        }
    }

    skipNameSetup() {
        this.xpSystem.userName = 'Anonymous User';
        this.saveXPData();
        this.closeXPModal();
        this.updateXPDisplay();
    }

    closeXPModal() {
        const modal = document.querySelector('.xp-modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    startXPTracking() {
        // Track user interactions for XP
        this.setupXPEventListeners();
        
        // Update leaderboard periodically (every 15 minutes as specified)
        setInterval(() => this.updateLeaderboard(), 15 * 60 * 1000);
        
        // Initial leaderboard update
        this.updateLeaderboard();
    }

    setupXPEventListeners() {
        // Track code interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.code-card')) {
                this.handleCodeInteraction(e);
            }
            
            // Track ad clicks (if any ads are present)
            if (e.target.closest('.ad-banner') || e.target.closest('[data-ad]')) {
                this.handleAdClick();
            }
        });

        // Track time spent on site
        setInterval(() => this.trackTimeSpent(), 30000); // Every 30 seconds
    }

    handleCodeInteraction(event) {
        const codeCard = event.target.closest('.code-card');
        const codeText = codeCard?.querySelector('.code-text')?.textContent;
        
        if (!codeText) return;

        // Check if this code was already redeemed
        if (this.xpSystem.redeemedCodes.has(codeText)) {
            return; // No XP for re-clicking redeemed codes
        }

        // Award random XP for interaction
        const xpAmount = this.getRandomXP(2, 8);
        this.awardXP(xpAmount, 'Code interaction bonus!');

        // If it's a copy action, award additional XP
        if (event.target.closest('.copy-code-btn')) {
            const copyXP = this.getRandomXP(3, 10);
            this.awardXP(copyXP, 'Code copied successfully!');
            
            // Mark as redeemed
            this.xpSystem.redeemedCodes.add(codeText);
            this.saveXPData();
        }

        // Bonus XP for favorite games
        if (this.userPreferences.favoriteGames.includes(this.currentGame)) {
            this.awardXP(5, 'Favorite game bonus!');
        }
    }

    handleAdClick() {
        this.xpSystem.clickedAds++;
        this.awardXP(10, 'Ad click bonus! Thanks for supporting us!');
        this.saveXPData();
    }

    trackTimeSpent() {
        // Award XP for time spent (small amounts)
        if (document.visibilityState === 'visible') {
            const timeBonus = Math.random() > 0.7 ? this.getRandomXP(1, 3) : 0;
            if (timeBonus > 0) {
                this.awardXP(timeBonus, 'Active engagement bonus!');
            }
        }
    }

    awardXP(amount, reason = '') {
        this.xpSystem.currentXP += amount;
        this.xpSystem.dailyXPEarned += amount;
        this.xpSystem.lastActivity = Date.now();
        
        this.updateXPDisplay();
        this.saveXPData();
        
        // Show XP notification
        if (reason) {
            this.showXPNotification(amount, reason);
        }
        
        // Check for achievements
        this.checkAchievements();
    }

    getRandomXP(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    showXPNotification(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-notification-content">
                <span class="xp-amount">+${amount} XP</span>
                <span class="xp-reason">${reason}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateXPDisplay() {
        // Update XP counter in header
        let xpDisplay = document.getElementById('xp-display');
        if (!xpDisplay) {
            xpDisplay = this.createXPDisplay();
        }
        
        const xpAmount = xpDisplay.querySelector('.xp-amount');
        const userName = xpDisplay.querySelector('.user-name');
        const rankDisplay = xpDisplay.querySelector('.rank-display');
        
        if (xpAmount) xpAmount.textContent = this.xpSystem.currentXP.toLocaleString();
        if (userName) userName.textContent = this.xpSystem.userName || 'Anonymous';
        if (rankDisplay && this.xpSystem.currentRank) {
            rankDisplay.textContent = `Rank #${this.xpSystem.currentRank}`;
            rankDisplay.classList.remove('hidden');
        }
    }

    createXPDisplay() {
        const header = document.querySelector('.header-controls');
        if (!header) return null;
        
        const xpDisplay = document.createElement('div');
        xpDisplay.id = 'xp-display';
        xpDisplay.className = 'xp-display';
        xpDisplay.innerHTML = `
            <div class="xp-info">
                <div class="user-info">
                    <span class="user-name">${this.xpSystem.userName || 'Anonymous'}</span>
                    <span class="rank-display hidden">Rank #--</span>
                </div>
                <div class="xp-counter">
                    <i class="fas fa-star"></i>
                    <span class="xp-amount">${this.xpSystem.currentXP.toLocaleString()}</span>
                    <span class="xp-label">XP</span>
                </div>
            </div>
        `;
        
        header.appendChild(xpDisplay);
        return xpDisplay;
    }

    checkAchievements() {
        const achievements = [
            { id: 'first_100', threshold: 100, title: 'Getting Started', description: 'Earned your first 100 XP!' },
            { id: 'first_500', threshold: 500, title: 'Code Hunter', description: 'Reached 500 XP!' },
            { id: 'first_1000', threshold: 1000, title: 'Dedicated User', description: 'Earned 1,000 XP!' },
            { id: 'first_5000', threshold: 5000, title: 'XP Master', description: 'Incredible! 5,000 XP earned!' }
        ];
        
        achievements.forEach(achievement => {
            if (this.xpSystem.currentXP >= achievement.threshold && 
                !this.xpSystem.achievements.includes(achievement.id)) {
                
                this.xpSystem.achievements.push(achievement.id);
                this.showAchievementNotification(achievement);
                this.saveXPData();
            }
        });
    }

    showAchievementNotification(achievement) {
        this.showNotification(`🏆 Achievement Unlocked: ${achievement.title}`, 'success');
    }

    // ===== LEADERBOARD SYSTEM =====
    updateLeaderboard() {
        this.generateLeaderboardData();
        this.calculateUserRank();
        this.updateXPDisplay();
    }

    generateLeaderboardData() {
        // Generate realistic leaderboard with seed entries
        const seedEntries = [
            { name: 'CodeMaster2024', xp: 15420 },
            { name: 'GenshinPro', xp: 12890 },
            { name: 'StarRailHunter', xp: 11650 },
            { name: 'ZZZExplorer', xp: 10320 },
            { name: 'RedeemKing', xp: 9875 },
            { name: 'XPGrinder', xp: 8940 },
            { name: 'CodeCollector', xp: 8120 },
            { name: 'DailyPlayer', xp: 7650 },
            { name: 'GameEnthusiast', xp: 7200 },
            { name: 'TopTierGamer', xp: 6890 }
        ];

        // Add some randomization to make it feel dynamic
        this.leaderboard = seedEntries.map(entry => ({
            ...entry,
            xp: entry.xp + Math.floor(Math.random() * 200) - 100 // ±100 XP variation
        }));

        // Sort by XP
        this.leaderboard.sort((a, b) => b.xp - a.xp);
    }

    calculateUserRank() {
        if (!this.xpSystem.userName || this.xpSystem.userName === 'Anonymous User') {
            this.xpSystem.currentRank = null;
            return;
        }

        // Create a combined list with user and leaderboard
        const allUsers = [...this.leaderboard, { 
            name: this.xpSystem.userName, 
            xp: this.xpSystem.currentXP 
        }];

        // Sort by XP
        allUsers.sort((a, b) => b.xp - a.xp);

        // Find user's rank
        const userIndex = allUsers.findIndex(user => user.name === this.xpSystem.userName);
        
        if (userIndex !== -1) {
            // Simulate realistic ranking as described in requirements
            let rank = userIndex + 1;
            
            // Occasionally show user in top 8, but usually around 99th or 151st
            const randomFactor = Math.random();
            
            if (randomFactor < 0.05) { // 5% chance to be in top 8
                rank = Math.floor(Math.random() * 8) + 1;
            } else if (randomFactor < 0.3) { // 25% chance to be around 99th
                rank = 95 + Math.floor(Math.random() * 10); // 95-104
            } else if (randomFactor < 0.6) { // 30% chance to be around 151st
                rank = 145 + Math.floor(Math.random() * 12); // 145-156
            } else { // 40% chance to be lower
                rank = 200 + Math.floor(Math.random() * 300); // 200-499
            }
            
            this.xpSystem.currentRank = rank;
        } else {
            this.xpSystem.currentRank = null;
        }

        this.saveXPData();
    }

    showLeaderboard() {
        const modal = this.createLeaderboardModal();
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('show'), 100);
    }

    createLeaderboardModal() {
        const modal = document.createElement('div');
        modal.className = 'leaderboard-modal-overlay';
        modal.innerHTML = `
            <div class="leaderboard-modal">
                <div class="leaderboard-header">
                    <h2>🏆 XP Leaderboard</h2>
                    <p>Top 10 XP earners - Updated every 15 minutes</p>
                    <button class="close-btn" onclick="codeForge.closeLeaderboardModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="leaderboard-content">
                    <div class="leaderboard-list">
                        ${this.generateLeaderboardHTML()}
                    </div>
                    <div class="user-rank-section">
                        ${this.generateUserRankHTML()}
                    </div>
                </div>
                <div class="leaderboard-footer">
                    <p class="leaderboard-note">
                        🌟 Keep earning XP to climb the ranks! Future rewards coming soon.
                    </p>
                </div>
            </div>
        `;
        return modal;
    }

    generateLeaderboardHTML() {
        return this.leaderboard.map((entry, index) => `
            <div class="leaderboard-entry ${index < 3 ? 'top-three' : ''}">
                <div class="rank-badge">
                    ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div class="player-info">
                    <span class="player-name">${entry.name}</span>
                    <span class="player-xp">${entry.xp.toLocaleString()} XP</span>
                </div>
            </div>
        `).join('');
    }

    generateUserRankHTML() {
        if (!this.xpSystem.currentRank) {
            return `
                <div class="user-rank-info">
                    <h3>Your Rank</h3>
                    <p>Set a display name to see your rank on the leaderboard!</p>
                    <button class="xp-btn-primary" onclick="codeForge.showUserNamePrompt()">
                        Set Display Name
                    </button>
                </div>
            `;
        }

        return `
            <div class="user-rank-info">
                <h3>Your Current Rank</h3>
                <div class="user-rank-display">
                    <div class="rank-number">#${this.xpSystem.currentRank}</div>
                    <div class="user-stats">
                        <div class="stat">
                            <span class="stat-label">Name:</span>
                            <span class="stat-value">${this.xpSystem.userName}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">XP:</span>
                            <span class="stat-value">${this.xpSystem.currentXP.toLocaleString()}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Today:</span>
                            <span class="stat-value">+${this.xpSystem.dailyXPEarned} XP</span>
                        </div>
                    </div>
                </div>
                <p class="rank-note">
                    ${this.getRankMessage()}
                </p>
            </div>
        `;
    }

    getRankMessage() {
        const rank = this.xpSystem.currentRank;
        
        if (rank <= 8) {
            return "🌟 Amazing! You're in the top 8! Keep up the excellent work!";
        } else if (rank <= 100) {
            return "🚀 Great job! You're in the top 100 players!";
        } else if (rank <= 200) {
            return "💪 Good progress! Keep earning XP to climb higher!";
        } else {
            return "📈 Every XP counts! Keep engaging to improve your rank!";
        }
    }

    closeLeaderboardModal() {
        const modal = document.querySelector('.leaderboard-modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
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

        // Hot bar interaction (no close button needed since it's always visible)
        const hotBarContainer = document.querySelector('.hot-bar-container');
        if (hotBarContainer) {
            hotBarContainer.addEventListener('click', () => {
                // Optional: Add click interaction for hot bar
                console.log('Hot bar clicked');
            });
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.fetchAndProcessCodes());
        }

        // More button dropdown
        const moreToggle = document.getElementById("more-toggle");
        const moreDropdown = document.getElementById("more-dropdown");
        if (moreToggle && moreDropdown) {
            moreToggle.addEventListener("click", (event) => {
                event.stopPropagation();
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

    // ===== ENHANCED API AND DATA MANAGEMENT WITH ROBUST ERROR HANDLING =====
    async fetchAndProcessCodes() {
        this.showLoadingState();

        try {
            // Attempt to fetch from API with comprehensive error handling
            const response = await this.attemptFetch();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate response structure
            if (!this.isValidCodesResponse(data)) {
                throw new Error('Invalid response format from API');
            }
            
            // Process successful response
            this.processSuccessfulFetch(data);
            
        } catch (error) {
            console.error('Failed to fetch codes:', error);
            this.handleFetchError(error);
        }
    }

    async attemptFetch() {
        // Try direct fetch first
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(this.API_URL, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            return response;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - server took too long to respond');
            }
            
            // Try CORS proxy as fallback
            return this.attemptCorsProxyFetch();
        }
    }

    async attemptCorsProxyFetch() {
        const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/'
        ];

        for (const proxy of corsProxies) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                const response = await fetch(proxy + encodeURIComponent(this.API_URL), {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                console.warn(`CORS proxy ${proxy} failed:`, error);
                continue;
            }
        }
        
        throw new Error('All connection attempts failed - please check your internet connection');
    }

    isValidCodesResponse(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check for required structure
        const hasValidStructure = 
            typeof data.retcode !== 'undefined' &&
            (data.genshin !== undefined || data.hsr !== undefined || data.zzz !== undefined);
            
        return hasValidStructure;
    }

    processSuccessfulFetch(data) {
        // Store last known codes for comparison
        const lastKnownCodes = this.getLastKnownCodes();
        
        // Check for new codes and update notification bar
        this.checkForNewCodesAndUpdateBar(data, lastKnownCodes);
        
        // Store current codes as last known
        this.storeLastKnownCodes(data);
        
        // Update application state
        this.allCodes = data;
        this.updateLastChecked();
        this.updateNotificationBar('Codes updated successfully!');
        
        if (this.currentGame) {
            this.displayCodes(this.currentGame);
        } else {
            this.showWelcomeState();
        }
    }

    handleFetchError(error) {
        // Clear codes display area
        const codesGrid = document.getElementById('codes-grid');
        if (codesGrid) {
            codesGrid.innerHTML = '';
        }
        
        // Hide loading message and show error
        this.showErrorState(error.message);
        
        // Update notification bar with error
        this.updateNotificationBar('Failed to fetch latest codes');
        
        // Do not proceed with processing codes
        console.error('Fetch failed, not processing any codes');
    }

    // ===== ENHANCED NOTIFICATION BAR LOGIC =====
    getLastKnownCodes() {
        try {
            const stored = localStorage.getItem('codeforge-last-known-codes');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Failed to load last known codes:', error);
            return {};
        }
    }

    storeLastKnownCodes(codes) {
        try {
            // Only store the game code arrays
            const codesToStore = {
                genshin: codes.genshin || [],
                hsr: codes.hsr || [],
                zzz: codes.zzz || [],
                timestamp: Date.now()
            };
            localStorage.setItem('codeforge-last-known-codes', JSON.stringify(codesToStore));
        } catch (error) {
            console.warn('Failed to store last known codes:', error);
        }
    }

    checkForNewCodesAndUpdateBar(newData, lastKnownCodes) {
        if (!lastKnownCodes || Object.keys(lastKnownCodes).length === 0) {
            // First time loading - no comparison possible
            this.updateNotificationBar('No new codes added to any games.');
            return;
        }

        const newCodes = this.findNewCodes(newData, lastKnownCodes);
        
        if (newCodes.length > 0) {
            this.displayNewCodesNotification(newCodes);
        } else {
            this.updateNotificationBar('No new codes added to any games.');
        }
    }

    findNewCodes(newData, lastKnownCodes) {
        const newCodes = [];
        const games = ['genshin', 'hsr', 'zzz'];
        
        games.forEach(game => {
            const currentCodes = newData[game] || [];
            const previousCodes = lastKnownCodes[game] || [];
            
            currentCodes.forEach(code => {
                // Check if this code is genuinely new
                const isNew = !previousCodes.some(oldCode => 
                    oldCode.code === code.code || 
                    (oldCode.added_at && code.added_at && oldCode.added_at >= code.added_at)
                );
                
                if (isNew) {
                    newCodes.push({ ...code, game });
                }
            });
        });
        
        return newCodes;
    }

    displayNewCodesNotification(newCodes) {
        // Group new codes by game
        const gameGroups = {};
        newCodes.forEach(code => {
            if (!gameGroups[code.game]) {
                gameGroups[code.game] = [];
            }
            gameGroups[code.game].push(code);
        });

        // Find the most recent code to get the date
        const mostRecentCode = newCodes.reduce((latest, code) => {
            const codeTime = code.added_at || Date.now() / 1000;
            const latestTime = latest.added_at || 0;
            return codeTime > latestTime ? code : latest;
        }, newCodes[0]);

        // Format the date
        const date = mostRecentCode.added_at ? 
            new Date(mostRecentCode.added_at * 1000).toLocaleDateString() : 
            new Date().toLocaleDateString();

        // Create message for the first game with new codes
        const firstGame = Object.keys(gameGroups)[0];
        const gameName = this.getGameDisplayName(firstGame);
        
        const message = `New redeem code added in ${gameName} (${date}) ✨️ Redeem As soon as possible`;
        this.updateNotificationBar(message);
    }

    updateNotificationBar(message) {
        const hotBarText = document.getElementById('hot-bar-text');
        
        if (hotBarText) {
            hotBarText.textContent = message;
            
            // Auto-hide after 10 seconds for non-error messages
            if (!message.includes('Failed')) {
                setTimeout(() => {
                    hotBarText.textContent = 'No new codes added to any games.';
                }, 10000);
            }
        }
    }

    hideUpdatesBar() {
        const hotBarText = document.getElementById('hot-bar-text');
        if (hotBarText) {
            hotBarText.textContent = 'No new codes added to any games.';
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

        if (title) title.textContent = code.title || 'Redemption Code';
        if (codeText) codeText.textContent = code.code || '';
        if (description) description.textContent = code.description || 'No description available';
        if (rewardsText) rewardsText.textContent = code.rewards || 'Various rewards';

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
            } else if (code.link) {
                redeemBtn.href = code.link;
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
        if (codeDate && code.date) {
            codeDate.textContent = new Date(code.date).toLocaleDateString();
        }
        
        if (codeType) {
            codeType.textContent = this.getCodeType(code);
        }

        // Add fake vote counts for engagement
        const upvoteBtn = card.querySelector('.vote-btn.upvote .vote-count');
        const downvoteBtn = card.querySelector('.vote-btn.downvote .vote-count');
        
        if (upvoteBtn && downvoteBtn) {
            const votes = this.generateVoteCounts(code.title || code.code || 'default', code.date);
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
                (code.title || '').toLowerCase().includes(this.searchTerm) ||
                (code.description || '').toLowerCase().includes(this.searchTerm) ||
                (code.code || '').toLowerCase().includes(this.searchTerm) ||
                (code.rewards || '').toLowerCase().includes(this.searchTerm)
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
        this.renderCodes();
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
            errorMessage.textContent = message || 'Failed to load codes. Please check your connection and try again.';
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
        if (!code.date && !code.added_at) return false;
        
        const codeDate = code.added_at ? 
            new Date(code.added_at * 1000) : 
            new Date(code.date);
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
        
        // Simple heuristic based on title/description
        const text = `${code.title || ''} ${code.description || ''}`.toLowerCase();
        
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

