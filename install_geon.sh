#!/usr/bin/env bash
# Geon Framework - Desktop Installer & Updater
# Run this script from anywhere on your computer (like your Desktop)
# to download or update the Geon Framework Simulation Environment.

set -e

REPO_URL="https://github.com/DanielGzgzz/ResearchWeb.git"
TARGET_DIR="ResearchWeb"

echo "=========================================================="
echo " Geon Framework Simulation Environment Setup"
echo "=========================================================="

if [ ! -d "$TARGET_DIR" ]; then
    echo "Directory '$TARGET_DIR' not found."
    echo "Cloning the latest version from GitHub..."
    git clone "$REPO_URL"
    echo ""
    echo "Successfully downloaded!"
else
    echo "Directory '$TARGET_DIR' already exists."
    echo "Checking for updates..."
    cd "$TARGET_DIR"

    # Ensure it's actually the git repo we expect
    if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        echo "Fetching and pulling latest changes for branch '$CURRENT_BRANCH'..."
        git fetch origin
        git pull origin "$CURRENT_BRANCH"
        echo ""
        echo "Successfully updated!"
        cd ..
    else
        echo "Error: Directory '$TARGET_DIR' exists but is not a Git repository."
        echo "Please rename or remove the existing folder and try again."
        exit 1
    fi
fi

echo "=========================================================="
echo " Setup Complete."
echo " "
echo " Remember, you can also view the live version online at:"
echo " https://DanielGzgzz.github.io/ResearchWeb/"
echo " "
echo " To run the simulation locally on your machine:"
echo "   1. cd $TARGET_DIR/geon-vanilla"
echo "   2. python -m http.server 8000"
echo "   3. Open http://localhost:8000 in your browser"
echo "=========================================================="
