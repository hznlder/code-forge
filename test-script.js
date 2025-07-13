// Test script with mock data to verify functionality
class CodeForgeTest extends CodeForge {
    constructor() {
        super();
        // Override API URL to use mock data
        this.API_URL = null;
    }

    async fetchCodes() {
        this.showLoadingState();

        try {
            // Mock data that matches the expected API structure
            const mockData = {
                "genshin": [
                    {
                        "code": "GENSHINGIFT",
                        "description": "50 Primogems, 3 Hero's Wit",
                        "added_at": Math.floor(Date.now() / 1000) - 86400 // 1 day ago
                    },
                    {
                        "code": "NEWCODE2025",
                        "description": "100 Primogems, 5 Mystic Enhancement Ore",
                        "added_at": Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
                    },
                    {
                        "code": "EVENTCODE",
                        "description": "Limited time event rewards",
                        "added_at": Math.floor(Date.now() / 1000) - 7200 // 2 hours ago
                    }
                ],
                "hsr": [
                    {
                        "code": "STARRAILGIFT",
                        "description": "50 Stellar Jade, 2 Traveler's Guide",
                        "added_at": Math.floor(Date.now() / 1000) - 86400
                    },
                    {
                        "code": "HSRCODE2025",
                        "description": "100 Stellar Jade, 3 Refined Aether",
                        "added_at": Math.floor(Date.now() / 1000) - 1800
                    }
                ],
                "zzz": [
                    {
                        "code": "ZENLESSGIFT",
                        "description": "50 Polychrome, 2 Agent EXP",
                        "added_at": Math.floor(Date.now() / 1000) - 86400
                    },
                    {
                        "code": "ZZZCODE2025",
                        "description": "100 Polychrome, 5 Dennies",
                        "added_at": Math.floor(Date.now() / 1000) - 900
                    }
                ],
                "retcode": 0,
                "previous_update": Math.floor(Date.now() / 1000) - 3600,
                "latest_update": Math.floor(Date.now() / 1000)
            };

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check for new codes for updates bar
            this.checkForNewCodes(mockData);
            
            this.allCodes = mockData;
            this.updateLastChecked();
            
            if (this.currentGame) {
                this.displayCodes(this.currentGame);
            } else {
                this.showWelcomeState();
            }

        } catch (error) {
            console.error('Failed to fetch codes:', error);
            this.showErrorState(`Failed to load codes: ${error.message}`);
        }
    }
}

// Replace the original CodeForge with the test version
document.addEventListener('DOMContentLoaded', () => {
    window.codeForge = new CodeForgeTest();
});

