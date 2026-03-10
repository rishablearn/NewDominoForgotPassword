/**
 * API Module for communicating with Domino Agents
 * All agent calls return JSON responses
 */

const DominoAPI = {
    /**
     * Base method for calling Domino agents
     * @param {string} agentUrl - The agent URL
     * @param {object} data - Data to send (for POST requests)
     * @param {string} method - HTTP method (GET or POST)
     * @returns {Promise} - Promise resolving to JSON response
     */
    async callAgent(agentUrl, data = null, method = 'GET') {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include' // Include cookies for authentication
            };

            if (data && method === 'POST') {
                options.body = JSON.stringify(data);
            }

            // Build URL with query params for GET requests
            let url = agentUrl;
            if (data && method === 'GET') {
                const params = new URLSearchParams(data);
                url = `${agentUrl}&${params.toString()}`;
            }

            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            
            // Try to parse as JSON, return raw text if fails
            try {
                return JSON.parse(text);
            } catch (e) {
                return { success: false, error: 'Invalid response format', raw: text };
            }
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Check if user is authenticated
     * @returns {Promise} - User info or anonymous status
     */
    async checkAuthentication() {
        return this.callAgent(AppConfig.agents.checkAuth);
    },

    /**
     * Get available security questions
     * @returns {Promise} - List of security questions
     */
    async getSecurityQuestions() {
        const result = await this.callAgent(AppConfig.agents.getQuestions);
        if (result.success && result.questions) {
            return result.questions;
        }
        // Return default questions if agent fails
        return AppConfig.defaultQuestions;
    },

    /**
     * Lookup user profile by email
     * @param {string} email - User's email address
     * @returns {Promise} - Profile info or not found status
     */
    async lookupProfile(email) {
        return this.callAgent(AppConfig.agents.lookupProfile, { email: email });
    },

    /**
     * Register new security profile
     * @param {object} profileData - Registration data
     * @returns {Promise} - Success or error status
     */
    async registerProfile(profileData) {
        return this.callAgent(AppConfig.agents.registerProfile, profileData, 'POST');
    },

    /**
     * Update existing security profile
     * @param {object} profileData - Updated profile data
     * @returns {Promise} - Success or error status
     */
    async updateProfile(profileData) {
        return this.callAgent(AppConfig.agents.updateProfile, profileData, 'POST');
    },

    /**
     * Verify security question answers
     * @param {string} email - User's email
     * @param {array} answers - Array of answers
     * @returns {Promise} - Verification result
     */
    async verifyAnswers(email, answers) {
        return this.callAgent(AppConfig.agents.verifyAnswers, {
            email: email,
            answers: answers
        }, 'POST');
    },

    /**
     * Reset user password
     * @param {string} email - User's email
     * @param {string} newPassword - New password
     * @param {string} token - Verification token from verifyAnswers
     * @returns {Promise} - Reset result with HTTP and vault status
     */
    async resetPassword(email, newPassword, token) {
        return this.callAgent(AppConfig.agents.resetPassword, {
            email: email,
            password: newPassword,
            token: token
        }, 'POST');
    },

    /**
     * Get application configuration
     * @returns {Promise} - Configuration settings
     */
    async getConfiguration() {
        return this.callAgent(AppConfig.agents.getConfig);
    }
};

// Freeze API object
Object.freeze(DominoAPI);
