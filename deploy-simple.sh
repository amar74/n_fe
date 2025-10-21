#!/bin/bash

# Simple deployment script for EC2 with disk space issues
echo "🚀 Deploying with pre-built assets..."

# Build locally first
echo "📦 Building locally..."
pnpm run build

# Copy to EC2 (replace with your EC2 details)
echo "📤 Uploading to EC2..."
scp -r dist/ ec2-user@your-ec2-ip:/home/ec2-user/nfsa_fe/
scp Dockerfile.simple ec2-user@your-ec2-ip:/home/ec2-user/nfsa_fe/Dockerfile
scp nginx.conf ec2-user@your-ec2-ip:/home/ec2-user/nfsa_fe/

# Build on EC2 (much smaller build)
echo "🐳 Building Docker image on EC2..."
ssh ec2-user@your-ec2-ip "cd /home/ec2-user/nfsa_fe && docker build -t megapolis-frontend ."

# Run container
echo "▶️ Starting container..."
ssh ec2-user@your-ec2-ip "docker run -d -p 3000:80 --name megapolis-frontend megapolis-frontend"

echo "✅ Deployment complete! App running on port 3000"