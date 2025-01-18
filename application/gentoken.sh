#!/bin/bash
TOKEN=$(openssl rand -hex 32)
CONFIG_FILE="config.yml"

if grep -q "bearer_token" "$CONFIG_FILE"; then
    sed -i "s/bearer_token:.*/bearer_token: \"$TOKEN\"/" "$CONFIG_FILE"
else
    echo -e "\nauth:\n  bearer_token: \"$TOKEN\"" >> "$CONFIG_FILE"
fi

echo "Novo token gerado: $TOKEN"