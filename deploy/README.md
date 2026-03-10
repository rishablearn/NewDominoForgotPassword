# Deployment Files

This directory contains files to help with deployment to HCL Domino servers.

## Contents

- `dxl/` - DXL (Domino XML Language) export files for importing into databases
- `scripts/` - Helper scripts for deployment
- `templates/` - Configuration templates

## Quick Deployment

1. Create the NSF databases on your Domino server
2. Import the DXL files using Domino Designer or DXL Importer
3. Configure ACLs as documented
4. Sign the databases
5. Configure application settings

See the main [INSTALLATION.md](../docs/INSTALLATION.md) for complete instructions.
