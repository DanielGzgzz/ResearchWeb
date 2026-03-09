#!/usr/bin/env bash
# Geon Framework Computational Simulation Environment - Updater Script
# Pulls the latest simulation engine and academic UI updates from GitHub.

set -e

echo "=========================================================="
echo " Geon Framework Updater"
echo "=========================================================="

# Always change to the directory where this script resides
cd "$(dirname "$0")"

# Ensure we are inside a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: This script must be run inside the Geon git repository."
    echo "Make sure you downloaded this folder via 'git clone'."
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
echo "   python -m http.server 8000"
echo "=========================================================="
