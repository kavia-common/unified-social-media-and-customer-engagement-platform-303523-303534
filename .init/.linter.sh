#!/bin/bash
cd /home/kavia/workspace/code-generation/unified-social-media-and-customer-engagement-platform-303523-303534/angular_frontend
npx eslint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

