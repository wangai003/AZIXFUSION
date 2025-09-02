#!/bin/bash
# Deploy both backend and frontend to Vercel
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

if ! command -v vercel &> /dev/null; then
  printf "${RED}Vercel CLI not found. Install with: npm i -g vercel${NC}\n"
  exit 1
fi

printf "${GREEN}Deploying backend...${NC}\n"
cd backend
vercel --prod --confirm || { printf "${RED}Backend deploy failed!${NC}\n"; exit 1; }
cd ..

printf "${GREEN}Deploying frontend...${NC}\n"
cd frontend
vercel --prod --confirm || { printf "${RED}Frontend deploy failed!${NC}\n"; exit 1; }
cd ..

printf "${GREEN}Deployment complete! Check your Vercel dashboard for live URLs.${NC}\n" 