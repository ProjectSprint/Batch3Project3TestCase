# Default values for environment variables
DEBUG ?= false
BASE_URL ?= http://localhost:30000

.PHONY: test pull-test

# Pull latest changes from main branch
pull:
	git pull origin main

# Pull and run tests in one command
test-log: 
	BASE_URL=$(BASE_URL) k6 run test/main.js 2>&1 | sed 's/"//g' > output.txt


SCHEMA_DIR = test/schemas
$(SCHEMA_DIR):
	mkdir -p $(SCHEMA_DIR)

# Help command to show available targets
help:
	@echo "Available commands:"
	@echo "  make pull         - Pull latest changes from main branch"
	@echo "  make test         - Run k6 tests"
	@echo "  make pull-and-test- Pull changes and run tests"
	@echo ""
	@echo "Environment variables:"
	@echo "  DEBUG            - Debug mode (default: false)"
	@echo "  BASE_URL         - Base URL for tests (default: http://localhost:3000)"
