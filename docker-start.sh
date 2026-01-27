#!/bin/bash

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOL
PORT=3000
NODE_ENV=development

SUPABASE_URL=https://prohurjfwpmvalbcjyrv.supabase.co/
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2h1cmpmd3BtdmFsYmNqeXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTE3MjEsImV4cCI6MjA3NTU2NzcyMX0.sXTgHh3TJpLj1nyzleRM3S4z7A_3RdA10v05S1Zep6g

BCRYPT_ROUNDS=10

SSL_KEY_PATH=./ssl/localhost.key
SSL_CERT_PATH=./ssl/localhost.crt
EOL
    echo "✓ backend/.env created"
else
    echo "✓ backend/.env already exists"
fi

# Build and start containers
echo "Building Docker containers..."
docker compose build

echo "Starting containers..."
docker compose up