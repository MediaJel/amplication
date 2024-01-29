#!/bin/bash

set -e

# Resets nx Daemon
npx nx reset 

# Removes nx cache
rm -rf ./node_modules/.cache

# Serve the app
npm run serve:server &
npm run serve:client &
npm run serve:dsg &
npm run serve:git &
npm run serve:plugins