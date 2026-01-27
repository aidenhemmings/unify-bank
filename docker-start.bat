@echo off
echo Checking backend .env file...

if not exist backend\.env (
    echo Creating backend/.env file...
    (
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo SUPABASE_URL=https://prohurjfwpmvalbcjyrv.supabase.co/
        echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2h1cmpmd3BtdmFsYmNqeXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5OTE3MjEsImV4cCI6MjA3NTU2NzcyMX0.sXTgHh3TJpLj1nyzleRM3S4z7A_3RdA10v05S1Zep6g
        echo.
        echo BCRYPT_ROUNDS=10
        echo.
        echo SSL_KEY_PATH=./ssl/localhost.key
        echo SSL_CERT_PATH=./ssl/localhost.crt
    ) > backend\.env
    echo ✓ backend/.env created
) else (
    echo ✓ backend/.env already exists
)

echo Building Docker containers...
docker compose build

echo Starting containers...
docker compose up