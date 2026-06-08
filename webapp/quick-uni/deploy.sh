#!/bin/bash
echo "Starting deployment..."
git pull origin master
npm install
npm run build
pm2 restart quick-uni
echo "Deployment successful!"