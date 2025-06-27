#!/bin/bash

export REPOSITORY_PREFIX=cedricmaubach
echo "REPOSITORY_PREFIX auf '$REPOSITORY_PREFIX' gesetzt."

kubectl delete namespace spring-petclinic --ignore-not-found
kubectl delete namespace monitoring --ignore-not-found

# 4. Apply Namespace und Services
echo "Initialisiere Kubernetes-Namespace und -Services..."
kubectl apply -f k8s/init-namespace/
sleep 2
kubectl apply -f k8s/init-services/
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
