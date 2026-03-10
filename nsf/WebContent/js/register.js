/**
 * Registration Module
 * Handles security question registration flow
 */

const registerModule = {
    questions: [],
    
    /**
     * Initialize the registration page
     */
    async init() {
        await this.checkAuthAndProfile();
        this.bindEvents();
    },

    /**
     * Check authentication and existing profile
     */
    async checkAuthAndProfile() {
        const authCheck = document.getElementById('authCheck');
        const registerForm = document.getElementById('registerForm');
        const alreadyRegistered = document.getElementById('alreadyRegistered');
        const notAuthenticated = document.getElementById('notAuthenticated');

        try {
            // Check authentication
            const authResult = await DominoAPI.checkAuthentication();
            
            if (!authResult.success || authResult.anonymous) {
                authCheck.classList.add('hidden');
                notAuthenticated.classList.remove('hidden');
                return;
            }

            // Update user info
            document.getElementById('userName').textContent = authResult.userName || 'Unknown';
            document.getElementById('userEmail').textContent = authResult.email || 'Unknown';

            // Check for existing profile
            const profileResult = await DominoAPI.lookupProfile(authResult.email);
            
            authCheck.classList.add('hidden');
            
            if (profileResult.success && profileResult.profile) {
                alreadyRegistered.classList.remove('hidden');
            } else {
                // Load questions and show form
                await this.loadSecurityQuestions();
                registerForm.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Initialization error:', error);
            this.showAlert('error', AppConfig.messages.error);
        }
    },

    /**
     * Load security questions into dropdowns
     */
    async loadSecurityQuestions() {
        this.questions = await DominoAPI.getSecurityQuestions();
        
        const selects = ['question1', 'question2', 'question3'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options except first
                select.innerHTML = '<option value="">-- Select a question --</option>';
                
                // Add questions
                this.questions.forEach((question, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = question;
                    select.appendChild(option);
                });
            }
        });
    },

    /**
     * Bind form events
     */
    bindEvents() {
        // Form submission
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Question change handlers to prevent duplicates
        ['question1', 'question2', 'question3'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                this.updateQuestionOptions();
            });
        });
    },

    /**
     * Update question options to prevent duplicate selection
     */
    updateQuestionOptions() {
        const selected = [
            document.getElementById('question1').value,
            document.getElementById('question2').value,
            document.getElementById('question3').value
        ].filter(v => v !== '');

        ['question1', 'question2', 'question3'].forEach(selectId => {
            const select = document.getElementById(selectId);
            const currentValue = select.value;
            
            Array.from(select.options).forEach(option => {
                if (option.value === '') return;
                
                // Disable if selected in another dropdown
                const isSelectedElsewhere = selected.includes(option.value) && option.value !== currentValue;
                option.disabled = isSelectedElsewhere;
            });
        });
    },

    /**
     * Handle registration form submission
     */
    async handleRegistration() {
        // Validate form
        const q1 = document.getElementById('question1').value;
        const q2 = document.getElementById('question2').value;
        const q3 = document.getElementById('question3').value;
        const a1 = document.getElementById('answer1').value.trim();
        const a2 = document.getElementById('answer2').value.trim();
        const a3 = document.getElementById('answer3').value.trim();

        // Check all fields filled
        if (!q1 || !q2 || !q3 || !a1 || !a2 || !a3) {
            this.showAlert('error', 'Please complete all fields.');
            return;
        }

        // Check unique questions
        if (q1 === q2 || q1 === q3 || q2 === q3) {
            this.showAlert('error', 'Please select three different questions.');
            return;
        }

        // Check minimum answer length
        if (a1.length < 2 || a2.length < 2 || a3.length < 2) {
            this.showAlert('error', 'Answers must be at least 2 characters long.');
            return;
        }

        this.showLoading(true);

        try {
            const result = await DominoAPI.registerProfile({
                question1: this.questions[q1],
                question2: this.questions[q2],
                question3: this.questions[q3],
                answer1: a1,
                answer2: a2,
                answer3: a3
            });

            if (result.success) {
                this.showAlert('success', AppConfig.messages.registrationSuccess);
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                this.showAlert('error', result.error || AppConfig.messages.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showAlert('error', AppConfig.messages.error);
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Show alert message
     */
    showAlert(type, message) {
        const container = document.getElementById('alertContainer');
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        container.scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * Show/hide loading state
     */
    showLoading(loading) {
        const btn = document.querySelector('.btn-primary');
        if (btn) {
            btn.classList.toggle('loading', loading);
            btn.innerHTML = loading ? '<span class="spinner"></span> Registering...' : 'Register';
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    registerModule.init();
});
