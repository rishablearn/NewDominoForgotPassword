# Configuration Guide

## Configuration Keywords Reference

All configuration is managed through keyword documents in the Front-End database (resetpwd.nsf).

### Database Paths

| Keyword | Description | Example |
|---------|-------------|---------|
| DATA_DB_PATH | Path to backend database | `ForgotPasswordData.nsf` |
| ID_VAULT_SERVER | ID Vault server name | `CN=Vault01/O=Acme` |
| HTTP_SERVER | HTTP server name | `CN=Web01/O=Acme` |
| VAULT_DB_PATH | ID Vault database path | `IBM_ID_VAULT/vault.nsf` |

### Security Settings

| Keyword | Description | Default | Range |
|---------|-------------|---------|-------|
| MAX_FAILED_ATTEMPTS | Lockout threshold | 5 | 3-10 |
| LOCKOUT_DURATION_MINUTES | Auto-unlock time | 30 | 15-1440 |
| BCRYPT_COST_FACTOR | Hash complexity | 12 | 10-14 |
| SESSION_TIMEOUT_MINUTES | Wizard timeout | 15 | 5-60 |
| MIN_PASSWORD_LENGTH | Minimum password length | 8 | 6-20 |
| REQUIRE_PASSWORD_COMPLEXITY | Enforce complexity | Yes | Yes/No |

### Password Complexity Rules

When REQUIRE_PASSWORD_COMPLEXITY is enabled:
- Minimum length as configured
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)
- Cannot contain username
- Cannot match previous 5 passwords (if history enabled)

### UI Configuration

| Keyword | Description | Example |
|---------|-------------|---------|
| APP_TITLE | Application title | `Password Reset Portal` |
| COMPANY_NAME | Organization name | `Acme Corporation` |
| SUPPORT_EMAIL | Help desk email | `helpdesk@acme.com` |
| SUPPORT_PHONE | Help desk phone | `1-800-555-1234` |
| LOGO_URL | Custom logo path | `logo.png` |

## Logging Configuration

### Enable Audit Logging

Create keyword document:
```
Keyword: ENABLE_AUDIT_LOG
Value: Yes
```

### Log Levels

```
Keyword: LOG_LEVEL
Value: INFO
Options: DEBUG, INFO, WARN, ERROR
```

### Log Retention

```
Keyword: LOG_RETENTION_DAYS
Value: 90
```

### Logged Events

When enabled, the following events are logged:

| Event | Level | Details |
|-------|-------|---------|
| Registration | INFO | User, timestamp, questions selected |
| Reset Attempt | INFO | User, timestamp, success/failure |
| Lockout | WARN | User, timestamp, attempt count |
| Unlock | INFO | User, timestamp, method (auto/manual) |
| Config Change | INFO | Admin, setting, old/new value |

## Email Notifications

### Enable Email Notifications

```
Keyword: ENABLE_EMAIL_NOTIFICATIONS
Value: Yes
```

### Notification Templates

**Password Reset Success:**
```
Keyword: EMAIL_RESET_SUCCESS
Value: Your password has been successfully reset. If you did not request this change, contact IT immediately.
```

**Account Locked:**
```
Keyword: EMAIL_ACCOUNT_LOCKED
Value: Your password reset account has been locked due to multiple failed attempts. It will automatically unlock in {LOCKOUT_DURATION} minutes.
```

### SMTP Configuration

```
Keyword: SMTP_SERVER
Value: mail.acme.com

Keyword: SMTP_FROM_ADDRESS  
Value: noreply@acme.com
```

## Security Hardening

### Recommended Security Settings

1. **Increase bcrypt cost factor** for high-security environments:
   ```
   BCRYPT_COST_FACTOR: 14
   ```

2. **Reduce lockout threshold** for sensitive data:
   ```
   MAX_FAILED_ATTEMPTS: 3
   ```

3. **Enable all logging**:
   ```
   ENABLE_AUDIT_LOG: Yes
   LOG_LEVEL: DEBUG
   ```

4. **Shorter session timeout**:
   ```
   SESSION_TIMEOUT_MINUTES: 10
   ```

### IP Restrictions (Optional)

To restrict access by IP range:
```
Keyword: ALLOWED_IP_RANGES
Value: 10.0.0.0/8,192.168.0.0/16,172.16.0.0/12
```

### Rate Limiting

```
Keyword: RATE_LIMIT_REQUESTS
Value: 10

Keyword: RATE_LIMIT_WINDOW_MINUTES
Value: 5
```

## Scheduled Agent Configuration

### UnlockProfiles Agent

**Purpose:** Automatically unlocks profiles after lockout duration expires.

**Schedule:**
- Recommended: Every 15 minutes
- Minimum: Every 5 minutes
- Maximum: Every 60 minutes

**Configuration:**
1. Open agent in Designer
2. Set schedule: "More than once a day"
3. Set interval based on LOCKOUT_DURATION_MINUTES
4. Enable agent

### CleanupLogs Agent (Optional)

**Purpose:** Removes old log entries based on retention policy.

**Schedule:**
- Recommended: Daily at 2:00 AM
- Run during low-usage hours

## Performance Tuning

### For Large Organizations (>10,000 users)

1. **Optimize views** in backend database:
   - Ensure proper indexing on email field
   - Consider full-text indexing for searches

2. **Cache configuration:**
   ```
   Keyword: CACHE_CONFIG_SECONDS
   Value: 300
   ```

3. **Connection pooling:**
   - Domino handles this automatically
   - Ensure adequate server memory

4. **Database maintenance:**
   - Schedule compact weekly
   - Update full-text index daily

### Recommended Server Settings

In notes.ini:
```
NSF_BUFFER_POOL_SIZE_MB=512
SERVER_MAXSESSIONS=1000
HTTP_MAXCONNECTIONSCACHE=100
```

## Multi-Server Deployment

For clustered or multi-server environments:

1. **Replicate backend database** to all HTTP servers
2. **Use cluster replication** for real-time sync
3. **Configure same keywords** on all replicas
4. **Point ID_VAULT_SERVER** to cluster name or primary

### Cluster Configuration

```
Keyword: CLUSTER_ENABLED
Value: Yes

Keyword: CLUSTER_SERVERS
Value: CN=Web01/O=Acme,CN=Web02/O=Acme
```

## Backup and Recovery

### Recommended Backup Schedule

| Database | Frequency | Retention |
|----------|-----------|-----------|
| resetpwd.nsf | Weekly | 4 weeks |
| ForgotPasswordData.nsf | Daily | 30 days |
| Logs | Weekly | 90 days |

### Recovery Procedures

1. **Profile data loss:** Restore from backup; users may need to re-register
2. **Configuration loss:** Re-enter keywords from documentation
3. **Complete loss:** Restore both databases and re-sign
