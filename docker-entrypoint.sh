#!/bin/bash

set -e

# Removes nx cache
rm -rf ./node_modules/.cache

# Resets nx Daemon
npx nx reset 

# Serve the app
npm run serve:server &
npm run serve:client &
npm run serve:dsg &
npm run serve:git &
npm run serve: plugins