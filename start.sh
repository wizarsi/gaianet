#!/bin/bash

for (( ; ; ))
do
    file="pheases.txt"
    # file="debug_phrases.txt"
    url="https://0x0aa110d2e3a2f14fc122c849cea06d1bc9ed1c62.us.gaianet.network/v1/chat/completions"

    while read -r line; do
        curl -X OST $url \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"messages\":[{\"role\":\"system\", \"content\": \"You are a helpful assistant.\"}, {\"role\":\"user\", \"content\": \"$line\"}]}"
        echo -e "\n"
        sleep 1
    done < $file 
done
