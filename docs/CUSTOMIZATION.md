# Customization Guide

## Branding Customization

### Logo and Images

1. **Replace Logo:**
   - Prepare logo image (recommended: PNG, 200x50px)
   - Open Front-End database in Designer
   - Navigate to Resources → Images
   - Replace `logo.png` with your company logo
   - Or update LOGO_URL keyword to external URL

2. **Favicon:**
   - Replace `favicon.ico` in Resources
   - Size: 32x32 or 16x16 pixels

3. **Banner Image:**
   - Replace `banner.png` in Resources
   - Recommended size: 1200x200px

### Colors and Styling

Edit the CSS file: `Resources/StyleSheets/app.css`

```css
/* Primary brand color */
:root {
    --primary-color: #0056b3;      /* Change to your brand color */
    --primary-hover: #004494;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
}

/* Header styling */
.app-header {
    background-color: var(--primary-color);
}

/* Button styling */
.btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}
```

### Company Name and Text

Update keywords in configuration:

```
APP_TITLE: Your Company Password Portal
COMPANY_NAME: Your Company Inc.
SUPPORT_EMAIL: it-support@yourcompany.com
SUPPORT_PHONE: 1-800-123-4567
```

### Footer Text

Edit Custom Control: `ccAppLayout.xsp`

```xml
<xp:div styleClass="app-footer">
    <xp:text value="© 2024 Your Company. All rights reserved." />
    <xp:link text="Privacy Policy" value="/privacy" />
    <xp:link text="Terms of Use" value="/terms" />
</xp:div>
```

## Layout Customization

### ccAppLayout Custom Control

This control defines the overall page structure. Key sections:

```xml
<!-- Header Section -->
<xp:div id="header" styleClass="app-header">
    <xp:image url="/logo.png" alt="Company Logo" />
    <xp:text value="#{configBean.appTitle}" styleClass="app-title" />
</xp:div>

<!-- Navigation -->
<xp:div id="nav" styleClass="app-nav">
    <!-- Add/remove navigation items here -->
</xp:div>

<!-- Content Area -->
<xp:div id="content" styleClass="app-content">
    <xp:callback facetName="content" />
</xp:div>

<!-- Footer Section -->
<xp:div id="footer" styleClass="app-footer">
    <!-- Footer content -->
</xp:div>
```

### Page Layouts

Available layout options in ccAppLayout:

| Property | Values | Description |
|----------|--------|-------------|
| showHeader | true/false | Toggle header visibility |
| showNav | true/false | Toggle navigation |
| showFooter | true/false | Toggle footer |
| contentWidth | narrow/medium/wide/full | Content area width |
| theme | light/dark | Color scheme |

Usage in XPage:
```xml
<xc:ccAppLayout showNav="false" contentWidth="narrow" theme="light">
    <xp:this.facets>
        <xp:panel xp:key="content">
            <!-- Page content here -->
        </xp:panel>
    </xp:this.facets>
</xc:ccAppLayout>
```

## Security Questions Customization

### Modify Question List

Edit keyword document `SECURITY_QUESTIONS`:

```
What was your first car?
What is your pet's name?
What city were you born in?
What was your high school mascot?
What is your favorite vacation destination?
What was your first job?
What is your mother's maiden name?
What street did you grow up on?
What is your favorite sports team?
What was the name of your best childhood friend?
```

### Question Categories (Optional)

Organize questions by category:

```
[Personal]
What is your mother's maiden name?
What city were you born in?
What was your childhood nickname?

[Preferences]
What is your favorite movie?
What is your favorite book?
What is your favorite sports team?

[History]
What was your first car?
What was your first job?
What school did you attend?
```

### Localization

For multi-language support, create language-specific keywords:

```
SECURITY_QUESTIONS_EN: [English questions]
SECURITY_QUESTIONS_ES: [Spanish questions]
SECURITY_QUESTIONS_FR: [French questions]
```

## Message Customization

### Error Messages

Edit `ScriptLibraries/messages.jss`:

```javascript
var messages = {
    EMAIL_NOT_FOUND: "We couldn't find an account with that email address.",
    ACCOUNT_LOCKED: "Your account has been locked. Please try again in {0} minutes.",
    ANSWERS_INCORRECT: "One or more answers are incorrect. Please try again.",
    PASSWORD_MISMATCH: "The passwords you entered don't match.",
    PASSWORD_WEAK: "Your password doesn't meet the security requirements.",
    RESET_SUCCESS: "Your password has been successfully reset!",
    RESET_PARTIAL: "HTTP password updated. ID Vault password could not be updated - please contact IT support.",
    SESSION_EXPIRED: "Your session has expired. Please start over.",
    SYSTEM_ERROR: "An unexpected error occurred. Please try again or contact support."
};
```

### Success Messages

