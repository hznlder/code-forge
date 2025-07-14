// Achievement Board System for CodeForge
// This file contains all achievement-related functionality

// Add achievement board functionality to CodeForge
CodeForge.prototype.showAchievements = function() {
    const achievements = [
        { id: 'first_100', threshold: 100, title: 'Getting Started', description: 'Earned your first 100 XP!', icon: 'fas fa-star', xpReward: 0 },
        { id: 'first_500', threshold: 500, title: 'Code Hunter', description: 'Reached 500 XP milestone!', icon: 'fas fa-search', xpReward: 0 },
        { id: 'first_1000', threshold: 1000, title: 'Dedicated User', description: 'Achieved 1,000 XP!', icon: 'fas fa-medal', xpReward: 0 },
        { id: 'first_5000', threshold: 5000, title: 'XP Master', description: 'Incredible milestone at 5,000 XP!', icon: 'fas fa-crown', xpReward: 0 },
        { id: 'code_collector', threshold: 0, title: 'Code Collector', description: 'Copied your first code!', icon: 'fas fa-clipboard', xpReward: 0 },
        { id: 'game_explorer', threshold: 0, title: 'Game Explorer', description: 'Explored all three games!', icon: 'fas fa-gamepad', xpReward: 0 },
        { id: 'daily_visitor', threshold: 0, title: 'Daily Visitor', description: 'Visited the site for 7 consecutive days!', icon: 'fas fa-calendar-check', xpReward: 0 },
        { id: 'social_supporter', threshold: 0, title: 'Social Supporter', description: 'Clicked on an advertisement!', icon: 'fas fa-heart', xpReward: 0 },
        { id: 'telegram_member', threshold: 0, title: 'Telegram Member', description: 'Join our Telegram group and get 50 XP!', icon: 'fab fa-telegram', xpReward: 50 },
        { id: 'youtube_subscriber', threshold: 0, title: 'YouTube Subscriber', description: 'Subscribe to our YouTube channel and get 50 XP!', icon: 'fab fa-youtube', xpReward: 50 },
        { id: 'hoyolab_follower', threshold: 0, title: 'HoYoLAB Follower', description: 'Follow us on HoYoLAB and get 45 XP!', icon: 'fas fa-globe', xpReward: 45 },
        { id: 'ad_clicker', threshold: 200, title: 'Ad Clicker', description: 'Click on 200 ads and get 500 XP!', icon: 'fas fa-mouse-pointer', xpReward: 500 }
    ];

    const modal = document.getElementById("achievements-board-modal");
    const achievementsList = document.getElementById("achievements-grid");
    const unlockedCount = document.getElementById("achievements-unlocked-count");
    const totalCount = document.getElementById("achievements-total-count");
    const completePercentage = document.getElementById("achievements-complete-percentage");

    if (!modal || !achievementsList || !unlockedCount || !totalCount || !completePercentage) {
        console.error("Achievement board elements not found.");
        return;
    }

    unlockedCount.textContent = this.xpData.achievements.length;
    totalCount.textContent = achievements.length;
    completePercentage.textContent = `${Math.round((this.xpData.achievements.length / achievements.length) * 100)}%`;

    achievementsList.innerHTML = achievements.map(achievement => {
        const isUnlocked = this.xpData.achievements.includes(achievement.id);
        const isXPBased = achievement.threshold > 0;
        const progress = isXPBased ? Math.min(100, (this.xpData.currentXP / achievement.threshold) * 100) : 0;
        
        let actionButton = "";
        if (!isUnlocked) {
            if (achievement.id === "telegram_member" || achievement.id === "youtube_subscriber" || achievement.id === "hoyolab_follower") {
                const platform = achievement.id.split("_")[0];
                const verificationStatus = this.xpData.socialVerifications[platform];
                if (verificationStatus.status === "pending") {
                    actionButton = `<button class="achievement-action-btn pending" disabled>Pending (${this.getVerificationTimeLeft(verificationStatus.submitTime)})</button>`;
                } else if (verificationStatus.status === "failed") {
                    actionButton = `<button class="achievement-action-btn retry" onclick="codeForge.retrySocialVerification('${platform}')">Retry</button>`;
                } else if (verificationStatus.status === "completed") {
                    actionButton = `<button class="achievement-action-btn completed" disabled>Verified</button>`;
                } else {
                    actionButton = `<button class="achievement-action-btn" onclick="codeForge.startSocialVerification('${platform}')">Verify</button>`;
                }
            } else if (achievement.id === "ad_clicker" && this.xpData.adClickCount >= achievement.threshold) {
                actionButton = `<button class="achievement-action-btn" onclick="codeForge.claimAchievement('${achievement.id}', ${achievement.xpReward})">Claim</button>`;
            }
        }

        return `
            <div class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">
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
                    ` : ""}
                    ${actionButton}
                </div>
                ${isUnlocked ? '<div class="achievement-badge"><i class="fas fa-check"></i></div>' : ""}
            </div>
        `;
    }).join("");

    modal.classList.add("show");
};

CodeForge.prototype.closeAchievementsBoard = function() {
    const modal = document.getElementById("achievements-board-modal");
    if (modal) {
        modal.classList.remove("show");
    }
};

CodeForge.prototype.claimAchievement = function(achievementId, xpReward) {
    if (!this.xpData.achievements.includes(achievementId)) {
        this.xpData.achievements.push(achievementId);
        this.awardXP(xpReward, `Achievement claimed: ${xpReward} XP!`);
        this.showNotification(`🎉 Achievement claimed! +${xpReward} XP`, 'success');
        this.saveXPData();
        
        // Refresh achievements modal
        this.closeAchievementsBoard();
        setTimeout(() => this.showAchievements(), 300);
    }
};

// Social Media Verification System
CodeForge.prototype.startSocialVerification = function(platform) {
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
};

CodeForge.prototype.submitVerification = function(platform) {
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
};

CodeForge.prototype.scheduleVerificationProcessing = function(platform) {
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
};

CodeForge.prototype.processVerification = function(platform, shouldSucceed) {
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
};

CodeForge.prototype.retrySocialVerification = function(platform) {
    // Reset status to allow retry
    this.xpData.socialVerifications[platform].status = 'none';
    this.saveXPData();
    
    // Start verification process again
    this.startSocialVerification(platform);
};

CodeForge.prototype.getVerificationTimeLeft = function(submitTime) {
    const now = Date.now();
    const elapsed = now - submitTime;
    const total = 24 * 60 * 60 * 1000; // 24 hours
    const remaining = Math.max(0, total - elapsed);
    
    if (remaining === 0) return 'Processing...';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m remaining`;
};

CodeForge.prototype.closeVerificationModal = function() {
    const modal = document.querySelector('.verification-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

