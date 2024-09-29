#!/bin/bash

# File containing phrases
# shellcheck disable=SC2207
file=($(jq -r '.pathToFile' config.json))
# Alternative debug file
# file="debug_phrases.txt"

# Ensure API_URL environment variable is set
if [[ -z "${API_URL}" ]]; then
    echo "Error: API_URL environment variable is not set."
    exit 1
fi

# URL for the API (only from environment variable)
url=$API_URL

# Function to send the API request
send_request() {
    local line=$1
    # shellcheck disable=SC2128
    curl -X POST "$url" \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"messages\":[{\"role\":\"system\", \"content\": \"You are a helpful assistant.\"}, {\"role\":\"user\", \"content\": \"$line\"}]}"
    echo -e "\n"
}

# Infinite loop to repeatedly read the file and send requests
while true; do
    # shellcheck disable=SC2128
    if [[ -f $file ]]; then
        while IFS= read -r line; do
            send_request "$line"
            sleep 1
        done < "$file"
    else
        echo "File '$file' not found. Retrying in 5 seconds..."
        sleep 5
    fi
done
