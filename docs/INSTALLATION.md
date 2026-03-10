# Installation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Version Compatibility](#version-compatibility)
4. [Prerequisites](#prerequisites)
5. [Phase 1: Database Creation](#phase-1-database-creation)
6. [Phase 2: Security Configuration](#phase-2-security-configuration)
7. [Phase 3: Application Setup](#phase-3-application-setup)
8. [Phase 4: Testing & Verification](#phase-4-testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Overview

This guide provides step-by-step instructions for deploying the HCL Domino Self-Service Password Reset application.

**Key Architecture Features:**
- **Pure HTML/JavaScript UI** - No XPages required, works on all Domino versions
- **LotusScript Agents** - All backend logic via Domino Agents
- **Single NSF Database** - Simplified deployment and maintenance
- **ID Vault Integration** - Reset both HTTP and Notes Client passwords

| Phase | Description | Time Estimate |
|-------|-------------|---------------|
| Phase 1 | Database Creation | 15-30 minutes |
| Phase 2 | Security Configuration | 30-45 minutes |
| Phase 3 | Application Setup | 15-30 minutes |
| Phase 4 | Testing & Verification | 30-60 minutes |

**Total estimated time: 1.5 - 3 hours**

---

## Architecture

The application uses a clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (HTML/CSS/JavaScript)                              │
│  - index.html, reset.html, register.html, profile.html      │
│  - JavaScript calls agents via ?OpenAgent URLs              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│  Domino NSF Database (PwdReset.nsf)                         │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ Web Content     │  │ LotusScript Agents              │   │
│  │ (HTML/JS/CSS)   │  │ - CheckAuthentication           │   │
│  │                 │  │ - LookupProfile                 │   │
│  │                 │  │ - VerifyAnswers                 │   │
│  │                 │  │ - ResetPassword                 │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ Forms           │  │ Views                           │   │
│  │ - UserProfile   │  │ - vwProfilesByEmail             │   │
│  │ - AuditLog      │  │ - vwConfiguration               │   │
│  │ - Configuration │  │ - vwLockedAccounts              │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Agent Endpoints:**
| Agent | Purpose | Authentication |
|-------|---------|----------------|
| `CheckAuthentication?OpenAgent` | Verify user login status | None |
| `GetSecurityQuestions?OpenAgent` | Get available questions | None |
| `LookupProfile?OpenAgent` | Find profile by email | None |
| `RegisterProfile?OpenAgent` | Create new profile | Required |
| `UpdateProfile?OpenAgent` | Update existing profile | Required |
| `VerifyAnswers?OpenAgent` | Verify security answers | None |
| `ResetPassword?OpenAgent` | Reset HTTP + ID Vault password | Token |
| `GetConfiguration?OpenAgent` | Get UI configuration | None |

---

## Version Compatibility

This application is compatible with the following HCL Domino versions:

| Version | Status | Notes |
|---------|--------|-------|
| HCL Domino 14.x | ✅ Fully Supported | Recommended |
| HCL Domino 12.x | ✅ Fully Supported | Recommended |
| HCL Domino 11.x | ✅ Fully Supported | |
| HCL Domino 10.x | ✅ Fully Supported | Minimum version |
| IBM Domino 9.0.1 FP10+ | ⚠️ Limited Support | XPages may require adjustments |
| IBM Domino 9.0.1 FP8-9 | ⚠️ Limited Support | Some features may not work |
| IBM Domino 9.0.0 or earlier | ❌ Not Supported | |

### Version-Specific Notes

**Domino 14.x:**
- Full support for all modern XPages features
- Enhanced security with updated TLS support
- Better performance with optimized HTTP stack

**Domino 12.x:**
- Full feature support
- Improved ID Vault integration
- Native Docker/container support

**Domino 11.x:**
- Full feature support
- Ensure latest fix pack is installed

**Domino 10.x:**
- Minimum supported version
- Requires ID Vault to be properly configured
- Install latest fix pack for best results

---

## Prerequisites

### ✅ Checklist

Complete this checklist before starting installation:

#### Server Requirements
- [ ] HCL Domino Server 10.x or later installed and running
- [ ] HTTP task enabled and running
- [ ] Server has sufficient disk space (minimum 100MB free)
- [ ] Server time is synchronized (NTP recommended)

#### ID Vault Requirements
- [ ] ID Vault is configured and operational
- [ ] ID Vault database is accessible from the web server
- [ ] You know the ID Vault server name and database path

#### Access Requirements
- [ ] Administrator access to Domino Directory (names.nsf)
- [ ] Designer access to create/modify databases
- [ ] A dedicated signer ID with:
  - [ ] Password Reset Authority in ID Vault
  - [ ] Rights to run unrestricted agents
  - [ ] Rights to sign agents to run on behalf of others
  - [ ] Editor access to Domino Directory

#### Network Requirements
- [ ] HTTPS is configured (recommended for production)
- [ ] Users can access the Domino web server
- [ ] No firewall blocking required ports

### Gather Required Information

Before starting, collect the following information:

```
┌─────────────────────────────────────────────────────────────────┐
│ INSTALLATION WORKSHEET                                          │
├─────────────────────────────────────────────────────────────────┤
│ Domino Server Name:     _________________________________       │
│ (e.g., CN=Server01/O=Acme)                                      │
│                                                                 │
│ ID Vault Server:        _________________________________       │
│ (e.g., CN=Vault01/O=Acme)                                       │
│                                                                 │
│ ID Vault Database Path: _________________________________       │
│ (e.g., IBM_ID_VAULT/vault.nsf)                                  │
│                                                                 │
│ Signer ID Name:         _________________________________       │
│ (e.g., CN=AppSigner/O=Acme)                                     │
│                                                                 │
│ Admin Group Name:       _________________________________       │
│ (e.g., DominoAdmins)                                            │
│                                                                 │
│ HTTP Server URL:        _________________________________       │
│ (e.g., https://webmail.acme.com)                                │
│                                                                 │
│ Support Email:          _________________________________       │
│ (e.g., helpdesk@acme.com)                                       │
│                                                                 │
│ Support Phone:          _________________________________       │
│ (e.g., 1-800-555-1234)                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Creation

### Step 1.1: Download the Application Files

1. Download or clone the repository
2. Locate the following directories:
   - `FrontEnd-resetpwd.nsf/` - Front-end design elements
   - `BackEnd-ForgotPasswordData.nsf/` - Back-end design elements

### Step 1.2: Create the Front-End Database

**Using Domino Administrator:**

1. Open **HCL Notes Administrator**
2. Connect to your target Domino server
3. Navigate to **Files** tab
4. Click **New Database** (or File → Database → New)
5. Fill in the following:

```
Server:     [Your Domino Server]
Title:      Self-Service Password Reset
File Name:  resetpwd.nsf
Location:   [Leave as default or specify subdirectory]
```

6. Click **OK** to create the database

**Alternative - Using Notes Client:**

1. Open **HCL Notes Client**
2. File → Application → New
3. Select server and enter details as above

### Step 1.3: Create the Back-End Database

Repeat the same process to create the back-end database:

```
Server:     [Your Domino Server]
Title:      Forgot Password Data
File Name:  ForgotPasswordData.nsf
Location:   [Same location as front-end, or separate directory]
```

### Step 1.4: Import Design Elements

**Using Domino Designer:**

1. Open **Domino Designer**
2. Open the newly created `resetpwd.nsf`
3. For each design element type (XPages, Custom Controls, etc.):
   - Right-click on the design element category
   - Select **Import** or copy/paste from source files
4. Import all elements from `FrontEnd-resetpwd.nsf/`:
   - XPages (4 files)
   - Custom Controls (1 file)
   - Script Libraries (6 files)
   - Style Sheets (1 file)
   - Client JavaScript (1 file)
   - Image Resources (4 files)

5. Open `ForgotPasswordData.nsf`
6. Import all elements from `BackEnd-ForgotPasswordData.nsf/`:
   - Forms (4 files)
   - Views (6 files)
   - Agents (2 files)

### Step 1.5: Verify Database Creation

Confirm both databases exist and have the correct design elements:

**Front-End (resetpwd.nsf):**
- [ ] 4 XPages (xpHome, xpRegister, xpResetWizard, xpUpdateProfile)
- [ ] 1 Custom Control (ccAppLayout)
- [ ] 6 Script Libraries (.jss files)
- [ ] 1 Style Sheet (app.css)
- [ ] 1 Client JavaScript (app.js)
- [ ] 4 Image Resources (.svg files)

**Back-End (ForgotPasswordData.nsf):**
- [ ] 4 Forms (UserProfile, AuditLog, Configuration, SecurityQuestion)
- [ ] 6 Views (vwProfilesByEmail, vwProfilesByUser, vwLockedAccounts, vwAuditLog, vwConfiguration, vwSecurityQuestions)
- [ ] 2 Agents (ClearExpiredLockouts, CleanupOldAuditLogs)

---

## Phase 2: Security Configuration

### Step 2.1: Configure Front-End Database ACL

1. Open `resetpwd.nsf` in **Domino Administrator** or **Notes Client**
2. File → Application → Access Control (or Ctrl+Shift+A)
3. Configure the following ACL entries:

| Entry | Access Level | User Type | Roles | Delete Docs |
|-------|--------------|-----------|-------|-------------|
| -Default- | Reader | Unspecified | None | No |
| Anonymous | Reader | Unspecified | None | No |
| LocalDomainServers | Manager | Server Group | None | Yes |
| [Your Signer ID] | Designer | Person | None | No |
| [Your Admin Group] | Manager | Person Group | [Admin] | Yes |

4. Click **Advanced** tab and configure:
   - **Maximum Internet name and password:** Editor
   - **Enforce a consistent ACL:** Yes (recommended)

5. In database properties (File → Application → Properties):
   - **Web Access:** Check "Use JavaScript when generating pages"
   - Check **"Allow URL open"**

### Step 2.2: Configure Back-End Database ACL

1. Open `ForgotPasswordData.nsf`
2. Configure ACL:

| Entry | Access Level | User Type | Roles | Delete Docs |
|-------|--------------|-----------|-------|-------------|
| -Default- | No Access | Unspecified | None | No |
| Anonymous | No Access | Unspecified | None | No |
| LocalDomainServers | Manager | Server Group | None | Yes |
| [Your Signer ID] | Manager | Person | None | Yes |
| [Your Admin Group] | Manager | Person Group | [Admin] | Yes |

3. **Advanced** tab:
   - **Maximum Internet name and password:** No Access
   
4. In database properties:
   - **UNCHECK** "Allow URL open" (IMPORTANT!)

### Step 2.3: Configure Server Document

1. Open **Domino Directory** (names.nsf)
2. Navigate to **Configuration** → **Servers** → **All Server Documents**
3. Open your server document and click **Edit Server**
4. Go to **Security** tab

5. In **Security Settings** section, add your signer ID to:

**"Run unrestricted methods and operations":**
```
[Add your signer ID, e.g.: CN=AppSigner/O=Acme]
```

**"Sign agents to run on behalf of someone else":**
```
[Add your signer ID, e.g.: CN=AppSigner/O=Acme]
```

**"Sign agents to run on behalf of the invoker of the agent":**
```
[Add your signer ID, e.g.: CN=AppSigner/O=Acme]
```

6. Click **Save & Close**

### Step 2.4: Configure ID Vault Permissions

1. Open the **ID Vault database** (usually `IBM_ID_VAULT/vault.nsf`)
2. Navigate to the **Configuration** document
3. In the **Password Reset** section:
   - Add your signer ID to **"Password Reset Authority"**
   
4. Verify the vault ACL includes your signer ID with:
   - Minimum **Editor** access
   - **[PasswordReset]** role assigned

### Step 2.5: Sign the Databases

**Using Domino Administrator:**

1. Select `resetpwd.nsf`
2. Right-click → **Sign...**
3. Select your authorized signer ID
4. Choose **"All design documents"**
5. Click **Sign**
6. Repeat for `ForgotPasswordData.nsf`

**Using Server Console:**

```
load sign resetpwd.nsf
load sign ForgotPasswordData.nsf
```

**Verify signing:**
```
show directory resetpwd.nsf
```

---

## Phase 3: Application Setup

### Step 3.1: Create Configuration Documents

Open `ForgotPasswordData.nsf` in Notes Client and create configuration documents:

**Method A: Using Notes Client Forms**

1. Create → Configuration (if form exists)
2. Enter each configuration setting

**Method B: Manual Document Creation**

Create documents with Form = "Configuration" and the following fields:

#### Required Configuration (Create These First)

| Document | Key | Value | Description |
|----------|-----|-------|-------------|
| 1 | DATA_DB_PATH | `ForgotPasswordData.nsf` | Backend database path |
| 2 | ID_VAULT_SERVER | `CN=YourVault/O=YourOrg` | ID Vault server name |
| 3 | HTTP_SERVER | `CN=YourWeb/O=YourOrg` | HTTP server name |
| 4 | VAULT_DB_PATH | `IBM_ID_VAULT/vault.nsf` | ID Vault database path |

#### Security Configuration

| Document | Key | Value | Description |
|----------|-----|-------|-------------|
| 5 | MAX_FAILED_ATTEMPTS | `5` | Lockout threshold |
| 6 | LOCKOUT_DURATION_MINUTES | `30` | Auto-unlock time |
| 7 | SESSION_TIMEOUT_MINUTES | `15` | Wizard timeout |
| 8 | MIN_PASSWORD_LENGTH | `8` | Minimum password length |

#### UI Configuration

| Document | Key | Value | Description |
|----------|-----|-------|-------------|
| 9 | APP_TITLE | `Password Reset Portal` | Application title |
| 10 | COMPANY_NAME | `Your Company` | Organization name |
| 11 | SUPPORT_EMAIL | `helpdesk@company.com` | Support email |
| 12 | SUPPORT_PHONE | `1-800-555-1234` | Support phone |

### Step 3.2: Create Security Questions

Create a document for each security question:

| Form | Question | Category | Active |
|------|----------|----------|--------|
| SecurityQuestion | What is your mother's maiden name? | Personal | Yes |
| SecurityQuestion | What was the name of your first pet? | Personal | Yes |
| SecurityQuestion | In what city were you born? | Personal | Yes |
| SecurityQuestion | What is your favorite movie? | Entertainment | Yes |
| SecurityQuestion | What was the make of your first car? | Personal | Yes |
| SecurityQuestion | What is your favorite book? | Entertainment | Yes |
| SecurityQuestion | What was your childhood nickname? | Personal | Yes |
| SecurityQuestion | What street did you grow up on? | Personal | Yes |
| SecurityQuestion | What is your favorite sports team? | Entertainment | Yes |
| SecurityQuestion | What was the name of your elementary school? | Education | Yes |
| SecurityQuestion | What is your favorite food? | Personal | Yes |
| SecurityQuestion | What was your first job? | Work | Yes |

### Step 3.3: Enable Scheduled Agents

**Agent 1: ClearExpiredLockouts**

1. Open `ForgotPasswordData.nsf` in **Domino Designer**
2. Navigate to **Code** → **Agents**
3. Open **ClearExpiredLockouts** agent
4. Click **Agent Properties** (or right-click → Properties)
5. Configure:
   - **Runtime:** On schedule
   - **Run:** More than once a day
   - **Schedule:** Every 15 minutes
   - **Start time:** 12:00 AM
   - **End time:** 11:59 PM
6. Check **"Enabled"**
7. Save and close
8. Sign the agent with your signer ID

**Agent 2: CleanupOldAuditLogs**

1. Open **CleanupOldAuditLogs** agent
2. Configure:
   - **Runtime:** On schedule
   - **Run:** Daily
   - **Schedule:** 2:00 AM
3. Check **"Enabled"**
4. Save and sign

**Verify agents are scheduled:**
```
tell amgr schedule
```

### Step 3.4: Configure HTTP Settings (If Needed)

Add to `notes.ini` if not already present:

```ini
HTTPEnableMethods=GET,POST,PUT,DELETE
XPagesPreload=1
XPagesPreloadDB=resetpwd.nsf
```

**For Domino 12.x and later:**
```ini
HTTPAllowDecodedUrlPercent=1
```

Restart HTTP task:
```
tell http restart
```

---

## Phase 4: Testing & Verification

### Step 4.1: Basic Connectivity Test

1. Open a web browser
2. Navigate to: `https://[your-server]/resetpwd.nsf`
3. Verify:
   - [ ] Home page loads without errors
   - [ ] Logo and styling appear correctly
   - [ ] Navigation links work
   - [ ] No JavaScript errors in browser console

### Step 4.2: Registration Test

1. Log in with a test user account
2. Click **"First Time Setup"**
3. Verify:
   - [ ] Page redirects properly if already registered
   - [ ] Security questions dropdown populates
   - [ ] Cannot select the same question twice
   - [ ] Answers are required
   - [ ] Success message appears after registration

### Step 4.3: Password Reset Test

1. Log out (or use incognito/private browsing)
2. Click **"Forgot Password?"**
3. Step 1 - Enter test user's email
4. Step 2 - Answer security questions correctly
5. Step 3 - Enter a new password meeting complexity requirements
6. Step 4 - Verify success confirmation
7. Test:
   - [ ] HTTP password was reset (try web login)
   - [ ] ID Vault password was reset (if applicable)

### Step 4.4: Security Tests

**Lockout Test:**
1. Enter correct email
2. Enter wrong answers 5 times
3. Verify account lockout message appears
4. Wait for lockout duration or trigger agent
5. Verify account unlocks

**Session Timeout Test:**
1. Start password reset
2. Wait for session timeout (default 15 minutes)
3. Verify session expires with appropriate message

### Step 4.5: Verify Audit Logging

1. Open `ForgotPasswordData.nsf`
2. Navigate to **AuditLog** view
3. Verify events are logged:
   - [ ] Registration events
   - [ ] Password reset attempts
   - [ ] Lockout events
   - [ ] Unlock events

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "HTTP Error 500 - Internal Server Error"

**Causes:**
- XPages runtime error
- Missing script library
- Configuration issue

**Solutions:**
1. Check Domino console for error messages
2. Verify all script libraries are imported
3. Check XPages are properly signed
4. Enable XPages debug logging:
   ```
   set config XPagesDebug=1
   tell http restart
   ```

#### Issue: "Agent not authorized to run"

**Causes:**
- Signer not in server document
- Agent not properly signed

**Solutions:**
1. Verify signer ID in server document security settings
2. Re-sign all agents with correct ID
3. Check agent log:
   ```
   tell amgr status
   ```

#### Issue: "Cannot reset ID Vault password"

**Causes:**
- Signer lacks Password Reset Authority
- Wrong vault server name
- Vault database path incorrect

**Solutions:**
1. Verify signer in vault configuration
2. Check ID_VAULT_SERVER configuration
3. Verify VAULT_DB_PATH is correct
4. Check vault is accessible:
   ```
   show server [vault-server-name]
   ```

#### Issue: "Backend database not found"

**Causes:**
- Wrong database path in configuration
- Database not on server

**Solutions:**
1. Verify DATA_DB_PATH configuration
2. Use forward slashes in path
3. Verify database exists:
   ```
   show directory ForgotPasswordData.nsf
   ```

#### Issue: "Anonymous access denied"

**Causes:**
- ACL not configured correctly
- Maximum internet access too restrictive

**Solutions:**
1. Verify Anonymous entry in ACL has Reader access
2. Check -Default- has Reader access
3. Verify "Maximum internet name and password" is Editor or higher

#### Issue: "Questions not appearing in dropdown"

**Causes:**
- No SecurityQuestion documents created
- Questions not marked as Active

**Solutions:**
1. Create SecurityQuestion documents in backend database
2. Ensure Active field = "Yes"
3. Verify vwSecurityQuestions view exists

### Debug Commands

**Check HTTP status:**
```
show tasks http
tell http show config
```

**Check agent status:**
```
tell amgr status
tell amgr schedule
show agent "ClearExpiredLockouts" in ForgotPasswordData.nsf
```

**Check database info:**
```
show directory resetpwd.nsf
show database resetpwd.nsf
```

**Enable detailed logging:**
```
set config debug_xpages=1
set config console_log_level=2
tell http restart
```

---

## Quick Reference

### Key Paths

| Item | Default Path |
|------|--------------|
| Front-End Database | resetpwd.nsf |
| Back-End Database | ForgotPasswordData.nsf |
| ID Vault | IBM_ID_VAULT/vault.nsf |
| Application URL | https://[server]/resetpwd.nsf |

### Configuration Keys

| Key | Purpose | Default |
|-----|---------|---------|
| DATA_DB_PATH | Backend database | ForgotPasswordData.nsf |
| ID_VAULT_SERVER | Vault server name | (required) |
| MAX_FAILED_ATTEMPTS | Lockout threshold | 5 |
| LOCKOUT_DURATION_MINUTES | Auto-unlock time | 30 |
| SESSION_TIMEOUT_MINUTES | Wizard timeout | 15 |

### Console Commands

```bash
# Sign databases
load sign resetpwd.nsf

# Restart HTTP
tell http restart

# Check agents
tell amgr schedule

# Debug mode
set config XPagesDebug=1
```

---

## Next Steps

After successful installation:

1. **[Configure custom branding](CUSTOMIZATION.md)** - Add your logo and colors
2. **[Review security settings](CONFIGURATION.md)** - Adjust for your environment
3. **[Set up monitoring](CONFIGURATION.md#logging)** - Enable audit logging
4. **Communicate to users** - Send instructions for registration
5. **Train help desk** - Provide troubleshooting guide

---

## Support

For issues not covered in this guide:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Domino console logs
3. Open an issue on GitHub
4. Contact your Domino administrator
