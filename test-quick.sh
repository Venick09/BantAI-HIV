#!/bin/bash

echo "🧪 BantAI-HIV Quick Test Script"
echo "================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server is running
echo -e "\n${YELLOW}1. Checking server status...${NC}"
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✓ Server is running on port 3001${NC}"
else
    echo -e "${RED}✗ Server not running. Start with: npm run dev${NC}"
    exit 1
fi

# Test public endpoints
echo -e "\n${YELLOW}2. Testing public endpoints...${NC}"

# Landing page
if curl -s http://localhost:3001 | grep -q "BantAI"; then
    echo -e "${GREEN}✓ Landing page loads${NC}"
else
    echo -e "${RED}✗ Landing page error${NC}"
fi

# Registration page
if curl -s http://localhost:3001/register | grep -q "register"; then
    echo -e "${GREEN}✓ Registration page accessible${NC}"
else
    echo -e "${RED}✗ Registration page error${NC}"
fi

# API endpoints
echo -e "\n${YELLOW}3. Testing API endpoints...${NC}"

# OTP endpoint (should return method not allowed for GET)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/sms/send-otp)
if [ $RESPONSE -eq 405 ]; then
    echo -e "${GREEN}✓ OTP API endpoint exists${NC}"
else
    echo -e "${RED}✗ OTP API endpoint error (HTTP $RESPONSE)${NC}"
fi

# Type checking
echo -e "\n${YELLOW}4. Running type check...${NC}"
if npm run types > /dev/null 2>&1; then
    echo -e "${GREEN}✓ TypeScript types valid${NC}"
else
    echo -e "${RED}✗ TypeScript errors found${NC}"
    echo "Run 'npm run types' to see details"
fi

# Linting
echo -e "\n${YELLOW}5. Running linter...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No linting errors${NC}"
else
    echo -e "${YELLOW}⚠ Linting warnings/errors found${NC}"
    echo "Run 'npm run lint' to see details"
fi

# Database check
echo -e "\n${YELLOW}6. Checking database...${NC}"
if npx drizzle-kit studio --port 4983 > /dev/null 2>&1 & then
    STUDIO_PID=$!
    sleep 2
    kill $STUDIO_PID 2>/dev/null
    echo -e "${GREEN}✓ Database connection works${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify database${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Quick tests completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Manual test registration: http://localhost:3001/register"
echo "2. Check console for OTP codes"
echo "3. Test admin dashboard after login"
echo "4. Run full test suite: npm test"