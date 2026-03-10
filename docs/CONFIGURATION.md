# Configuration Guide

This guide explains how to configure the Self-Service Password Reset application.

## Table of Contents

1. [Overview](#overview)
2. [Configuration Documents](#configuration-documents)
3. [Security Settings](#security-settings)
4. [UI Configuration](#ui-configuration)
5. [ID Vault Settings](#id-vault-settings)
6. [Password Requirements](#password-requirements)
7. [Scheduled Agents](#scheduled-agents)
8. [Customization](#customization)

---

## Overview

Configuration is managed through **Configuration documents** stored in the NSF database. These documents use a simple key-value structure and are accessed by the LotusScript agents via the `vwConfiguration` view.

### How Configuration Works

```
┌─────────────────────────────────────────────────────────────┐
│  Configuration Document                                      │
│  ┌─────────────┬──────────────────────────────────────────┐ │
│  │ Key         │ MAX_FAILED_ATTEMPTS                      │ │
│  │ Value       │ 5                                        │ │
│  │ Category    │ Security                                 │ │
│  │ Description │ Number of failed attempts before lockout │ │
│  └─────────────┴──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Creating Configuration Documents

1. Open the database in Notes Client
2. Create a new document using the **Configuration** form
3. Enter the Key, Value, Category, and Description
4. Save and close

---

## Configuration Documents

### Required Settings

Create these configuration documents first:

| Key | Value | Category | Description |
|-----|-------|----------|-------------|
| ID_VAULT_SERVER | `CN=Vault/O=Org` | Server | ID Vault server canonical name |
| VAULT_DB_PATH | `IBM_ID_VAULT/vault.nsf` | Server | Path to ID Vault database |

### Recommended Settings

| Key | Value | Category | Description |
|-----|-------|----------|-------------|
| APP_TITLE | `Self-Service Password Reset` | UI | Application title |
| COMPANY_NAME | `Your Company` | UI | Organization name |
| SUPPORT_EMAIL | `helpdesk@company.com` | UI | Support email address |
| SUPPORT_PHONE | `1-800-555-1234` | UI | Support phone number |
| LOGO_URL | `logo.svg` | UI | Path to logo image |

---

## Security Settings

### Lockout Configuration

| Key | Default | Range | Description |
|-----|---------|-------|-------------|
| MAX_FAILED_ATTEMPTS | 5 | 3-10 | Failed attempts before lockout |
| LOCKOUT_DURATION_MINUTES | 30 | 15-1440 | Minutes until auto-unlock |

**Example:**
```
Key:         MAX_FAILED_ATTEMPTS
Value:       5
Category:    Security
Description: Number of failed verification attempts before account lockout
```

### Session Settings

| Key | Default | Range | Description |
|-----|---------|-------|-------------|
| SESSION_TIMEOUT_MINUTES | 15 | 5-60 | Wizard session timeout |

### Answer Hashing

Answers are hashed using Domino's `@Password` function for secure storage. The agents never store plaintext answers.

---

## UI Configuration

### Application Branding

| Key | Description | Example |
|-----|-------------|---------|
| APP_TITLE | Page title and header | `Password Reset Portal` |
| COMPANY_NAME | Footer company name | `Acme Corporation` |
| LOGO_URL | Logo image path | `logo.svg` |

### Support Information

| Key | Description | Example |
|-----|-------------|---------|
| SUPPORT_EMAIL | Help desk email | `helpdesk@acme.com` |
| SUPPORT_PHONE | Help desk phone | `1-800-555-1234` |

### Customizing the UI

The UI can be customized by editing the file resources:

1. **styles.css** - Colors, fonts, layout
2. **logo.svg** - Company logo
3. **config.js** - Default messages and settings

---

## ID Vault Settings

For Notes Client password reset functionality:

| Key | Description | Required |
|-----|-------------|----------|
| ID_VAULT_SERVER | Vault server canonical name | Yes |
| VAULT_DB_PATH | Path to vault.nsf | Yes |

**Example:**
```
Key:         ID_VAULT_SERVER
Value:       CN=VaultServer/O=Acme
Category:    Server
Description: ID Vault server for Notes Client password reset
```

### ID Vault Requirements

1. Signer ID must have **Password Reset Authority** in vault
2. Signer must have **[PasswordReset]** role in vault ACL
3. Vault must be accessible from the Domino server

---

## Password Requirements

Password complexity is enforced by the JavaScript client-side and can be configured in `config.js`:

```javascript
passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
}
```

### Server-Side Configuration

| Key | Default | Description |
|-----|---------|-------------|
| MIN_PASSWORD_LENGTH | 8 | Minimum password length |

---

## Scheduled Agents

### ClearExpiredLockouts

**Purpose:** Automatically unlocks accounts after lockout duration expires.

**Configuration:**
- **Schedule:** Every 15 minutes
- **Trigger:** On schedule → More than once a day

**Behavior:**
1. Queries `vwLockedAccounts` view
2. Checks each locked profile's `LockoutTime`
3. If lockout duration has passed, sets `IsLocked = "No"`
4. Logs unlock event to audit log

### Enabling/Disabling Agents

**Via Domino Administrator:**
1. Open database
2. Navigate to Agents
3. Right-click agent → Enable/Disable

**Via Console:**
```
tell amgr schedule
tell amgr run "ClearExpiredLockouts" in "PwdReset.nsf"
```

---

## Customization

### Changing Colors and Styling

Edit `styles.css` to customize:

```css
:root {
    --primary-color: #0066cc;      /* Main brand color */
    --primary-dark: #004080;       /* Darker shade */
    --success-color: #28a745;      /* Success messages */
    --error-color: #dc3545;        /* Error messages */
    --background-color: #f8f9fa;   /* Page background */
}
```

### Changing Security Questions

Create or modify **SecurityQuestion** documents:

| Field | Value |
|-------|-------|
| Question | The question text |
| Category | Personal, Work, Education, Entertainment |
| Active | Yes or No |
| SortOrder | Display order (1, 2, 3...) |

### Adding New Questions

1. Open database in Notes Client
2. Create → SecurityQuestion
3. Fill in fields
4. Save

### Deactivating Questions

Set `Active = "No"` to hide a question without deleting it.

---

## Default Values

If a configuration key is not found, agents use these defaults:

| Key | Default |
|-----|---------|
| APP_TITLE | Self-Service Password Reset |
| COMPANY_NAME | Your Company |
| SUPPORT_EMAIL | helpdesk@company.com |
| SUPPORT_PHONE | 1-800-555-1234 |
| LOGO_URL | images/logo.svg |
| MAX_FAILED_ATTEMPTS | 5 |
| LOCKOUT_DURATION_MINUTES | 30 |
| SESSION_TIMEOUT_MINUTES | 15 |
| MIN_PASSWORD_LENGTH | 8 |

---

## Audit Logging

All security events are logged to **AuditLog** documents:

| Event Type | Description |
|------------|-------------|
| REGISTRATION | New profile registered |
| PROFILE_UPDATE | Profile questions updated |
| VERIFY_SUCCESS | Security answers verified |
| VERIFY_FAILED | Incorrect answers provided |
| PASSWORD_RESET | Password successfully reset |
| ACCOUNT_LOCKED | Account locked after failed attempts |
| AUTO_UNLOCK | Account automatically unlocked |

### Viewing Audit Logs

1. Open database
2. Navigate to `vwAuditLog` view
3. Logs are sorted by timestamp (newest first)

### Log Retention

Consider implementing a cleanup agent to remove old audit logs based on your retention policy.
