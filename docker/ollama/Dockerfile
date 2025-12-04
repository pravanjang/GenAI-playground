# Extend the official Ollama image and ensure curl is installed
FROM ollama/ollama:latest

# Make sure sh cares about failures
SHELL ["/bin/sh", "-eux", "-c"]

# Build-time arg (CSV list) of models to preload in the image. Override at build time via
# --build-arg OLLAMA_PRELOAD_MODELS="model1,model2". Default includes smollm and tinyllama.
ARG OLLAMA_PRELOAD_MODELS="smollm,tinyllama"

# Expose the arg as an environment variable for readability in logs (optional)
ENV OLLAMA_PRELOAD_MODELS=${OLLAMA_PRELOAD_MODELS}

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

# Pre-pull common models so the service is ready to use without additional downloads.
# Pulling models at build time makes the docker image larger but ensures models
# are available when the container starts.
#
# IMPORTANT: `ollama pull` requires the Ollama server to be running. We start it
# in the background, wait for it to be ready, pull models, then stop it.
RUN set -eux; \
    if command -v ollama >/dev/null 2>&1; then \
        echo "Starting Ollama server in background for model pulls..."; \
        ollama serve & \
        SERVER_PID=$!; \
        echo "Waiting for Ollama server to be ready..."; \
        for i in 1 2 3 4 5 6 7 8 9 10; do \
            if curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then \
                echo "Ollama server is ready"; \
                break; \
            fi; \
            echo "Waiting... ($i)"; \
            sleep 2; \
        done; \
        echo "OLLAMA_PRELOAD_MODELS=${OLLAMA_PRELOAD_MODELS}"; \
        for model in $(echo "${OLLAMA_PRELOAD_MODELS}" | tr ',' ' '); do \
            if [ -n "$model" ]; then \
                echo "Pulling $model"; \
                ollama pull "$model" || echo "Warning: failed to pull $model"; \
            fi; \
        done; \
        echo "Stopping Ollama server..."; \
        kill $SERVER_PID 2>/dev/null || true; \
        wait $SERVER_PID 2>/dev/null || true; \
        echo "Model pulls complete"; \
    else \
        echo "ollama CLI not found; skipping model pulls"; \
    fi
