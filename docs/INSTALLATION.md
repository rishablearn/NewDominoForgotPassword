# Installation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Version Compatibility](#version-compatibility)
4. [Prerequisites](#prerequisites)
5. [Phase 1: Create Database](#phase-1-create-database)
6. [Phase 2: Import Web Content](#phase-2-import-web-content)
7. [Phase 3: Create Forms & Views](#phase-3-create-forms--views)
8. [Phase 4: Create Agents](#phase-4-create-agents)
9. [Phase 5: Security Configuration](#phase-5-security-configuration)
10. [Phase 6: Application Setup](#phase-6-application-setup)
11. [Phase 7: Testing](#phase-7-testing)
12. [Troubleshooting](#troubleshooting)
13. [Quick Reference](#quick-reference)

---

## Overview

This guide provides step-by-step instructions for deploying the HCL Domino Self-Service Password Reset application using the **new HTML/JavaScript + Agents architecture**.

### Key Benefits of This Architecture

| Feature | Benefit |
|---------|---------|
| **Pure HTML/JavaScript UI** | No XPages required - works on ALL Domino versions |
| **LotusScript Agents** | All backend logic runs server-side via Domino Agents |
| **Single NSF Database** | Simplified deployment - one database does everything |
| **ID Vault Integration** | Reset both HTTP and Notes Client passwords |
| **Modern Responsive UI** | Works on desktop, tablet, and mobile browsers |

### Installation Timeline

| Phase | Description | Time |
|-------|-------------|------|
| Phase 1 | Create Database | 5 min |
| Phase 2 | Import Web Content | 15 min |
| Phase 3 | Create Forms & Views | 20 min |
| Phase 4 | Create Agents | 30 min |
| Phase 5 | Security Configuration | 20 min |
| Phase 6 | Application Setup | 15 min |
| Phase 7 | Testing | 15 min |

**Total: ~2 hours**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER'S WEB BROWSER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HTML Pages: index.html, reset.html, register.html       │   │
│  │  JavaScript: api.js calls agents via ?OpenAgent URLs     │   │
│  │  CSS: Modern responsive styling                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS Requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              DOMINO DATABASE (PwdReset.nsf)                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  WEB CONTENT (File Resources)                            │    │
│  │  • index.html      • css/styles.css                      │    │
│  │  • reset.html      • js/api.js, config.js, etc.          │    │
│  │  • register.html   • images/*.svg                         │    │
│  │  • profile.html                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  LOTUSSCRIPT AGENTS (Backend API)                        │    │
│  │  • CheckAuthentication    • VerifyAnswers                │    │
│  │  • GetSecurityQuestions   • ResetPassword                │    │
│  │  • LookupProfile          • GetConfiguration             │    │
│  │  • RegisterProfile        • ClearExpiredLockouts         │    │
│  │  • UpdateProfile                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌──────────────────────┐  ┌───────────────────────────────┐    │
│  │  FORMS               │  │  VIEWS                        │    │
│  │  • UserProfile       │  │  • vwProfilesByEmail          │    │
│  │  • AuditLog          │  │  • vwLockedAccounts           │    │
│  │  • Configuration     │  │  • vwConfiguration            │    │
│  │  • SecurityQuestion  │  │  • vwSecurityQuestions        │    │
│  └──────────────────────┘  │  • vwAuditLog                 │    │
│                            └───────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    HCL DOMINO SERVER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────┐   │
│  │  ID Vault   │  │  Directory  │  │  HTTP Task             │   │
│  │  (vault.nsf)│  │  (names.nsf)│  │  (serves web content)  │   │
│  └─────────────┘  └─────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Agent API Endpoints

| Agent URL | Method | Purpose |
|-----------|--------|---------|
| `CheckAuthentication?OpenAgent` | GET | Check if user is logged in |
| `GetSecurityQuestions?OpenAgent` | GET | Get list of security questions |
| `LookupProfile?OpenAgent&email=X` | GET | Find user profile by email |
| `RegisterProfile?OpenAgent` | POST | Register new security profile |
| `UpdateProfile?OpenAgent` | POST | Update existing profile |
| `VerifyAnswers?OpenAgent` | POST | Verify security question answers |
| `ResetPassword?OpenAgent` | POST | Reset HTTP + ID Vault password |
| `GetConfiguration?OpenAgent` | GET | Get UI configuration settings |

---

## Version Compatibility

| Domino Version | Status | Notes |
|----------------|--------|-------|
| HCL Domino 14.x | ✅ Full Support | Recommended |
| HCL Domino 12.x | ✅ Full Support | Recommended |
| HCL Domino 11.x | ✅ Full Support | |
| HCL Domino 10.x | ✅ Full Support | Minimum version |
| IBM Domino 9.0.1+ | ✅ Full Support | No XPages needed! |

**Note:** Because this application uses HTML/JavaScript + Agents (no XPages), it works on **any Domino version** that supports web agents.

---

## Prerequisites

### Server Requirements
- [ ] HCL Domino Server 9.0.1 or later
- [ ] HTTP task enabled and running
- [ ] Domino Designer installed for development

### ID Vault Requirements (for Notes Client password reset)
- [ ] ID Vault configured and operational
- [ ] Signer ID has Password Reset Authority in vault

### Access Requirements
- [ ] Designer access to create databases
- [ ] Admin access to server document (for agent permissions)
- [ ] Editor access to Domino Directory (for HTTP password reset)

### Information to Gather

```
┌────────────────────────────────────────────────────────────┐
│ INSTALLATION WORKSHEET                                      │
├────────────────────────────────────────────────────────────┤
│ Domino Server:      ____________________________________   │
│ ID Vault Server:    ____________________________________   │
│ ID Vault Path:      ____________________________________   │
│ Signer ID:          ____________________________________   │
│ Database Path:      ____________________________________   │
│ Support Email:      ____________________________________   │
│ Support Phone:      ____________________________________   │
└────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Create Database

### Step 1.1: Create New NSF Database

1. Open **Domino Administrator** or **Notes Client**
2. File → Application → New
3. Enter:
   ```
   Server:     [Your Domino Server]
   Title:      Self-Service Password Reset
   File Name:  PwdReset.nsf
   ```
4. Click **OK**

### Step 1.2: Set Database Properties

1. Open database properties (File → Application → Properties)
2. On **Basics** tab:
   - Title: `Self-Service Password Reset`
3. On **Design** tab:
   - ✅ Check "Do not allow URL open" = **UNCHECKED** (allow URL access)
4. Save and close

---

## Phase 2: Import Web Content

The HTML, CSS, JavaScript, and image files need to be imported as **File Resources** in Domino Designer.

### Step 2.1: Open Database in Designer

1. Open **Domino Designer**
2. File → Application → Open
3. Select `PwdReset.nsf`

### Step 2.2: Create File Resources

Navigate to **Resources → Files** in the left panel.

#### Import HTML Files

For each HTML file, right-click → **Import File Resource**:

| Source File | Name in Domino |
|-------------|----------------|
| `nsf/WebContent/index.html` | `index.html` |
| `nsf/WebContent/reset.html` | `reset.html` |
| `nsf/WebContent/register.html` | `register.html` |
| `nsf/WebContent/profile.html` | `profile.html` |

#### Import CSS Files

| Source File | Name in Domino |
|-------------|----------------|
| `nsf/WebContent/css/styles.css` | `styles.css` |

#### Import JavaScript Files

| Source File | Name in Domino |
|-------------|----------------|
| `nsf/WebContent/js/config.js` | `config.js` |
| `nsf/WebContent/js/api.js` | `api.js` |
| `nsf/WebContent/js/app.js` | `app.js` |
| `nsf/WebContent/js/reset-wizard.js` | `reset-wizard.js` |
| `nsf/WebContent/js/register.js` | `register.js` |
| `nsf/WebContent/js/profile.js` | `profile.js` |

#### Import Image Files

| Source File | Name in Domino |
|-------------|----------------|
| `nsf/WebContent/images/logo.svg` | `logo.svg` |
| `nsf/WebContent/images/key-icon.svg` | `key-icon.svg` |
| `nsf/WebContent/images/shield-icon.svg` | `shield-icon.svg` |
| `nsf/WebContent/images/edit-icon.svg` | `edit-icon.svg` |

### Step 2.3: Update File Resource Paths

After importing, you may need to update the HTML files to reference the correct paths. In Domino, file resources are accessed via:
```
/PwdReset.nsf/filename.ext
```

**Update the HTML files** to use these paths for CSS, JS, and images:

```html
<!-- In each HTML file, update paths like: -->
<link rel="stylesheet" href="styles.css">
<script src="config.js"></script>
<script src="api.js"></script>
<img src="logo.svg">
```

### Step 2.4: Set Default Home Page

1. In Designer, go to **Resources → Files**
2. Right-click on `index.html`
3. Select **Properties**
4. On the **Design** tab, check **"Use as default when database is accessed via URL"**
   - Or alternatively, create a **$$ViewTemplate** or database launch property

---

## Phase 3: Create Forms & Views

### Step 3.1: Create Forms

In Domino Designer, navigate to **Forms** and create each form:

#### Form 1: UserProfile

1. Right-click Forms → **New Form**
2. Name: `UserProfile`
3. Add the following fields:

| Field Name | Type | Notes |
|------------|------|-------|
| UserName | Text | Canonical Domino user name |
| Email | Text | User email (lowercase) |
| Question1 | Text | First security question |
| Question2 | Text | Second security question |
| Question3 | Text | Third security question |
| Answer1Hash | Text | Hashed answer 1 |
| Answer2Hash | Text | Hashed answer 2 |
| Answer3Hash | Text | Hashed answer 3 |
| IsLocked | Text | "Yes" or "No" |
| FailedAttempts | Number | Count of failed attempts |
| LockoutTime | Date/Time | When account was locked |
| VerificationToken | Text | Temp token for reset |
| TokenExpiry | Date/Time | Token expiration |
| CreatedDate | Date/Time | Profile creation date |
| ModifiedDate | Date/Time | Last modification date |
| LastPasswordReset | Date/Time | Last successful reset |

4. Save and close

#### Form 2: AuditLog

| Field Name | Type | Notes |
|------------|------|-------|
| Timestamp | Date/Time | Event time |
| UserName | Text | User involved |
| Email | Text | User email |
| EventType | Text | Event category |
| Details | Text | Event description |
| IPAddress | Text | Client IP (optional) |

#### Form 3: Configuration

| Field Name | Type | Notes |
|------------|------|-------|
| Key | Text | Configuration key |
| Value | Text | Configuration value |
| Description | Text | Setting description |
| Category | Text | Security, UI, etc. |

#### Form 4: SecurityQuestion

| Field Name | Type | Notes |
|------------|------|-------|
| Question | Text | Question text |
| Category | Text | Personal, Work, etc. |
| Active | Text | "Yes" or "No" |
| SortOrder | Number | Display order |

### Step 3.2: Create Views

Navigate to **Views** and create each view:

#### View 1: vwProfilesByEmail

- **Selection Formula:** `SELECT Form = "UserProfile"`
- **Column 1:** Email (sorted ascending) - Formula: `@LowerCase(Email)`
- **Column 2:** UserName
- **Column 3:** IsLocked
- **Column 4:** CreatedDate

#### View 2: vwLockedAccounts

- **Selection Formula:** `SELECT Form = "UserProfile" & IsLocked = "Yes"`
- **Column 1:** LockoutTime (sorted ascending)
- **Column 2:** Email
- **Column 3:** UserName
- **Column 4:** FailedAttempts

#### View 3: vwConfiguration

- **Selection Formula:** `SELECT Form = "Configuration"`
- **Column 1:** Key (sorted ascending)
- **Column 2:** Value
- **Column 3:** Category
- **Column 4:** Description

#### View 4: vwSecurityQuestions

- **Selection Formula:** `SELECT Form = "SecurityQuestion" & Active = "Yes"`
- **Column 1:** SortOrder (sorted ascending, hidden)
- **Column 2:** Question
- **Column 3:** Category

#### View 5: vwAuditLog

- **Selection Formula:** `SELECT Form = "AuditLog"`
- **Column 1:** Timestamp (sorted descending)
- **Column 2:** EventType
- **Column 3:** UserName
- **Column 4:** Email
- **Column 5:** Details

---

## Phase 4: Create Agents

Navigate to **Code → Agents** in Domino Designer.

### Step 4.1: Create Each Agent

For each agent, create a new **LotusScript** agent:

1. Right-click Agents → **New Agent**
2. Set Name (e.g., `CheckAuthentication`)
3. Set Runtime: **On event → Agent list selection**
4. Set Target: **None**
5. **Important:** Check **"Allow user activation"** and **"Run as web user"**

Copy the LotusScript code from the corresponding `.lss` file in `nsf/Agents/`.

### Agent List

| Agent Name | Source File | Purpose |
|------------|-------------|---------|
| CheckAuthentication | `CheckAuthentication.lss` | Verify user login |
| GetSecurityQuestions | `GetSecurityQuestions.lss` | List questions |
| LookupProfile | `LookupProfile.lss` | Find profile by email |
| RegisterProfile | `RegisterProfile.lss` | Create new profile |
| UpdateProfile | `UpdateProfile.lss` | Update profile |
| VerifyAnswers | `VerifyAnswers.lss` | Verify answers |
| ResetPassword | `ResetPassword.lss` | Reset passwords |
| GetConfiguration | `GetConfiguration.lss` | Get UI config |
| ClearExpiredLockouts | `ClearExpiredLockouts.lss` | Scheduled unlock |

### Step 4.2: Configure Web Agents

For all agents EXCEPT `ClearExpiredLockouts`:

1. Open agent properties
2. Set **Trigger:** "On event" → "Agent list selection"
3. Check **"Allow user activation"**
4. Set **"Run as web user"** or appropriate option

### Step 4.3: Configure Scheduled Agent

For `ClearExpiredLockouts`:

1. Open agent properties
2. Set **Trigger:** "On schedule" → "More than once a day"
3. Set interval: Every 15 minutes
4. Check **"Enabled"**

---

## Phase 5: Security Configuration

### Step 5.1: Configure Database ACL

Open database ACL (File → Application → Access Control):

| Entry | Access | User Type | Notes |
|-------|--------|-----------|-------|
| -Default- | Reader | Unspecified | Anonymous web access |
| Anonymous | Reader | Unspecified | Unauthenticated users |
| LocalDomainServers | Manager | Server Group | Server access |
| [Your Signer ID] | Designer | Person | Sign agents |
| [Admin Group] | Manager | Person Group | Full admin |

**Advanced Tab:**
- Maximum Internet name and password: **Editor**

### Step 5.2: Configure Server Document

1. Open Domino Directory (names.nsf)
2. Edit your server document → **Security** tab
3. Add your signer ID to:
   - "Run unrestricted methods and operations"
   - "Sign agents to run on behalf of someone else"
   - "Sign agents to run on behalf of the invoker"

### Step 5.3: Configure ID Vault (Optional)

For Notes Client password reset:

1. Open ID Vault database
2. Add signer ID to **Password Reset Authority**
3. Ensure signer has **[PasswordReset]** role

### Step 5.4: Sign the Database

```
load sign PwdReset.nsf
```

Or use Domino Administrator to sign all design elements.

---

## Phase 6: Application Setup

### Step 6.1: Create Configuration Documents

Open the database and create Configuration documents:

| Key | Value | Description |
|-----|-------|-------------|
| APP_TITLE | Self-Service Password Reset | Application title |
| COMPANY_NAME | Your Company | Organization name |
| SUPPORT_EMAIL | helpdesk@company.com | Support email |
| SUPPORT_PHONE | 1-800-555-1234 | Support phone |
| MAX_FAILED_ATTEMPTS | 5 | Lockout threshold |
| LOCKOUT_DURATION_MINUTES | 30 | Auto-unlock time |
| SESSION_TIMEOUT_MINUTES | 15 | Wizard timeout |
| ID_VAULT_SERVER | CN=Vault/O=Org | ID Vault server |
| VAULT_DB_PATH | IBM_ID_VAULT/vault.nsf | Vault path |

### Step 6.2: Create Security Questions

Create SecurityQuestion documents:

1. What is your mother's maiden name?
2. What was the name of your first pet?
3. In what city were you born?
4. What is your favorite movie?
5. What was the make of your first car?
6. What is your favorite book?
7. What was your childhood nickname?
8. What street did you grow up on?
9. What is your favorite sports team?
10. What was the name of your elementary school?
11. What is your favorite food?
12. What was your first job?

### Step 6.3: Enable Scheduled Agents

Verify the scheduled agent is enabled:
```
tell amgr schedule
```

---

## Phase 7: Testing

### Step 7.1: Access the Application

Open browser and navigate to:
```
https://[your-server]/PwdReset.nsf
```

### Step 7.2: Test Checklist

- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] Login redirects to register page for authenticated users
- [ ] Security questions appear in dropdowns
- [ ] Registration saves successfully
- [ ] Password reset wizard completes all steps
- [ ] Account lockout triggers after failed attempts
- [ ] Audit log records events

### Step 7.3: Test Password Reset Flow

1. Register a test user with security questions
2. Log out
3. Click "Forgot Password"
4. Enter test user email
5. Answer security questions correctly
6. Set new password
7. Verify login with new password

---

## Troubleshooting

### Agent Not Running

**Error:** "Agent not authorized"

**Solution:**
1. Check signer ID in server document
2. Re-sign all agents
3. Verify ACL permissions

### HTTP 500 Error

**Cause:** Agent error or missing resource

**Solution:**
1. Check Domino console for errors
2. Verify all file resources imported
3. Check agent code for syntax errors

### Profile Not Found

**Cause:** View not returning results

**Solution:**
1. Verify vwProfilesByEmail view exists
2. Check selection formula
3. Ensure email column is sorted

### Password Reset Fails

**Cause:** Insufficient permissions

**Solution:**
1. Verify signer has Editor access to names.nsf
2. Check ID Vault permissions
3. Review ResetPassword agent logs

---

## Quick Reference

### URLs

| URL | Purpose |
|-----|---------|
| `/PwdReset.nsf` | Home page |
| `/PwdReset.nsf/reset.html` | Password reset |
| `/PwdReset.nsf/register.html` | Registration |
| `/PwdReset.nsf/profile.html` | Update profile |

### Console Commands

```bash
# Sign database
load sign PwdReset.nsf

# Restart HTTP
tell http restart

# Check agents
tell amgr schedule

# Run agent manually
tell amgr run "ClearExpiredLockouts" in "PwdReset.nsf"
```

### Configuration Keys

| Key | Default |
|-----|---------|
| MAX_FAILED_ATTEMPTS | 5 |
| LOCKOUT_DURATION_MINUTES | 30 |
| SESSION_TIMEOUT_MINUTES | 15 |
| MIN_PASSWORD_LENGTH | 8 |

---

## Next Steps

1. **[Configure branding](CUSTOMIZATION.md)** - Add your logo and colors
2. **[Review security settings](CONFIGURATION.md)** - Adjust for your environment
3. **Communicate to users** - Send registration instructions
4. **Monitor audit logs** - Review for issues

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Domino console logs
3. Open GitHub issue
