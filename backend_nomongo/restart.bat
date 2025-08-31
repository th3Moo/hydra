@echo off && taskkill /F /IM node.exe >nul 2>&1 && cd /d %~dp0 && node server.js
