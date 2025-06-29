#!/bin/bash

set -e  # Beendet das Skript bei Fehlern
set -o pipefail

# 1. Setze REPOSITORY_PREFIX
export REPOSITORY_PREFIX=cedricmaubach
echo "REPOSITORY_PREFIX auf '$REPOSITORY_PREFIX' gesetzt."

echo "installing maven dependencies..."
./mvnw clean install -DskipTests
sleep 2

echo "packaging mit Maven..."
./mvnw package -Pk8s
sleep 2

# 2. Erstelle Container-Images
echo "Erstelle Container-Images mit Maven..."
./mvnw spring-boot:build-image -Pk8s -DREPOSITORY_PREFIX=${REPOSITORY_PREFIX} -DIMAGE_TAG=1.0.0
echo "Build abgeschlossen."
sleep 2

# 3. Push Images
echo "Pushe Images..."
./scripts/pushImages.sh
sleep 2



./scripts/deploy.sh


echo "✅ Build & Deployment abgeschlossen."