```javascript
var successMessages = {
    REGISTRATION_COMPLETE: "You're all set! Your security questions have been saved.",
    PROFILE_UPDATED: "Your security profile has been updated successfully.",
    PASSWORD_RESET: "Your password has been reset for all services."
};
```

### Help Text

Customize help text shown on each step:

```javascript
var helpText = {
    step1: "Enter the email address associated with your account.",
    step2: "Answer your security questions exactly as you entered them during registration.",
    step3: "Choose a strong password that meets the requirements below.",
    step4: "Your password has been updated. You can now sign in with your new password."
};
```

## Wizard Flow Customization

### Add Additional Steps

To add a verification step (e.g., CAPTCHA or email code):

1. Edit `xpResetWizard.xsp`
2. Add new panel in Dynamic Content:

```xml
<xp:panel id="step2a" styleClass="wizard-step">
    <xp:text value="Email Verification" tagName="h3" />
    <xp:text value="Enter the code sent to your email:" />
    <xp:inputText id="verificationCode" 
                  value="#{viewScope.verificationCode}"
                  required="true" />
    <xp:button value="Verify Code" id="btnVerifyCode">
        <xp:eventHandler event="onclick" submit="true"
                         refreshMode="partial" refreshId="wizardContent">
            <xp:this.action>
                <xp:actionGroup>
                    <xp:executeScript
                        script="#{javascript:wizardBean.verifyEmailCode()}" />
                </xp:actionGroup>
            </xp:this.action>
        </xp:eventHandler>
    </xp:button>
</xp:panel>
```

3. Update wizard bean to handle new step

### Remove Steps

To skip directly from email to password (remove questions):

1. Modify wizard bean `currentStep` logic
2. Update navigation buttons
3. **Security Warning:** This removes a security layer

### Change Step Order

Edit `WizardBean.java`:

```java
public enum WizardStep {
    EMAIL_ENTRY(1),
    EMAIL_VERIFICATION(2),  // Optional
    SECURITY_QUESTIONS(3),
    NEW_PASSWORD(4),
    CONFIRMATION(5);
    
    // Modify order or add/remove steps
}
```

## Email Template Customization

### Password Reset Notification

Edit `Resources/EmailTemplates/reset_notification.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background-color: #0056b3; color: white; padding: 20px; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #666; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{COMPANY_NAME}}</h1>
        </div>
        <div class="content">
            <h2>Password Reset Confirmation</h2>
            <p>Hello {{USER_NAME}},</p>
            <p>Your password was successfully reset on {{DATE_TIME}}.</p>
            <p>If you did not make this change, please contact IT support immediately:</p>
            <ul>
                <li>Email: {{SUPPORT_EMAIL}}</li>
                <li>Phone: {{SUPPORT_PHONE}}</li>
            </ul>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
```

## Advanced Customization

### Custom Validation Rules

Add custom password validation in `PasswordValidator.java`:

```java
public class PasswordValidator {
    
    // Add custom rule: no dictionary words
    public boolean containsDictionaryWord(String password) {
        String[] commonWords = {"password", "letmein", "welcome", "admin"};
        String lowerPassword = password.toLowerCase();
        for (String word : commonWords) {
            if (lowerPassword.contains(word)) {
                return true;
            }
        }
        return false;
    }
    
    // Add custom rule: no keyboard patterns
    public boolean containsKeyboardPattern(String password) {
        String[] patterns = {"qwerty", "asdf", "zxcv", "1234", "0987"};
        String lowerPassword = password.toLowerCase();
        for (String pattern : patterns) {
            if (lowerPassword.contains(pattern)) {
                return true;
            }
        }
        return false;
    }
}
```

### Custom Logging

Extend audit logging in `AuditLogger.java`:

```java
public void logCustomEvent(String eventType, String userId, Map<String, String> details) {
    Document logDoc = database.createDocument();
    logDoc.replaceItemValue("Form", "AuditLog");
    logDoc.replaceItemValue("EventType", eventType);
    logDoc.replaceItemValue("UserId", userId);
    logDoc.replaceItemValue("Timestamp", new DateTime());
    logDoc.replaceItemValue("Details", details.toString());
    logDoc.replaceItemValue("IPAddress", facesContext.getExternalContext()
        .getRequest().getRemoteAddr());
    logDoc.save();
}
```

### Integration with External Systems

Example: Integrate with ServiceNow for ticket creation on lockout:

```java
public void createLockoutTicket(String userId, String email) {
    // ServiceNow API integration
    String endpoint = configBean.getValue("SERVICENOW_ENDPOINT");
    String apiKey = configBean.getValue("SERVICENOW_API_KEY");
    
    // Create incident
    JSONObject incident = new JSONObject();
    incident.put("short_description", "Password reset account locked: " + email);
    incident.put("caller_id", userId);
    incident.put("category", "Security");
    incident.put("priority", 3);
    
    // POST to ServiceNow
    // ... HTTP client code ...
}
```
