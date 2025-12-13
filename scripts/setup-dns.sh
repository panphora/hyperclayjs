#!/bin/bash
set -e

CF_EMAIL=$(op item get "Cloudflare Global API" --fields label=username --reveal)
CF_KEY=$(op item get "Cloudflare Global API" --fields label=credential --reveal)
ZONE_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=hyperclayjs.com" \
  -H "X-Auth-Email: $CF_EMAIL" -H "X-Auth-Key: $CF_KEY" | jq -r '.result[0].id')

echo "Adding @ record..."
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "X-Auth-Email: $CF_EMAIL" -H "X-Auth-Key: $CF_KEY" -H "Content-Type: application/json" \
  --data '{"type":"AAAA","name":"@","content":"100::","proxied":true}' | jq -r 'if .success then "✓ root record added" else "✗ \(.errors[0].message)" end'

echo "Adding www record..."
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "X-Auth-Email: $CF_EMAIL" -H "X-Auth-Key: $CF_KEY" -H "Content-Type: application/json" \
  --data '{"type":"AAAA","name":"www","content":"100::","proxied":true}' | jq -r 'if .success then "✓ www record added" else "✗ \(.errors[0].message)" end'
