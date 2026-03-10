/**
 * Password Reset Wizard Module
 * Handles the multi-step password reset flow
 */

const resetWizard = {
    currentStep: 1,
    email: '',
    questions: [],
    verificationToken: null,
    failedAttempts: 0,

    /**
     * Initialize the wizard
     */
    init() {
        this.bindEvents();
        this.updateProgress();
    },

    /**
     * Bind form events
     */
    bindEvents() {
        // Email form submission
        document.getElementById('emailForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEmailSubmit();
        });

        // Questions form submission
        document.getElementById('questionsForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuestionsSubmit();
        });

        // Password form submission
        document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordSubmit();
        });

        // Password strength meter
        document.getElementById('newPassword')?.addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
            this.validatePasswordRequirements(e.target.value);
        });
    },

    /**
     * Handle email form submission
     */
    async handleEmailSubmit() {
        const email = document.getElementById('email').value.trim();
        
        if (!this.validateEmail(email)) {
            this.showAlert('error', AppConfig.messages.invalidEmail);
            return;
        }

        this.showLoading(true);
        
        try {
            const result = await DominoAPI.lookupProfile(email);
            
            if (result.success && result.profile) {
                this.email = email;
                this.questions = result.profile.questions;
                this.displayQuestions();
                this.goToStep(2);
            } else if (result.locked) {
                this.showAlert('error', AppConfig.messages.accountLocked);
            } else {
                this.showAlert('error', AppConfig.messages.profileNotFound);
            }
        } catch (error) {
            this.showAlert('error', AppConfig.messages.error);
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Display security questions
     */
    displayQuestions() {
        if (this.questions.length >= 3) {
            document.getElementById('question1Label').textContent = this.questions[0];
            document.getElementById('question2Label').textContent = this.questions[1];
            document.getElementById('question3Label').textContent = this.questions[2];
        }
    },

    /**
     * Handle security questions submission
     */
    async handleQuestionsSubmit() {
        const answers = [
            document.getElementById('answer1').value.trim(),
            document.getElementById('answer2').value.trim(),
            document.getElementById('answer3').value.trim()
        ];

        if (answers.some(a => !a)) {
            this.showAlert('error', 'Please answer all security questions.');
            return;
        }

        this.showLoading(true);

        try {
            const result = await DominoAPI.verifyAnswers(this.email, answers);
            
            if (result.success && result.token) {
                this.verificationToken = result.token;
                this.failedAttempts = 0;
                this.goToStep(3);
            } else if (result.locked) {
                this.showAlert('error', AppConfig.messages.accountLocked);
                this.goToStep(1);
            } else {
                this.failedAttempts++;
                const remaining = AppConfig.maxFailedAttempts - this.failedAttempts;
                
                if (remaining > 0) {
                    this.showAlert('error', `${AppConfig.messages.answersIncorrect} (${remaining} attempts remaining)`);
                } else {
                    this.showAlert('error', AppConfig.messages.accountLocked);
                    this.goToStep(1);
                }
            }
        } catch (error) {
            this.showAlert('error', AppConfig.messages.error);
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Handle password form submission
     */
    async handlePasswordSubmit() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            this.showAlert('error', AppConfig.messages.passwordMismatch);
            return;
        }

        // Validate password strength
        if (!this.isPasswordStrong(newPassword)) {
            this.showAlert('error', AppConfig.messages.passwordWeak);
            return;
        }

        this.showLoading(true);

        try {
            const result = await DominoAPI.resetPassword(
                this.email,
                newPassword,
                this.verificationToken
            );

            if (result.success) {
                // Update status display
                document.getElementById('httpStatus').textContent = 
                    result.httpReset ? 'Updated ✓' : 'Failed ✗';
                document.getElementById('vaultStatus').textContent = 
                    result.vaultReset ? 'Updated ✓' : 'Not Available';
                
                this.goToStep(4);
            } else {
                this.showAlert('error', result.error || AppConfig.messages.error);
            }
        } catch (error) {
            this.showAlert('error', AppConfig.messages.error);
        } finally {
            this.showLoading(false);
        }
    },

    /**
     * Navigate to a specific step
     * @param {number} step - Step number (1-4)
     */
    goToStep(step) {
        // Hide all steps
        document.querySelectorAll('.wizard-step').forEach(el => {
            el.classList.add('hidden');
        });

        // Show target step
        document.getElementById(`step${step}`)?.classList.remove('hidden');
        
        this.currentStep = step;
        this.updateProgress();
        this.clearAlert();
    },

    /**
     * Update progress indicator
     */
    updateProgress() {
        document.querySelectorAll('.progress-step').forEach((el, index) => {
            const stepNum = index + 1;
            el.classList.remove('active', 'completed');
            
            if (stepNum < this.currentStep) {
                el.classList.add('completed');
            } else if (stepNum === this.currentStep) {
                el.classList.add('active');
            }
        });
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Update password strength meter
     * @param {string} password - Password to check
     */
    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        const strength = this.calculatePasswordStrength(password);
        
        strengthBar.className = 'strength-bar';
        
        if (strength < 25) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (strength < 50) {
            strengthBar.classList.add('fair');
            strengthText.textContent = 'Fair';
        } else if (strength < 75) {
            strengthBar.classList.add('good');
            strengthText.textContent = 'Good';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    },

    /**
     * Calculate password strength score
     * @param {string} password - Password to evaluate
     * @returns {number} - Score 0-100
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 10;
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^a-zA-Z0-9]/.test(password)) score += 20;
        
        return Math.min(100, score);
    },

    /**
     * Validate password requirements and update UI
     * @param {string} password - Password to validate
     */
    validatePasswordRequirements(password) {
        const requirements = {
            'req-length': password.length >= AppConfig.passwordRequirements.minLength,
            'req-upper': /[A-Z]/.test(password),
            'req-lower': /[a-z]/.test(password),
            'req-number': /[0-9]/.test(password),
            'req-special': /[^a-zA-Z0-9]/.test(password)
        };

        Object.entries(requirements).forEach(([id, valid]) => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.toggle('valid', valid);
            }
        });
    },

    /**
     * Check if password meets all requirements
     * @param {string} password - Password to check
     * @returns {boolean}
     */
    isPasswordStrong(password) {
        const req = AppConfig.passwordRequirements;
        
        if (password.length < req.minLength) return false;
        if (req.requireUppercase && !/[A-Z]/.test(password)) return false;
        if (req.requireLowercase && !/[a-z]/.test(password)) return false;
        if (req.requireNumber && !/[0-9]/.test(password)) return false;
        if (req.requireSpecial && !/[^a-zA-Z0-9]/.test(password)) return false;
        
        return true;
    },

    /**
     * Show alert message
     * @param {string} type - Alert type (success, error, warning, info)
     * @param {string} message - Message to display
     */
    showAlert(type, message) {
        const container = document.getElementById('alertContainer');
        container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    },

    /**
     * Clear alert messages
     */
    clearAlert() {
        const container = document.getElementById('alertContainer');
        if (container) container.innerHTML = '';
    },

    /**
     * Show/hide loading state
     * @param {boolean} loading - Loading state
     */
    showLoading(loading) {
        const buttons = document.querySelectorAll('.btn-primary');
        buttons.forEach(btn => {
            btn.classList.toggle('loading', loading);
            if (loading) {
                btn.innerHTML = '<span class="spinner"></span> Processing...';
            } else {
                // Restore original text based on step
                if (this.currentStep === 1) btn.textContent = 'Continue';
                else if (this.currentStep === 2) btn.textContent = 'Verify';
                else if (this.currentStep === 3) btn.textContent = 'Reset Password';
            }
        });
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    resetWizard.init();
});
