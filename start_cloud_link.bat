@echo off
title CloudPack - Cloud Edge Public Tunnel
echo ====================================================================
echo  STARTING CLOUD EDGE PUBLIC HTTPS TUNNEL (Cloudflare Global Edge)
echo ====================================================================
echo.
echo Connecting CloudPack server on port 8090 to Cloudflare Anycast CDN...
echo.
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8090 --no-autoupdate
pause
