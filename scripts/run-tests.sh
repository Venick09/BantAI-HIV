#!/bin/bash

echo "🧪 BantAI-HIV Test Suite Runner"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
check_dev_server() {
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓ Development server is running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Development server is not running${NC}"
        echo "  Starting dev server in the background..."
        npm run dev > /dev/null 2>&1 &
        DEV_PID=$!
        sleep 10
        return 1
    fi
}

# Run unit tests
run_unit_tests() {
    echo -e "\n${YELLOW}Running Unit Tests...${NC}"
    npm run test:unit
    return $?
}

# Run E2E tests
run_e2e_tests() {
    echo -e "\n${YELLOW}Running E2E Tests...${NC}"
    # Run only non-skipped tests and with a shorter timeout
    npx playwright test --grep-invert @skip --timeout=10000
    return $?
}

# Main execution
main() {
    local dev_started=0
    
    # Check/start dev server
    if ! check_dev_server; then
        dev_started=1
    fi
    
    # Run tests
    echo -e "\n${YELLOW}Starting test suite...${NC}\n"
    
    # Unit tests
    if run_unit_tests; then
        echo -e "${GREEN}✓ Unit tests passed${NC}"
    else
        echo -e "${RED}✗ Unit tests failed${NC}"
    fi
    
    # E2E tests (only if dev server is available)
    if [ $dev_started -eq 0 ]; then
        if run_e2e_tests; then
            echo -e "${GREEN}✓ E2E tests passed${NC}"
        else
            echo -e "${RED}✗ E2E tests failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Skipping E2E tests (dev server just started)${NC}"
        echo "  Run this script again to execute E2E tests"
        
        # Stop the dev server we started
        if [ ! -z "$DEV_PID" ]; then
            kill $DEV_PID 2>/dev/null
        fi
    fi
    
    echo -e "\n${GREEN}Test suite completed!${NC}"
}

# Run main function
main