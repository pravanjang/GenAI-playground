# Extend the official Ollama image and ensure curl is installed
FROM ollama/ollama:latest

# Make sure sh cares about failures
SHELL ["/bin/sh", "-eux", "-c"]

# Try common package managers to install curl if it's not present
RUN set -eux; \
    if command -v curl >/dev/null 2>&1; then \
        echo "curl already installed"; \
    elif command -v apt-get >/dev/null 2>&1; then \
        apt-get update; apt-get install -y --no-install-recommends curl; rm -rf /var/lib/apt/lists/*; \
    elif command -v apk >/dev/null 2>&1; then \
        apk add --no-cache curl; \
    elif command -v yum >/dev/null 2>&1; then \
        yum -y install curl; yum clean all; \
    else \
        echo "Warning: no supported package manager found, curl will not be installed"; \
    fi

# Don't alter entrypoint or command; we only add curl to the base image

# Confirm curl is present (non-fatal)
RUN set -eux; command -v curl || echo 'curl is not installed';
