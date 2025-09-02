#!/bin/bash
# Test script for MERN Marketplace
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Install dependencies
printf "${GREEN}Installing backend dependencies...${NC}\n"
cd backend && npm install
cd ..
printf "${GREEN}Installing frontend dependencies...${NC}\n"
cd frontend && npm install
cd ..

# 2. Run backend tests (if any)
printf "${GREEN}Running backend tests...${NC}\n"
cd backend
if [ -f package.json ] && npx --no-install jest --version > /dev/null 2>&1; then
  npx jest || { printf "${RED}Backend tests failed!${NC}\n"; exit 1; }
else
  printf "${RED}No backend tests found. Skipping...${NC}\n"
fi
cd ..

# 3. Run frontend tests (if any)
printf "${GREEN}Running frontend tests...${NC}\n"
cd frontend
if [ -f package.json ] && npx --no-install jest --version > /dev/null 2>&1; then
  npx jest || { printf "${RED}Frontend tests failed!${NC}\n"; exit 1; }
else
  printf "${RED}No frontend tests found. Skipping...${NC}\n"
fi
cd ..

# 4. Health checks
printf "${GREEN}Checking backend health...${NC}\n"
curl -f http://localhost:5000/ || { printf "${RED}Backend health check failed!${NC}\n"; exit 1; }
printf "${GREEN}Checking frontend health...${NC}\n"
curl -f http://localhost:3000/ || { printf "${RED}Frontend health check failed!${NC}\n"; exit 1; }

printf "${GREEN}All tests and health checks passed!${NC}\n" 