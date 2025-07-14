// Code Forge - Enhanced JavaScript with XP System
// Modern ES6+ implementation with game-inspired features and XP engagement

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
        
        // XP System Properties
        this.xpData = {
            currentXP: 0,
            userName: '',
            currentRank: 0,
            redeemedCodes: [],
            achievements: [],
            dailyXPEarned: 0,
            totalVisits: 0,
            lastVisitDate: null,
            lastRankUpdate: 0,
            votedCodes: [], // Track voted codes to prevent farming
            selectedGames: [], // Track selected games to prevent re-selection XP
            hotBarClicked: false, // Track hot bar clicks
            adClickCount: 0, // Track ad clicks for achievement
            socialVerifications: {
                telegram: { status: 'none', username: '', submitTime: null, attempts: 0 },
                youtube: { status: 'none', username: '', submitTime: null, attempts: 0 },
                hoyolab: { status: 'none', username: '', submitTime: null, attempts: 0 }
            }
        };
        
        this.init();
    }

    init() {
        this.loadUserPreferences();
        this.loadXPData();
        this.setupEventListeners();
        this.setupThemeSystem();
        this.setupMusicSystem();
        this.fetchCodes();
        this.showWelcomeState();
        this.initializeXPSystem();
        
        // Initialize animations
        this.initializeAnimations();
    }

    // ===== XP SYSTEM IMPLEMENTATION =====
    initializeXPSystem() {
        // Award daily visit bonus
        this.awardDailyVisitBonus();
        
        // Show XP welcome modal if first time user
        if (!this.xpData.userName) {
            setTimeout(() => this.showXPWelcomeModal(), 2000);
        } else {
            this.updateXPDisplay();
        }
        
        // Start XP tracking
        this.startXPTracking();
        
        // Update leaderboard rank periodically
        setInterval(() => this.updateUserRank(), 15 * 60 * 1000); // Every 15 minutes
    }

    loadXPData() {
        const saved = localStorage.getItem('codeforge-xp-data');
        if (saved) {
            try {
                this.xpData = { ...this.xpData, ...JSON.parse(saved) };
            } catch (error) {
                console.warn('Failed to load XP data:', error);
            }
        }
    }

    saveXPData() {
        localStorage.setItem('codeforge-xp-data', JSON.stringify(this.xpData));
    }

    awardDailyVisitBonus() {
        const today = new Date().toDateString();
        if (this.xpData.lastVisitDate !== today) {
            this.awardXP(10, 'Daily visit bonus!'); // Increased from 5 to 10
            this.xpData.lastVisitDate = today;
            this.xpData.totalVisits++;
            this.xpData.dailyXPEarned = 10;
            this.saveXPData();
        }
    }

    awardXP(amount, reason) {
        this.xpData.currentXP += amount;
        this.xpData.dailyXPEarned += amount;
        this.showXPNotification(amount, reason);
        this.updateXPDisplay();
        this.checkAchievements();
        this.saveXPData();
    }

    showXPNotification(amount, reason) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-notification-content">
                <div class="xp-amount">+${amount} XP</div>
                <div class="xp-reason">${reason}</div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateXPDisplay() {
        // Create XP display if it doesn't exist
        let xpDisplay = document.getElementById('xp-display');
        if (!xpDisplay) {
            xpDisplay = document.createElement('div');
            xpDisplay.id = 'xp-display';
            xpDisplay.className = 'xp-display';
            
            const headerControls = document.querySelector('.header-controls');
            if (headerControls) {
                headerControls.appendChild(xpDisplay);
            }
        }

        const rankDisplay = this.xpData.currentRank > 0 ? 
            `<div class="rank-display">Rank #${this.xpData.currentRank}</div>` : '';

        xpDisplay.innerHTML = `
            <div class="xp-info">
                <div class="user-info">
                    <div class="user-name">${this.xpData.userName || 'Anonymous User'}</div>
                    ${rankDisplay}
                </div>
            </div>
            <div class="xp-counter">
                <i class="fas fa-star"></i>
                <span class="xp-amount">${this.xpData.currentXP}</span>
                <span class="xp-label">XP</span>
            </div>
        `;
    }

    showXPWelcomeModal() {
        const modal = document.createElement('div');
        modal.className = 'xp-modal-overlay';
        modal.innerHTML = `
            <div class="xp-modal">
                <div class="xp-modal-header">
                    <h2>🎉 Welcome to Code Forge XP!</h2>
                    <p>Start earning XP for engaging with the platform!</p>
                </div>
                
                <div class="xp-info">
                    <h3>How You Earn XP:</h3>
                    <ul>
                        <li>📱 Daily visits: +10 XP</li>
                        <li>🎮 Game selection: +5-15 XP (random)</li>
                        <li>📋 Copying codes: +8-20 XP</li>
                        <li>📺 Ad clicks: +25 XP</li>
                        <li>⭐ Favorite game bonus: +10 XP</li>
                        <li>⏰ Active engagement: +2-5 XP</li>
                    </ul>
                    
                    <div class="xp-note">
                        Points are awarded randomly to keep things dynamic and fair!
                        Accumulating XP now will hold significant value in future updates.
                        <br><br>
                        <strong>Important:</strong> All XP points are validated on our backend servers. 
                        Only legitimately earned XP will be counted towards your final score and rewards.
                        <br><br>
                        <strong>⚠️ Warning:</strong> Any attempts to illegally gain XP points will result in 
                        a deduction of 500 XP for 3 months. Our system automatically detects fraudulent activities.
                        <br><br>
                        <strong>🐛 Found a bug?</strong> Contact us at: 
                        <a href="mailto:izzaaalproductionltd@gmail.com" style="color: var(--accent-primary);">
                            izzaaalproductionltd@gmail.com
                        </a>
                        <br><br>
                        <strong>🏆 Don't forget to check the Achievement Board for special rewards!</strong>
                    </div>
                </div>
                
                <div class="name-input-section">
                    <label for="xp-username">Choose your display name:</label>
                    <input type="text" id="xp-username" placeholder="Enter your name..." maxlength="25">
                    <div class="name-note">No login required! This is just for display purposes.</div>
                </div>
                
                <div class="xp-modal-footer">
                    <button class="xp-btn-secondary" onclick="codeForge.skipXPSetup()">Skip</button>
                    <button class="xp-btn-primary" onclick="codeForge.completeXPSetup()">Start Earning XP!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }

    completeXPSetup() {
        const usernameInput = document.getElementById('xp-username');
        const username = usernameInput ? usernameInput.value.trim() : '';
        
        this.xpData.userName = username || 'Anonymous User';
        this.awardXP(25, 'Welcome bonus!');
        this.updateXPDisplay();
        this.closeXPModal();
    }

    skipXPSetup() {
        this.xpData.userName = 'Anonymous User';
        this.updateXPDisplay();
        this.closeXPModal();
    }

    closeXPModal() {
        const modal = document.querySelector('.xp-modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    checkAchievements() {
        const achievements = [
            { id: 'first_100', threshold: 100, title: 'Getting Started', description: 'Earned your first 100 XP!' },
            { id: 'first_500', threshold: 500, title: 'Code Hunter', description: 'Reached 500 XP milestone!' },
            { id: 'first_1000', threshold: 1000, title: 'Dedicated User', description: 'Achieved 1,000 XP!' },
            { id: 'first_5000', threshold: 5000, title: 'XP Master', description: 'Incredible milestone at 5,000 XP!' }
        ];

        achievements.forEach(achievement => {
            if (this.xpData.currentXP >= achievement.threshold && 
                !this.xpData.achievements.includes(achievement.id)) {
                this.xpData.achievements.push(achievement.id);
                this.showAchievementNotification(achievement);
            }
        });
    }

    showAchievementNotification(achievement) {
        this.showNotification(`🏆 Achievement Unlocked: ${achievement.title}`, 'success');
    }

    generateLeaderboard() {
        // Generate realistic leaderboard with higher seed entries and daily growth
        const today = new Date();
        const daysSinceStart = Math.floor((today - new Date('2025-01-01')) / (1000 * 60 * 60 * 24));
        
        const seedEntries = [
            { name: 'CodeMaster2024', baseXp: 2500, dailyRate: 25 },
            { name: 'GenshinPro', baseXp: 2200, dailyRate: 22 },
            { name: 'StarRailFan', baseXp: 2000, dailyRate: 20 },
            { name: 'ZenlessHunter', baseXp: 1800, dailyRate: 18 },
            { name: 'CodeCollector', baseXp: 1600, dailyRate: 16 },
            { name: 'RedemptionKing', baseXp: 1400, dailyRate: 14 },
            { name: 'GameCodeGuru', baseXp: 1200, dailyRate: 12 },
            { name: 'XPChampion', baseXp: 1000, dailyRate: 10 },
            { name: 'CodeNinja', baseXp: 800, dailyRate: 8 },
            { name: 'RewardSeeker', baseXp: 600, dailyRate: 6 }
        ];

        // Calculate current XP with daily growth and randomization
        const leaderboard = seedEntries.map(entry => ({
            name: entry.name,
            xp: entry.baseXp + (daysSinceStart * entry.dailyRate) + Math.floor(Math.random() * 200)
        }));

        // Add user to leaderboard if they have enough XP
        if (this.xpData.currentXP > 0) {
            leaderboard.push({
                name: this.xpData.userName || 'You',
                xp: this.xpData.currentXP,
                isUser: true
            });
        }

        // Sort by XP and take top 10
        return leaderboard.sort((a, b) => b.xp - a.xp).slice(0, 10);
    }

    updateUserRank() {
        // Simulate realistic ranking as specified
        const randomFactor = Math.random();
        let rank;

        if (randomFactor < 0.05) {
            // 5% chance to be in top 8
            rank = Math.floor(Math.random() * 8) + 1;
        } else if (randomFactor < 0.3) {
            // 25% chance around 99th
            rank = 95 + Math.floor(Math.random() * 10);
        } else if (randomFactor < 0.6) {
            // 30% chance around 151st
            rank = 145 + Math.floor(Math.random() * 12);
        } else {
            // 40% chance in lower ranks
            rank = 200 + Math.floor(Math.random() * 300);
        }

        this.xpData.currentRank = rank;
        this.xpData.lastRankUpdate = Date.now();
        this.updateXPDisplay();
        this.saveXPData();
    }

    showLeaderboard() {
        const leaderboard = this.generateLeaderboard();
        
        const modal = document.createElement('div');
        modal.className = 'leaderboard-modal-overlay';
        modal.innerHTML = `
            <div class="leaderboard-modal">
                <div class="leaderboard-header">
                    <h2>🏆 XP Leaderboard</h2>
                    <p>Top 10 XP earners - Updates every 15 minutes</p>
                    <button class="close-btn" onclick="codeForge.closeLeaderboard()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="leaderboard-content">
                    <div class="leaderboard-list">
                        ${leaderboard.map((entry, index) => `
                            <div class="leaderboard-entry ${index < 3 ? 'top-three' : ''}">
                                <div class="rank-badge">#${index + 1}</div>
                                <div class="player-info">
                                    <span class="player-name">${entry.name}</span>
                                    <span class="player-xp">${entry.xp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="user-rank-section">
                        <div class="user-rank-info">
                            <h3>Your Stats</h3>
                            <div class="user-rank-display">
                                <div class="rank-number">#${this.xpData.currentRank || '???'}</div>
                                <div class="user-stats">
                                    <div class="stat">
                                        <span class="stat-label">Your XP:</span>
                                        <span class="stat-value">${this.xpData.currentXP.toLocaleString()}</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Daily XP:</span>
                                        <span class="stat-value">${this.xpData.dailyXPEarned}</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-label">Total Visits:</span>
                                        <span class="stat-value">${this.xpData.totalVisits}</span>
                                    </div>
                                </div>
                            </div>
                            <p class="rank-note">
                                XP points can be redeemed as credits for Steam, Play Store, etc.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="leaderboard-footer">
                    <p class="leaderboard-note">
                        Keep earning XP to climb the ranks! Future updates will bring exciting rewards.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }

    showAchievements() {
        const achievements = [
            { id: 'first_100', threshold: 100, title: 'Getting Started', description: 'Earned your first 100 XP!', icon: 'fas fa-star' },
            { id: 'first_500', threshold: 500, title: 'Code Hunter', description: 'Reached 500 XP milestone!', icon: 'fas fa-search' },
            { id: 'first_1000', threshold: 1000, title: 'Dedicated User', description: 'Achieved 1,000 XP!', icon: 'fas fa-medal' },
            { id: 'first_5000', threshold: 5000, title: 'XP Master', description: 'Incredible milestone at 5,000 XP!', icon: 'fas fa-crown' },
            { id: 'code_collector', threshold: 0, title: 'Code Collector', description: 'Copied your first code!', icon: 'fas fa-clipboard' },
            { id: 'game_explorer', threshold: 0, title: 'Game Explorer', description: 'Explored all three games!', icon: 'fas fa-gamepad' },
            { id: 'daily_visitor', threshold: 0, title: 'Daily Visitor', description: 'Visited the site for 7 consecutive days!', icon: 'fas fa-calendar-check' },
            { id: 'social_supporter', threshold: 0, title: 'Social Supporter', description: 'Clicked on an advertisement!', icon: 'fas fa-heart' }
        ];

        const modal = document.createElement('div');
        modal.className = 'achievements-modal-overlay';
        modal.innerHTML = `
            <div class="achievements-modal">
                <div class="achievements-header">
                    <h2>🏆 Achievements</h2>
                    <p>Track your progress and unlock rewards!</p>
                    <button class="close-btn" onclick="codeForge.closeAchievements()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="achievements-content">
                    <div class="achievements-stats">
                        <div class="stat-card">
                            <div class="stat-number">${this.xpData.achievements.length}</div>
                            <div class="stat-label">Unlocked</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${achievements.length}</div>
                            <div class="stat-label">Total</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${Math.round((this.xpData.achievements.length / achievements.length) * 100)}%</div>
                            <div class="stat-label">Complete</div>
                        </div>
                    </div>
                    
                    <div class="achievements-grid">
                        ${achievements.map(achievement => {
                            const isUnlocked = this.xpData.achievements.includes(achievement.id);
                            const isXPBased = achievement.threshold > 0;
                            const progress = isXPBased ? Math.min(100, (this.xpData.currentXP / achievement.threshold) * 100) : 0;
                            
                            return `
                                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                                    <div class="achievement-icon">
                                        <i class="${achievement.icon}"></i>
                                    </div>
                                    <div class="achievement-info">
                                        <h3 class="achievement-title">${achievement.title}</h3>
                                        <p class="achievement-description">${achievement.description}</p>
                                        ${isXPBased && !isUnlocked ? `
                                            <div class="achievement-progress">
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${progress}%"></div>
                                                </div>
                                                <div class="progress-text">${this.xpData.currentXP}/${achievement.threshold} XP</div>
                                            </div>
                                        ` : ''}
                                    </div>
                                    ${isUnlocked ? '<div class="achievement-badge"><i class="fas fa-check"></i></div>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="achievements-footer">
                    <p class="achievements-note">
                        Keep earning XP and engaging with the platform to unlock more achievements!
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }

    claimAchievement(achievementId, xpReward) {
        if (!this.xpData.achievements.includes(achievementId)) {
            this.xpData.achievements.push(achievementId);
            this.awardXP(xpReward, `Achievement claimed: ${xpReward} XP!`);
            this.showNotification(`🎉 Achievement claimed! +${xpReward} XP`, 'success');
            this.saveXPData();
            
            // Refresh achievements modal
            this.closeAchievements();
            setTimeout(() => this.showAchievements(), 300);
        }
    }

    closeAchievements() {
        const modal = document.querySelector('.achievements-modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ===== SOCIAL MEDIA VERIFICATION SYSTEM =====
    startSocialVerification(platform) {
        const platformData = {
            telegram: { name: 'Telegram', url: 'https://t.me/codeforgeizzaaalofficial', xp: 50 },
            youtube: { name: 'YouTube', url: 'https://youtube.com/@izzaaalplays?si=Szsgboc8yAkYqMVS?sub_confirmation=1', xp: 50 },
            hoyolab: { name: 'HoYoLAB', url: 'https://www.hoyolab.com/accountCenter/postList?id=342635986', xp: 45 }
        };

        const data = platformData[platform];
        if (!data) return;

        const modal = document.createElement('div');
        modal.className = 'verification-modal-overlay';
        modal.innerHTML = `
            <div class="verification-modal">
                <div class="verification-header">
                    <h2>🔗 ${data.name} Verification</h2>
                    <p>Follow the steps below to earn ${data.xp} XP!</p>
                    <button class="close-btn" onclick="codeForge.closeVerificationModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="verification-content">
                    <div class="verification-steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h3>Join/Follow ${data.name}</h3>
                                <p>Click the button below to open ${data.name} and join/follow our account.</p>
                                <a href="${data.url}" target="_blank" class="verification-link-btn">
                                    <i class="fab fa-${platform === 'hoyolab' ? 'globe' : platform}"></i>
                                    Open ${data.name}
                                </a>
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h3>Enter Your Username</h3>
                                <p>Provide your ${data.name} username for verification purposes.</p>
                                <input type="text" id="verification-username" placeholder="Your ${data.name} username..." maxlength="50">
                            </div>
                        </div>
                        
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h3>Submit for Verification</h3>
                                <p>We'll verify your membership within 24 hours. You'll receive XP once verified!</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="verification-note">
                        <i class="fas fa-info-circle"></i>
                        <p><strong>Important:</strong> Make sure you actually join/follow before submitting. 
                        Verification may fail if you're not a member, and you'll need to rejoin and wait another 24 hours.</p>
                    </div>
                </div>
                
                <div class="verification-footer">
                    <button class="verification-btn-secondary" onclick="codeForge.closeVerificationModal()">Cancel</button>
                    <button class="verification-btn-primary" onclick="codeForge.submitVerification('${platform}')">Submit for Verification</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }

    submitVerification(platform) {
        const usernameInput = document.getElementById('verification-username');
        const username = usernameInput ? usernameInput.value.trim() : '';
        
        if (!username) {
            this.showNotification('Please enter your username!', 'warning');
            return;
        }

        // Update verification status
        this.xpData.socialVerifications[platform] = {
            status: 'pending',
            username: username,
            submitTime: Date.now(),
            attempts: this.xpData.socialVerifications[platform].attempts + 1
        };
        
        this.saveXPData();
        this.closeVerificationModal();
        
        // Show confirmation
        this.showNotification(`Verification submitted! We'll review within 24 hours.`, 'success');
        
        // Set up verification processing (simulate real verification)
        this.scheduleVerificationProcessing(platform);
    }

    scheduleVerificationProcessing(platform) {
        const verification = this.xpData.socialVerifications[platform];
        const isFirstAttempt = verification.attempts === 1;
        
        if (platform === 'hoyolab') {
            // HoYoLAB: Success on first try
            setTimeout(() => {
                this.processVerification(platform, true);
            }, 2000); // 2 seconds for immediate success
        } else {
            // Telegram and YouTube: fail first attempt, succeed on second
            const processTime = isFirstAttempt ? 
                (4 + Math.random() * 2) * 60 * 60 * 1000 : // 4-6 hours for first attempt failure
                (2 + Math.random() * 3) * 60 * 60 * 1000; // 2-5 hours for second attempt success
            
            setTimeout(() => {
                this.processVerification(platform, !isFirstAttempt);
            }, processTime);
        }
    }

    processVerification(platform, shouldSucceed) {
        const verification = this.xpData.socialVerifications[platform];
        if (verification.status !== 'pending') return;
        
        const platformData = {
            telegram: { name: 'Telegram', xp: 50 },
            youtube: { name: 'YouTube', xp: 50 },
            hoyolab: { name: 'HoYoLAB', xp: 45 }
        };
        
        if (shouldSucceed) {
            // Success - award XP and unlock achievement
            verification.status = 'completed';
            const achievementId = `${platform}_member`;
            
            if (!this.xpData.achievements.includes(achievementId)) {
                this.xpData.achievements.push(achievementId);
                this.awardXP(platformData[platform].xp, `${platformData[platform].name} verification completed!`);
                this.showNotification(`🎉 ${platformData[platform].name} verification successful! +${platformData[platform].xp} XP`, 'success');
            }
        } else {
            // Fail - encourage rejoin
            verification.status = 'failed';
            this.showNotification(`❌ ${platformData[platform].name} verification failed. Please rejoin and try again.`, 'error');
        }
        
        this.saveXPData();
    }

    retrySocialVerification(platform) {
        // Reset status to allow retry
        this.xpData.socialVerifications[platform].status = 'none';
        this.saveXPData();
        
        // Start verification process again
        this.startSocialVerification(platform);
    }

    getVerificationTimeLeft(submitTime) {
        const now = Date.now();
        const elapsed = now - submitTime;
        const total = 24 * 60 * 60 * 1000; // 24 hours
        const remaining = Math.max(0, total - elapsed);
        
        if (remaining === 0) return 'Processing...';
        
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        
        return `${hours}h ${minutes}m remaining`;
    }

    closeVerificationModal() {
        const modal = document.querySelector('.verification-modal-overlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    startXPTracking() {
        // Track engagement time
        let engagementTime = 0;
        setInterval(() => {
            if (!document.hidden) {
                engagementTime++;
                // Award XP for active engagement every 5 minutes
                if (engagementTime % 300 === 0) { // 300 seconds = 5 minutes
                    const xpAmount = Math.floor(Math.random() * 4) + 2; // 2-5 XP (more logical)
                    this.awardXP(xpAmount, 'Active engagement bonus!');
                }
            }
        }, 1000);
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

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.fetchCodes());
        }

        // Hot Bar interaction - FIXED (no XP award)
        const hotBar = document.querySelector(".hot-bar-container");
        if (hotBar) {
            hotBar.addEventListener("click", () => {
                this.showNotification("Hot Bar clicked! More details would appear here.", "info");
            });
        }

        // More button dropdown - FIXED
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

        // XP Display click for leaderboard
        document.addEventListener('click', (e) => {
            if (e.target.closest('#xp-display')) {
                this.showLeaderboard();
            }
        });

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

        // Ad click functionality (delegated event listener)
        document.addEventListener("click", (e) => {
            // Check if clicked element is an ad or has ad-related classes
            if (e.target.closest(".ad-banner, .advertisement, [data-ad], .google-ad, .ad-container")) {
                this.awardXP(25, 'Ad click bonus!'); // 25 XP for ad clicks
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

    // ===== API AND DATA MANAGEMENT - FIXED =====
    async fetchCodes() {
        this.showLoadingState();
        this.updateNotificationBar("Fetching latest codes...");

        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
            'https://cors-anywhere.herokuapp.com/'
        ];

        // Try direct fetch first
        try {
            const response = await this.fetchWithTimeout(this.API_URL, 10000);
            if (response.ok) {
                const text = await response.text();
                const data = this.parseJSONSafely(text);
                if (data) {
                    this.handleSuccessfulFetch(data);
                    return;
                }
            }
        } catch (error) {
            console.warn('Direct fetch failed:', error);
        }

        // Try with CORS proxies
        for (const proxy of proxies) {
            try {
                const response = await this.fetchWithTimeout(proxy + encodeURIComponent(this.API_URL), 8000);
                if (response.ok) {
                    const text = await response.text();
                    const data = this.parseJSONSafely(text);
                    if (data) {
                        this.handleSuccessfulFetch(data);
                        return;
                    }
                }
            } catch (error) {
                console.warn(`Proxy ${proxy} failed:`, error);
            }
        }

        // If all fails, use fallback data
        this.handleFallbackData();
    }

    async fetchWithTimeout(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    parseJSONSafely(text) {
        try {
            // Check if it's a data URL or HTML
            if (text.startsWith('data:') || text.includes('<html>') || text.includes('<!DOCTYPE')) {
                return null;
            }
            return JSON.parse(text);
        } catch (error) {
            console.warn('JSON parsing failed:', error);
            return null;
        }
    }

    handleSuccessfulFetch(data) {
        // Check for new codes for updates bar
        this.checkForNewCodes(data);
        
        this.allCodes = data;
        this.updateLastChecked();
        this.updateNotificationBar("Codes updated successfully!");
        
        if (this.currentGame) {
            this.displayCodes(this.currentGame);
        } else {
            this.showWelcomeState();
        }
    }

    handleFallbackData() {
        console.warn('Using fallback data due to API unavailability');
        
        // Provide working fallback codes
        const fallbackData = {
            "genshin": [
                {
                    "code": "GENSHINGIFT",
                    "title": "Permanent Gift Code",
                    "description": "Primogems and other rewards",
                    "rewards": "50 Primogems, 3 Hero's Wit",
                    "date": "2024-01-01",
                    "status": "working"
                }
            ],
            "hsr": [
                {
                    "code": "STARRAILGIFT",
                    "title": "Permanent Gift Code", 
                    "description": "Stellar Jade and materials",
                    "rewards": "50 Stellar Jade, 2 Traveler's Guide",
                    "date": "2024-01-01",
                    "status": "working"
                }
            ],
            "zzz": [
                {
                    "code": "ZENLESSGIFT",
                    "title": "Permanent Gift Code",
                    "description": "Polychrome and other rewards",
                    "rewards": "300 Polychrome, 2 Official Investigator Log",
                    "date": "2024-01-01", 
                    "status": "working"
                }
            ],
            "retcode": 0,
            "previous_update": Date.now() - 3600000,
            "latest_update": Date.now()
        };

        this.allCodes = fallbackData;
        this.updateNotificationBar("Using offline data - connection issues detected");
        this.updateLastChecked();
        
        if (this.currentGame) {
            this.displayCodes(this.currentGame);
        } else {
            this.showWelcomeState();
        }
    }

    updateNotificationBar(message) {
        const hotBarText = document.getElementById("hot-bar-text");
        if (hotBarText) {
            hotBarText.textContent = message;
        }
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
                        oldCode.code === code.code && oldCode.title === code.title
                    );
                    
                    if (isNew) {
                        newCodes.push({ ...code, game });
                    }
                });
            }
        });

        if (newCodes.length > 0) {
            this.showUpdatesBar(newCodes);
            this.updateNotificationBar(`${newCodes.length} new codes detected!`);
        }

        this.lastKnownCodes = { ...newData };
    }

    showUpdatesBar(newCodes) {
        const updatesBar = document.getElementById('updates-bar');
        const updatesText = document.getElementById('updates-text');
        
        if (updatesBar && updatesText) {
            const count = newCodes.length;
            const gameNames = [...new Set(newCodes.map(code => this.getGameDisplayName(code.game)))];
            
            updatesText.textContent = `${count} new code${count > 1 ? 's' : ''} available for ${gameNames.join(', ')}!`;
            
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

    // ===== GAME SELECTION AND DISPLAY =====
    handleGameSelection(event) {
        const gameBtn = event.currentTarget;
        const game = gameBtn.dataset.game;
        
        if (!game) return;

        // Prevent XP farming by checking if this game was already selected today
        const today = new Date().toDateString();
        const gameSelectionKey = `${game}-${today}`;
        
        if (this.xpData.selectedGames.includes(gameSelectionKey)) {
            // Just update display without awarding XP
            this.updateGameSelection(gameBtn, game);
            this.displayCodes(game);
            return;
        }

        // Award XP for new game interaction only
        const xpAmount = Math.floor(Math.random() * 11) + 5; // 5-15 XP
        const isFavorite = this.userPreferences.favoriteGames.includes(game);
        const totalXP = isFavorite ? xpAmount + 10 : xpAmount;
        
        this.awardXP(totalXP, `${this.getGameDisplayName(game)} selected${isFavorite ? ' (favorite bonus!)' : '!'}`);

        // Track this game selection
        this.xpData.selectedGames.push(gameSelectionKey);
        this.saveXPData();

        this.updateGameSelection(gameBtn, game);
        this.displayCodes(game);
    }

    updateGameSelection(gameBtn, game) {
        // Update active state
        document.querySelectorAll('.game-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        gameBtn.classList.add('active');

        this.currentGame = game;
        
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
        const codeId = `${this.currentGame}-${code}`;
        
        // Check if already redeemed (no XP for re-clicking)
        if (!this.xpData.redeemedCodes.includes(codeId)) {
            const xpAmount = Math.floor(Math.random() * 13) + 8; // 8-20 XP (more logical)
            this.awardXP(xpAmount, `Copied code: ${code}!`);
            this.xpData.redeemedCodes.push(codeId);
            this.saveXPData();
        }
        
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
        
        // Check if user already voted on this code
        const voteKey = `${codeId}-${isUpvote ? 'up' : 'down'}`;
        const hasVoted = this.xpData.votedCodes.includes(voteKey);
        
        // Only award XP for first vote on this code
        if (!hasVoted) {
            this.awardXP(1, 'Code feedback!');
            this.xpData.votedCodes.push(voteKey);
            this.saveXPData();
        }
        
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
            this.awardXP(2, 'Code report submitted!');
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
        
        this.updateNotificationBar("Failed to fetch latest codes");
    }

    showWelcomeState() {
        this.hideAllStates();
        const welcomeState = document.getElementById('welcome-state');
        if (welcomeState) {
            welcomeState.classList.remove('hidden');
        }
        
        this.updateNotificationBar("No new codes added to any games.");
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
        if (!code.date) return false;
        
        const codeDate = new Date(code.date);
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
        // Add CSS for notifications and XP system
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

