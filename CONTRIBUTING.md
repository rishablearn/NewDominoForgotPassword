# Contributing to HCL Domino Forgot Password

Thank you for your interest in contributing to this project!

## How to Contribute

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue template when available
3. Include:
   - Domino server version
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly on a Domino server
5. Commit with clear messages: `git commit -m "Add: description of change"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

### Commit Message Format

```
Type: Short description

Longer description if needed.

Fixes #123
```

Types:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Update existing feature
- `Refactor:` Code refactoring
- `Docs:` Documentation only
- `Style:` CSS/UI changes

### Code Style

- Use consistent indentation (2 spaces for XSP/XML, 4 spaces for JS)
- Comment complex logic
- Follow existing naming conventions
- Keep functions small and focused

### Testing

Before submitting:
- Test on Domino 10.x, 11.x, 12.x, and 14.x if possible
- Verify both HTTP and ID Vault password reset
- Test with different browsers
- Verify mobile responsiveness

## Development Setup

1. Clone the repository
2. Import design elements into Domino Designer
3. Configure test databases
4. See [INSTALLATION.md](docs/INSTALLATION.md) for setup

## Questions?

Open an issue with the "question" label.
