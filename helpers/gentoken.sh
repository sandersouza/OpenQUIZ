#!/bin/bash
environment=".env"

function gentoken() {
    TOKEN=$(openssl rand -hex 32)
    echo $TOKEN
}

function main() {
    if [ ! -f $environment ]; then
        echo "File .env not exist... you need to create it based in .env-example."
        exit 0
    fi

    token=$(grep "bearier_token" "$environment" | awk -F'=' '{print $2}')
    if [ -n "$token" ]; then
        read -p "Bearier Token yet exist, want to create a new one (Y/n)?" select
        if [ "$select" == "Y" ]; then
            echo -n "Generate new token... "
            token="bearier_token=$(gentoken)"
            file=$(cat "$environment" | sed "/bearier_token/d")
            echo -e "$file\n$token" > $environment
            echo "Environment file updated."
            echo "New Bearier Token: $( echo $token | grep "bearier_token" | awk -F'=' '{print $2}' )"
            exit 1
        else
            echo "Cancelled."
            exit 1
        fi
        exit 1
    fi
}

main