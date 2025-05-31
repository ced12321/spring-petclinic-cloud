#!/bin/bash

set -e  # Beendet das Skript bei Fehlern
set -o pipefail

# 1. Setze REPOSITORY_PREFIX
export REPOSITORY_PREFIX=cedricmaubach
echo "REPOSITORY_PREFIX auf '$REPOSITORY_PREFIX' gesetzt."

# 2. Erstelle Container-Images
echo "Erstelle Container-Images mit Maven..."
./mvnw spring-boot:build-image -Pk8s -DREPOSITORY_PREFIX=${REPOSITORY_PREFIX}
echo "Build abgeschlossen."
sleep 2

# 3. Push Images
echo "Pushe Images..."
./scripts/pushImages.sh
sleep 2

# 4. Apply Namespace und Services
echo "Initialisiere Kubernetes-Namespace und -Services..."
kubectl apply -f k8s/init-namespace/
sleep 2
kubectl apply -f k8s/init-services
sleep 2

# 5. Helm Repo hinzufügen und aktualisieren
echo "Füge Bitnami Helm-Repo hinzu und aktualisiere es..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
sleep 2

# 6. Installiere MySQL-Datenbanken per Helm
echo "Installiere MySQL-Datenbanken über Helm..."

helm install vets-db-mysql bitnami/mysql \
  --namespace spring-petclinic \
  --version 9.14.3 \
  --set auth.database=service_instance_db
sleep 2

helm install visits-db-mysql bitnami/mysql \
  --namespace spring-petclinic \
  --version 9.14.3 \
  --set auth.database=service_instance_db
sleep 2

helm install customers-db-mysql bitnami/mysql \
  --namespace spring-petclinic \
  --version 9.14.3 \
  --set auth.database=service_instance_db
sleep 2

helm install rooms-db-mysql bitnami/mysql \
  --namespace spring-petclinic \
  --version 9.14.3 \
  --set auth.database=service_instance_db
sleep 2

# 7. Deployment der Microservices
echo "Deploye Microservices auf Kubernetes..."
./scripts/deployToKubernetes.sh
sleep 2

echo "✅ Build & Deployment abgeschlossen."
