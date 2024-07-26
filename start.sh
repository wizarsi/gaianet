#!/bin/bash

# File containing phrases
file="phrases.txt"
# Alternative debug file
# file="debug_phrases.txt"

# URL for the API
url="https://0x0aa110d2e3a2f14fc122c849cea06d1bc9ed1c62.us.gaianet.network/v1/chat/completions"

# Function to send the API request
send_request() {
    local line=$1
    curl -X POST "$url" \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"messages\":[{\"role\":\"system\", \"content\": \"You are a helpful assistant.\"}, {\"role\":\"user\", \"content\": \"$line\"}]}"
    echo -e "\n"
}

# Infinite loop to repeatedly read the file and send requests
while true; do
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
