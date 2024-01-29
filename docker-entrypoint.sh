#!/bin/bash

set -e

# Removes nx cache
rm -rf ./node_modules/.cache

# Resets nx Daemon
npx nx reset 

# Serve the app
npm run serve:all