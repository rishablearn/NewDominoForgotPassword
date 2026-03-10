# Testing Guide

## Test Environment Setup

### Prerequisites
- Test user account in Domino Directory
- Test user registered in ID Vault
- Access to Notes Client and web browser
- Admin access for verification

### Test Data Cleanup
Before testing, ensure clean state:
1. Delete any existing profile for test user in backend
2. Reset test user's password to known value
3. Clear any lockouts

## Test Cases

### TC-001: New User Registration

**Objective:** Verify new users can register with security questions.

**Preconditions:**
- User exists in Domino Directory
- User has valid HTTP credentials
- No existing profile in backend

**Steps:**
1. Navigate to `https://server/resetpwd.nsf`
2. Click "Register" or "Setup Security Questions"
3. Authenticate with Domino credentials
4. Select 3 different security questions
5. Enter answers for each question
6. Click "Save" or "Register"

**Expected Results:**
- ✅ User prompted for authentication
- ✅ All questions from configuration displayed
- ✅ Must select exactly 3 questions
- ✅ Cannot select same question twice
- ✅ Answers required for all 3 questions
- ✅ Success message displayed
- ✅ Profile document created in backend

**Verification:**
```
Open ForgotPasswordData.nsf → UserProfiles view
Verify document exists with:
- Correct email/username
- 3 questions stored
- Answers are hashed (not readable)
- LockedOut = "No"
- FailedAttempts = 0
```

---

### TC-002: Password Reset - Happy Path

**Objective:** Verify complete password reset flow works correctly.

**Preconditions:**
- User is registered (TC-001 passed)
- User knows their security answers
- Account is not locked

**Steps:**
1. Navigate to `https://server/resetpwd.nsf`
2. Click "Forgot Password" or "Reset Password"
3. Enter registered email address
4. Click "Next"
5. Answer all 3 security questions correctly
6. Click "Verify"
7. Enter new password (meeting complexity requirements)
8. Confirm new password
9. Click "Reset Password"

**Expected Results:**
- ✅ Step 1: Email field accepts valid email
- ✅ Step 2: Correct questions displayed for user
- ✅ Step 3: Password fields validate complexity
- ✅ Step 4: Success message for both HTTP and ID Vault
- ✅ User can login with new password (both HTTP and Notes)

**Verification:**
```
1. Test HTTP login: Access webmail with new password
2. Test Notes login: Open Notes Client, authenticate with new password
3. Check backend profile: FailedAttempts reset to 0
```

---

### TC-003: Invalid Email Address

**Objective:** Verify error handling for non-existent email.

**Steps:**
1. Navigate to reset wizard
2. Enter email that doesn't exist: `nonexistent@test.com`
3. Click "Next"

**Expected Results:**
- ✅ Error message: "Email address not found" or similar
- ✅ User remains on Step 1
- ✅ No information disclosed about which emails are valid

**Security Note:** Message should be generic to prevent email enumeration.

---

### TC-004: Incorrect Answers - Single Attempt

**Objective:** Verify incorrect answer handling.

**Steps:**
1. Start reset wizard with valid email
2. Proceed to Step 2 (questions)
3. Enter one or more wrong answers
4. Click "Verify"

