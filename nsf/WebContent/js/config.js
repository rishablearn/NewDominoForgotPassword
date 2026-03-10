/**
 * Configuration for Self-Service Password Reset Application
 * Modify these settings to match your Domino environment
 */

const AppConfig = {
    // Application Settings
    appTitle: 'Self-Service Password Reset',
    companyName: 'Your Company',
    supportEmail: 'helpdesk@company.com',
    supportPhone: '1-800-555-1234',
    
    // Agent URLs (relative to database)
    agents: {
        checkAuth: 'CheckAuthentication?OpenAgent',
        getQuestions: 'GetSecurityQuestions?OpenAgent',
        lookupProfile: 'LookupProfile?OpenAgent',
        registerProfile: 'RegisterProfile?OpenAgent',
        updateProfile: 'UpdateProfile?OpenAgent',
        verifyAnswers: 'VerifyAnswers?OpenAgent',
        resetPassword: 'ResetPassword?OpenAgent',
        getConfig: 'GetConfiguration?OpenAgent'
    },
    
    // Security Settings
    maxFailedAttempts: 5,
    sessionTimeoutMinutes: 15,
    
    // Password Requirements
    passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true
    },
    
    // Default Security Questions
    defaultQuestions: [
        "What is your mother's maiden name?",
        "What was the name of your first pet?",
        "In what city were you born?",
        "What is your favorite movie?",
        "What was the make of your first car?",
        "What is your favorite book?",
        "What was your childhood nickname?",
        "What street did you grow up on?",
        "What is your favorite sports team?",
        "What was the name of your elementary school?",
        "What is your favorite food?",
        "What was your first job?"
    ],
    
    // Messages
    messages: {
        loading: 'Loading...',
        processing: 'Processing...',
        success: 'Operation completed successfully.',
        error: 'An error occurred. Please try again.',
        sessionExpired: 'Your session has expired. Please start over.',
        accountLocked: 'Your account has been locked due to too many failed attempts. Please contact support.',
        invalidEmail: 'Please enter a valid email address.',
        profileNotFound: 'No profile found for this email. Please register first.',
        answersIncorrect: 'One or more answers are incorrect. Please try again.',
        passwordMismatch: 'Passwords do not match.',
        passwordWeak: 'Password does not meet complexity requirements.',
        registrationSuccess: 'Your security questions have been registered successfully.',
        updateSuccess: 'Your profile has been updated successfully.',
        resetSuccess: 'Your password has been reset successfully.'
    }
};

// Freeze config to prevent modifications
Object.freeze(AppConfig);
Object.freeze(AppConfig.agents);
Object.freeze(AppConfig.passwordRequirements);
Object.freeze(AppConfig.messages);
