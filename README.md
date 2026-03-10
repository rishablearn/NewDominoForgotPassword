# HCL Domino Self-Service Password Reset

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Domino](https://img.shields.io/badge/HCL%20Domino-10.x%20%7C%2011.x%20%7C%2012.x%20%7C%2014.x-green.svg)](https://www.hcltechsw.com/domino)
[![XPages](https://img.shields.io/badge/XPages-Enabled-orange.svg)](https://www.hcltechsw.com/domino)

A comprehensive self-service password reset solution for HCL Domino environments. Reduces IT support calls by allowing users to securely reset both HTTP (Webmail) and Notes Client passwords independently.

![Password Reset Portal](docs/images/screenshot-placeholder.png)

## 🎯 Overview

This application provides a modern, secure, and user-friendly password reset experience for HCL Domino users. It integrates seamlessly with ID Vault for Notes Client password management.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        End Users                                 │
│                    (Web Browser Access)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│              Front-End Database (resetpwd.nsf)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   XPages    │  │  Custom     │  │   Script Libraries      │  │
│  │   (UI)      │  │  Controls   │  │   (Business Logic)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│           Back-End Database (ForgotPasswordData.nsf)             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Forms     │  │   Views     │  │   Scheduled Agents      │  │
│  │   (Data)    │  │  (Lookup)   │  │   (Maintenance)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    HCL Domino Server                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  ID Vault   │  │  Directory  │  │   HTTP Task             │  │
│  │  (Notes ID) │  │  (names.nsf)│  │   (Web Server)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Dual Password Reset** | Resets both HTTP and Notes Client (ID Vault) passwords |
| 🛡️ **Secure Answer Storage** | Answers hashed with bcrypt (configurable cost factor) |
| 🔒 **Account Lockout** | Automatic lockout after configurable failed attempts |
| ⏰ **Auto-Unlock** | Scheduled agent automatically unlocks accounts |
| 📝 **Audit Logging** | Complete audit trail for compliance |
| 🎨 **Modern UI** | Responsive design with accessibility support |
| ⚙️ **Configurable** | All settings managed through configuration documents |
| 🌐 **Multi-Version** | Compatible with Domino 10.x through 14.x |

## 📋 Prerequisites

- **HCL Domino Server** 10.x, 11.x, 12.x, or 14.x
- **ID Vault** configured and operational
- **Signer ID** with Password Reset Authority
- **HTTPS** configured (recommended for production)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/NewDominoForgotPassword.git

# 2. Review the installation guide
open docs/INSTALLATION.md
```

### Installation Steps

1. **Create databases** on your Domino server
2. **Import design elements** from this repository
3. **Configure ACLs** for security
4. **Sign databases** with authorized ID
5. **Create configuration** documents
6. **Enable scheduled agents**
7. **Test** with a pilot user

📖 **[Full Installation Guide](docs/INSTALLATION.md)** - Detailed step-by-step instructions

## 📁 Project Structure

```
NewDominoForgotPassword/
├── FrontEnd-resetpwd.nsf/          # Front-End UI Components
│   ├── XPages/                      # Main application pages
│   │   ├── xpHome.xsp              # Landing page
│   │   ├── xpRegister.xsp          # Security question setup
│   │   ├── xpResetWizard.xsp       # Password reset wizard
│   │   └── xpUpdateProfile.xsp     # Update questions
│   ├── CustomControls/              # Reusable components
│   ├── ScriptLibraries/             # Server-side JavaScript
│   └── Resources/                   # CSS, JS, Images
│
├── BackEnd-ForgotPasswordData.nsf/ # Back-End Data Storage
│   ├── Forms/                       # Document schemas
│   ├── Views/                       # Data lookups
│   └── Agents/                      # Scheduled tasks
│
├── deploy/                          # Deployment helpers
│   ├── scripts/                     # Deployment scripts
│   └── templates/                   # Configuration templates
│
└── docs/                            # Documentation
    ├── INSTALLATION.md              # Setup guide
    ├── CONFIGURATION.md             # Settings reference
    ├── CUSTOMIZATION.md             # Branding guide
    └── TESTING.md                   # Test procedures
```

## 🔄 Application Flow

### Registration (One-Time Setup)
```
User Login → Select 3 Questions → Enter Answers → Profile Saved
```

### Password Reset
```
Enter Email → Answer Questions → Set New Password → Success!
     │              │                   │
     ▼              ▼                   ▼
  Lookup        Verify              Reset HTTP +
  Profile       Answers             ID Vault
```

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **Answer Hashing** | bcrypt with configurable cost factor (default: 12) |
| **Data Isolation** | Backend database has no web access |
| **Session Security** | Timeout-based wizard with session validation |
| **Brute Force Protection** | Account lockout after failed attempts |
| **Audit Trail** | Complete logging of all operations |
| **Password Complexity** | Configurable rules enforcement |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALLATION.md) | Step-by-step setup instructions |
| [Configuration Guide](docs/CONFIGURATION.md) | All configuration options |
| [Customization Guide](docs/CUSTOMIZATION.md) | Branding and UI customization |
| [Testing Guide](docs/TESTING.md) | Test procedures and verification |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- 📖 Check the [Installation Guide](docs/INSTALLATION.md) for setup help
- 🐛 Open an [Issue](https://github.com/yourusername/NewDominoForgotPassword/issues) for bugs
- 💬 Start a [Discussion](https://github.com/yourusername/NewDominoForgotPassword/discussions) for questions

---

**Made with ❤️ for the HCL Domino Community**
