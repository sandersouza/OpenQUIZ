#!/bin/bash
API_URL="https://api:4433/quizzes"
TSDB_URL="http://localhost:8086/api/v2/write?orgID=2d72070bfb91b366&bucket=stresstest&precision=ms"
TSDB_TOKEN="Authorization: Token TfqpqTgS0s3o-E4pZhN9kzN2liJH4EysdoQvJshuRbqBXH9qRg39rXPlSU0pCNNhsiNDsACxgk52aKF3SpNsbg=="

containers=($(docker ps --filter "ancestor=alpine/curl-http3:latest" --format "{{.Names}}"))
i=0

while sleep 1; do
    i=0
    while [ "$i" -lt "${#containers[@]}" ]; do
        (
            CONTAINER=${containers[$i]}
            START=$(($(date +%s) * 1000 + $(date +%-N) / 1000000))
            docker exec "$CONTAINER" curl --http3 -k "$API_URL"
            END=$(($(date +%s) * 1000 + $(date +%-N) / 1000000))
            ELAPSED=$((END - START))
            
            curl -XPOST "$TSDB_URL" \
                --header "$TSDB_TOKEN" \
                --data-binary "execution_time,host=$CONTAINER,value=$ELAPSED"
            
            ((i++))
        ) &
    done
done
