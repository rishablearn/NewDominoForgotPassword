/**
 * Profile Update Module
 * Handles security question update flow
 */

const profileModule = {
    questions: [],
    currentProfile: null,
    
    /**
     * Initialize the profile page
     */
    async init() {
        await this.checkAuthAndProfile();
        this.bindEvents();
    },

    /**
     * Check authentication and load existing profile
     */
    async checkAuthAndProfile() {
        const authCheck = document.getElementById('authCheck');
        const updateForm = document.getElementById('updateForm');
        const notRegistered = document.getElementById('notRegistered');
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
                this.currentProfile = profileResult.profile;
                await this.loadSecurityQuestions();
                this.populateForm();
                updateForm.classList.remove('hidden');
            } else {
                notRegistered.classList.remove('hidden');
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
                select.innerHTML = '<option value="">-- Select a question --</option>';
                
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
     * Populate form with current profile data
     */
    populateForm() {
        if (!this.currentProfile) return;
        
        // Find matching question indices
        const profileQuestions = this.currentProfile.questions || [];
        
        ['question1', 'question2', 'question3'].forEach((selectId, idx) => {
            const select = document.getElementById(selectId);
            if (select && profileQuestions[idx]) {
                // Find the index of the current question
                const questionIdx = this.questions.findIndex(q => q === profileQuestions[idx]);
                if (questionIdx >= 0) {
                    select.value = questionIdx;
                }
            }
        });
        
        this.updateQuestionOptions();
    },

    /**
     * Bind form events
     */
    bindEvents() {
        // Form submission
        document.getElementById('updateForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpdate();
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
                
                const isSelectedElsewhere = selected.includes(option.value) && option.value !== currentValue;
                option.disabled = isSelectedElsewhere;
            });
        });
    },

    /**
     * Handle profile update form submission
     */
    async handleUpdate() {
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
            const result = await DominoAPI.updateProfile({
                question1: this.questions[q1],
                question2: this.questions[q2],
                question3: this.questions[q3],
                answer1: a1,
                answer2: a2,
                answer3: a3
            });

            if (result.success) {
                this.showAlert('success', AppConfig.messages.updateSuccess);
                // Clear answer fields
                document.getElementById('answer1').value = '';
                document.getElementById('answer2').value = '';
                document.getElementById('answer3').value = '';
            } else {
                this.showAlert('error', result.error || AppConfig.messages.error);
            }
        } catch (error) {
            console.error('Update error:', error);
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
            btn.innerHTML = loading ? '<span class="spinner"></span> Updating...' : 'Update Profile';
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    profileModule.init();
});
