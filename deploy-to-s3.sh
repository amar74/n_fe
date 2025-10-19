#!/bin/bash

# ===========================================
# Deploy Frontend to AWS S3 + CloudFront
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
S3_BUCKET_NAME=${S3_BUCKET_NAME:-"megapolis-frontend"}
CLOUDFRONT_DISTRIBUTION_ID=${CLOUDFRONT_DISTRIBUTION_ID:-""}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deploying Frontend to AWS S3${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it with: brew install awscli"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials verified${NC}"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Create .env.production with required environment variables:"
    echo "  VITE_API_BASE_URL=https://api.megapolis.com"
    echo "  VITE_SUPABASE_URL=your-supabase-url"
    echo "  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key"
    echo "  VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key"
    exit 1
fi

echo -e "${GREEN}✓ Environment file found${NC}"

# Load environment variables
source .env.production

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build the application
echo -e "${YELLOW}Building application...${NC}"
pnpm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed${NC}"

# Check if S3 bucket exists, create if not
echo -e "${YELLOW}Checking S3 bucket...${NC}"
if ! aws s3 ls "s3://$S3_BUCKET_NAME" &> /dev/null; then
    echo -e "${YELLOW}Creating S3 bucket: $S3_BUCKET_NAME${NC}"
    aws s3 mb "s3://$S3_BUCKET_NAME" --region "$AWS_REGION"
    
    # Enable static website hosting
    aws s3 website "s3://$S3_BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy for public access
    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket "$S3_BUCKET_NAME" \
        --policy file:///tmp/bucket-policy.json
    
    echo -e "${GREEN}✓ Bucket created and configured${NC}"
else
    echo -e "${GREEN}✓ Bucket exists${NC}"
fi

# Sync files to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"

# Upload all files except index.html with long cache
aws s3 sync dist/ "s3://$S3_BUCKET_NAME/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "*.map"

# Upload index.html with no-cache
aws s3 cp dist/index.html "s3://$S3_BUCKET_NAME/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

# Invalidate CloudFront cache if distribution ID is provided
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${GREEN}✓ CloudFront invalidation created: $INVALIDATION_ID${NC}"
    echo -e "${YELLOW}Note: Invalidation may take 5-10 minutes to complete${NC}"
else
    echo -e "${YELLOW}⚠ CloudFront distribution ID not provided, skipping cache invalidation${NC}"
    echo -e "${YELLOW}Set CLOUDFRONT_DISTRIBUTION_ID environment variable to enable this${NC}"
fi

# Get S3 website URL
S3_WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

# Display summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "S3 Bucket: ${GREEN}$S3_BUCKET_NAME${NC}"
echo -e "Region: ${GREEN}$AWS_REGION${NC}"
echo -e "Website URL: ${GREEN}$S3_WEBSITE_URL${NC}"
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "CloudFront: ${GREEN}$CLOUDFRONT_DISTRIBUTION_ID${NC}"
fi
echo -e "${GREEN}========================================${NC}"

# Count uploaded files
FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
DIST_SIZE=$(du -sh dist | cut -f1)

echo -e "Files uploaded: ${GREEN}$FILE_COUNT${NC}"
echo -e "Total size: ${GREEN}$DIST_SIZE${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${GREEN}Next Steps:${NC}"
echo -e "${GREEN}========================================${NC}"
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "1. Create a CloudFront distribution pointing to: $S3_WEBSITE_URL"
    echo "2. Add SSL certificate (ACM) to CloudFront distribution"
    echo "3. Configure Route 53 DNS to point to CloudFront"
    echo "4. Set CLOUDFRONT_DISTRIBUTION_ID environment variable for future deployments"
else
    echo "Your application is being deployed!"
    echo "Access it at your CloudFront URL or custom domain"
fi
echo -e "${GREEN}========================================${NC}"

echo -e "${GREEN}✓ Deployment complete!${NC}"
