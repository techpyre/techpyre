#!/bin/bash
set -e
git add .
MSG="${1:-Update automatico}"
git commit -m "$MSG"
git push origin main
echo "Modifiche inviate a GitHub!"
