#!/bin/bash
#
# HCL Domino Forgot Password - Deployment Script
# This script helps prepare files for deployment to a Domino server
#

set -e

echo "=============================================="
echo "HCL Domino Forgot Password - Deployment Helper"
echo "=============================================="
echo ""

# Configuration
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deploy"
OUTPUT_DIR="$DEPLOY_DIR/output"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Project root: $PROJECT_ROOT"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Function to create deployment package
create_package() {
    echo "Creating deployment package..."
    
    # Create timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    PACKAGE_NAME="domino-forgot-password-$TIMESTAMP"
    PACKAGE_DIR="$OUTPUT_DIR/$PACKAGE_NAME"
    
    mkdir -p "$PACKAGE_DIR"
    
    # Copy frontend files
    echo "  - Copying frontend files..."
    cp -r "$PROJECT_ROOT/FrontEnd-resetpwd.nsf" "$PACKAGE_DIR/"
    
    # Copy backend files
    echo "  - Copying backend files..."
    cp -r "$PROJECT_ROOT/BackEnd-ForgotPasswordData.nsf" "$PACKAGE_DIR/"
    
    # Copy documentation
    echo "  - Copying documentation..."
    cp -r "$PROJECT_ROOT/docs" "$PACKAGE_DIR/"
    cp "$PROJECT_ROOT/README.md" "$PACKAGE_DIR/"
    
    # Copy deployment templates
    echo "  - Copying templates..."
    cp -r "$DEPLOY_DIR/templates" "$PACKAGE_DIR/" 2>/dev/null || true
    
    # Create zip archive
    echo "  - Creating archive..."
    cd "$OUTPUT_DIR"
    zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME" -x "*.DS_Store" -x "*__MACOSX*"
    
    echo ""
    echo "✓ Package created: $OUTPUT_DIR/$PACKAGE_NAME.zip"
    echo ""
}

# Function to validate project structure
validate_structure() {
    echo "Validating project structure..."
    
    local errors=0
    
    # Check frontend files
    if [ ! -d "$PROJECT_ROOT/FrontEnd-resetpwd.nsf" ]; then
        echo "  ✗ Missing: FrontEnd-resetpwd.nsf/"
        ((errors++))
    else
        echo "  ✓ FrontEnd-resetpwd.nsf/"
    fi
    
    # Check backend files
    if [ ! -d "$PROJECT_ROOT/BackEnd-ForgotPasswordData.nsf" ]; then
        echo "  ✗ Missing: BackEnd-ForgotPasswordData.nsf/"
        ((errors++))
    else
        echo "  ✓ BackEnd-ForgotPasswordData.nsf/"
    fi
    
    # Check XPages
    if [ ! -f "$PROJECT_ROOT/FrontEnd-resetpwd.nsf/XPages/xpHome.xsp" ]; then
        echo "  ✗ Missing: XPages/xpHome.xsp"
        ((errors++))
    else
        echo "  ✓ XPages present"
    fi
    
    # Check documentation
    if [ ! -f "$PROJECT_ROOT/docs/INSTALLATION.md" ]; then
        echo "  ✗ Missing: docs/INSTALLATION.md"
        ((errors++))
    else
        echo "  ✓ Documentation present"
    fi
    
    echo ""
    if [ $errors -eq 0 ]; then
        echo "✓ All required files present"
    else
        echo "✗ $errors error(s) found"
    fi
    echo ""
    
    return $errors
}

# Main menu
show_menu() {
    echo "Select an option:"
    echo "  1) Validate project structure"
    echo "  2) Create deployment package"
    echo "  3) Both (validate and create)"
    echo "  4) Exit"
    echo ""
    read -p "Enter choice [1-4]: " choice
    
    case $choice in
        1) validate_structure ;;
        2) create_package ;;
        3) validate_structure && create_package ;;
        4) exit 0 ;;
        *) echo "Invalid option"; show_menu ;;
    esac
}

# Run
if [ "$1" == "--validate" ]; then
    validate_structure
elif [ "$1" == "--package" ]; then
    create_package
elif [ "$1" == "--all" ]; then
    validate_structure && create_package
else
    show_menu
fi
