#!/bin/bash

# Quick frontend update script for EC2
echo "🔄 Updating frontend with fs error fix..."

# Navigate to frontend directory
cd /home/ec2-user/nfsa_fe

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop megapolis-frontend 2>/dev/null || true
docker rm megapolis-frontend 2>/dev/null || true

# Rebuild with fixed code
echo "🔨 Rebuilding with fs error fix..."
docker build -f Dockerfile.simple -t megapolis-frontend .

# Start new container
echo "▶️ Starting updated container..."
docker run -d -p 3000:80 --name megapolis-frontend megapolis-frontend

# Wait a moment for container to start
sleep 3

# Check if it's working
echo "🔍 Checking if frontend is working..."
if curl -s -I http://localhost:3000 | grep -q "200 OK"; then
    echo "✅ Frontend updated successfully!"
    echo "🌐 Frontend available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
else
    echo "❌ Frontend update failed!"
    echo "📋 Container logs:"
    docker logs megapolis-frontend
fi

echo "🎉 Update complete!"