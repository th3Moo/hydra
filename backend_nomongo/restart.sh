#!/bin/bash
taskkill //F //IM node.exe 2>/dev/null || true
node server.js
