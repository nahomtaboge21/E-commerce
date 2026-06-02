#!/bin/bash
# ShopWave — CWP Deployment Build Script
# Run this locally before uploading to your server

echo "📦 Installing backend dependencies..."
cd backend && npm install --omit=dev && cd ..

echo "⚛️  Building React frontend..."
cd frontend && npm install && npm run build && cd ..

echo "✅ Build complete!"
echo ""
echo "Upload the following to your server:"
echo "  - backend/"
echo "  - frontend/build/"
echo "  - ecosystem.config.js"
echo "  - package.json"
echo ""
echo "Then on the server run:"
echo "  cd /path/to/shopwave"
echo "  cp backend/.env.example backend/.env"
echo "  nano backend/.env          # fill in your values"
echo "  pm2 start ecosystem.config.js --env production"
echo "  pm2 save"
echo "  pm2 startup"
