#!/bin/bash

# Script para iniciar el servidor de desarrollo en el puerto 3000
# Libera el puerto si está ocupado y luego inicia el servidor

echo "🚀 Iniciando AulaLens en puerto 3000..."

# Verificar si el puerto 3000 está ocupado
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 3000 ocupado. Liberando..."
    # Matar procesos que usen el puerto 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Matar cualquier proceso nuxt dev anterior
pkill -f "nuxt dev" 2>/dev/null || true
sleep 1

# Iniciar el servidor
echo "✅ Puerto 3000 libre. Iniciando servidor..."
NODE_OPTIONS='--no-deprecation' pnpm exec nuxt dev --port 3000 --host localhost