**Expected Results:**
- ✅ Error message: "One or more answers are incorrect"
- ✅ User remains on Step 2
- ✅ FailedAttempts incremented in backend
- ✅ Generic error (doesn't reveal which answer was wrong)

---

### TC-005: Account Lockout After 5 Failed Attempts

**Objective:** Verify lockout mechanism works.

**Preconditions:**
- MAX_FAILED_ATTEMPTS = 5 in configuration

**Steps:**
1. Start reset wizard with valid email
2. Enter wrong answers 5 times consecutively
3. Attempt 6th try

**Expected Results:**
- ✅ After 5th failure: "Account locked" message
- ✅ 6th attempt: Immediately shows locked message
- ✅ Cannot proceed to questions when locked
- ✅ Backend profile shows: LockedOut = "Yes", FailedAttempts = 5

**Verification:**
```
Open backend database → UserProfiles view
Check user document:
- LockedOut: Yes
- FailedAttempts: 5
- LockoutTime: [timestamp of lockout]
```

---

### TC-006: Automatic Lockout Clear

**Objective:** Verify scheduled agent unlocks accounts.

**Preconditions:**
- Account is locked (TC-005)
- LOCKOUT_DURATION_MINUTES = 30 (or test value)
- UnlockProfiles agent is enabled

**Steps:**
1. Note the lockout time
2. Wait for LOCKOUT_DURATION_MINUTES to pass
3. Wait for agent to run (or manually trigger)
4. Attempt password reset again

**Expected Results:**
- ✅ Agent runs on schedule
- ✅ Profile unlocked after duration
- ✅ User can attempt reset again
- ✅ FailedAttempts reset to 0

**Manual Agent Trigger (for testing):**
```
tell amgr run "UnlockProfiles" in "ForgotPasswordData.nsf"
```

---

### TC-007: Password Complexity Validation

**Objective:** Verify password requirements are enforced.

**Test Passwords:**

| Password | Expected Result | Reason |
|----------|-----------------|--------|
| `abc` | ❌ Reject | Too short |
| `abcdefgh` | ❌ Reject | No uppercase |
| `ABCDEFGH` | ❌ Reject | No lowercase |
| `Abcdefgh` | ❌ Reject | No number |
| `Abcdefg1` | ❌ Reject | No special char |
| `Abcdefg1!` | ✅ Accept | Meets all requirements |

**Steps:**
1. Proceed to password entry step
2. Try each password in table
3. Verify validation messages

---

### TC-008: Session Timeout

**Objective:** Verify wizard times out appropriately.

**Preconditions:**
- SESSION_TIMEOUT_MINUTES = 15 (or test value)

**Steps:**
1. Start reset wizard
2. Proceed to Step 2
3. Wait for timeout duration
4. Try to proceed to Step 3

**Expected Results:**
- ✅ Session expires after timeout
- ✅ User redirected to Step 1
- ✅ Message: "Session expired. Please start over."

---

### TC-009: Browser Back Button Handling

**Objective:** Verify back button redirects to start.

**Steps:**
1. Start reset wizard
2. Proceed to Step 2
3. Click browser back button
4. Observe behavior

**Expected Results:**
- ✅ User redirected to Step 1 (not Step 1 with stale data)
- ✅ Must start process over
- ✅ Previous answers not retained

---

### TC-010: Profile Update

**Objective:** Verify users can update their security questions.

**Preconditions:**
- User has existing profile

**Steps:**
1. Navigate to application
2. Click "Update Profile" or "Change Questions"
3. Authenticate
4. Select new questions
5. Enter new answers
6. Save

**Expected Results:**
- ✅ Current questions pre-selected (or shown)
- ✅ Can change questions and answers
- ✅ New answers hashed and saved
- ✅ Old answers no longer work

---

### TC-011: ID Vault Integration

**Objective:** Verify ID Vault password is updated.

**Preconditions:**
- User's ID is in ID Vault
- Signer has Password Reset Authority

**Steps:**
1. Complete password reset flow
2. Open Notes Client
3. Attempt to authenticate with new password

**Expected Results:**
- ✅ Notes Client accepts new password
- ✅ ID downloaded from vault (if not cached)
- ✅ User can access Notes applications

**Troubleshooting:**
If ID Vault reset fails:
1. Check signer's Password Reset Authority
2. Verify ID_VAULT_SERVER configuration
3. Check vault ACL permissions
4. Review agent log for errors

---

### TC-012: HTTP Password Only

**Objective:** Verify HTTP password updated when ID Vault fails.

**Preconditions:**
- Simulate ID Vault unavailability

**Steps:**
1. Complete password reset flow
2. Observe Step 4 results

**Expected Results:**
- ✅ HTTP: Success
- ✅ ID Vault: Failure with error message
- ✅ User can login to webmail
- ✅ User notified to contact support for Notes password

---

### TC-013: Concurrent Reset Attempts

**Objective:** Verify handling of simultaneous reset attempts.

**Steps:**
1. Open two browser windows/tabs
2. Start reset wizard in both with same email
3. Complete Step 2 in Window 1
4. Complete Step 2 in Window 2
5. Complete password reset in Window 1
6. Attempt to complete in Window 2

**Expected Results:**
- ✅ Only one reset succeeds
- ✅ Second attempt handled gracefully
- ✅ No data corruption

---

## Security Test Cases

### ST-001: SQL/LDAP Injection

**Test Input:**
```
Email: '; DROP TABLE users; --
Answer: ' OR '1'='1
```

**Expected:** Input sanitized, no errors exposed

### ST-002: XSS Prevention

**Test Input:**
```
Answer: <script>alert('XSS')</script>
```

**Expected:** Script tags escaped, not executed

### ST-003: Direct Backend Access

**Steps:**
1. Try to access `https://server/ForgotPasswordData.nsf`

**Expected:** Access denied (ACL blocks web access)

---

## Performance Test Cases

### PT-001: Load Test

**Objective:** Verify application handles concurrent users.

**Parameters:**
- 100 concurrent users
- 5-minute test duration
- Mix of registration and reset operations

**Metrics to Measure:**
- Response time (target: <3 seconds)
- Error rate (target: <1%)
- Server CPU/memory usage

### PT-002: Database Size

**Objective:** Verify performance with large profile count.

**Setup:**
- Create 10,000+ test profiles
- Run view indexes

**Tests:**
- Email lookup time
- Profile retrieval time
- Agent execution time

---

## Test Report Template

```
Test Execution Report
=====================
Date: [DATE]
Tester: [NAME]
Environment: [SERVER]
Version: [VERSION]

Test Results Summary:
- Total Tests: [N]
- Passed: [N]
- Failed: [N]
- Blocked: [N]

Failed Tests:
- [TC-XXX]: [Brief description of failure]

Notes:
[Any observations or recommendations]
```
