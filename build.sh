#!/bin/bash
set -x

# Install needed modules
npm install

# Create config file
cp config.js.example config.js

# Build
./node_modules/.bin/grunt build

# Copies target result to target folder
mkdir -p target
rsync -av . target/ --exclude=target --exclude=debian \
   --exclude=.gitignore --exclude=node_modules
rm -rf target/js/app target/css/main.css

