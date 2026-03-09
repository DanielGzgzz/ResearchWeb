#!/usr/bin/env bash
# Geon Framework Computational Simulation Environment - Updater Script
# Pulls the latest simulation engine and academic UI updates from GitHub.

set -e

echo "=========================================================="
echo " Geon Framework Updater"
echo "=========================================================="

# Ensure we are inside the git repository
if [ ! -d ".git" ]; then
    echo "Error: This script must be run from the root of the Geon repository."
    echo "Please cd into the repository directory and try again."
    exit 1
fi

echo "Fetching latest changes from origin..."
git fetch origin

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $CURRENT_BRANCH"

echo "Pulling latest updates for $CURRENT_BRANCH..."
git pull origin "$CURRENT_BRANCH"

echo ""
echo "=========================================================="
echo " Update complete."
echo " To run the simulation environment, start a local server:"
echo "   python -m http.server 8000 --directory geon-vanilla"
echo "=========================================================="
