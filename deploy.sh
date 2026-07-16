#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="matchday-ai-502517"
REGION="us-central1"
SERVICE_NAME="matchday-ai"
VPC_NAME="matchday-vpc"
SUBNET_NAME="vpc-connector-subnet"
CONNECTOR_NAME="matchday-vpc-connector"
REDIS_NAME="matchday-redis"
FIRESTORE_LOCATION="nam5"
SECRET_GEMINI="GEMINI_API_KEY"
SECRET_MAPS="MAPS_API_KEY"

echo "=========================================="
echo "Matchday AI - GCP Deployment Script"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "=========================================="

echo ""
echo "[1/8] Setting GCP project..."
gcloud config set project "$PROJECT_ID"

echo ""
echo "[2/8] Enabling required APIs..."
gcloud services enable \
  compute.googleapis.com \
  vpcaccess.googleapis.com \
  firestore.googleapis.com \
  redis.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  translate.googleapis.com \
  --quiet

echo ""
echo "[3/8] Creating VPC network..."
if ! gcloud compute networks describe "$VPC_NAME" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud compute networks create "$VPC_NAME" \
    --subnet-mode=custom \
    --bgp-routing-mode=regional \
    --mtu=1460
  echo "VPC '$VPC_NAME' created."
else
  echo "VPC '$VPC_NAME' already exists."
fi

echo ""
echo "[4/8] Creating VPC connector subnet..."
if ! gcloud compute networks subnets describe "$SUBNET_NAME" --region="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud compute networks subnets create "$SUBNET_NAME" \
    --network="$VPC_NAME" \
    --region="$REGION" \
    --range=10.8.0.0/28
  echo "Subnet '$SUBNET_NAME' created."
else
  echo "Subnet '$SUBNET_NAME' already exists."
fi

echo ""
echo "[5/8] Creating Serverless VPC Access connector..."
if ! gcloud compute networks vpc-access connectors describe "$CONNECTOR_NAME" --region="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud compute networks vpc-access connectors create "$CONNECTOR_NAME" \
    --region="$REGION" \
    --network="$VPC_NAME" \
    --subnet-project="$PROJECT_ID" \
    --subnet="$SUBNET_NAME" \
    --machine-type=e2-micro \
    --min-instances=2 \
    --max-instances=10
  echo "VPC connector '$CONNECTOR_NAME' created (may take a few minutes)."
else
  echo "VPC connector '$CONNECTOR_NAME' already exists."
fi

echo ""
echo "[6/8] Provisioning Firestore (Native Mode)..."
if ! gcloud firestore databases describe --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud firestore databases create \
    --location="$FIRESTORE_LOCATION" \
    --type=firestore-native \
    --project="$PROJECT_ID"
  echo "Firestore Native database created."
else
  echo "Firestore database already exists."
fi

echo ""
echo "[7/8] Provisioning Memorystore Redis..."
if ! gcloud redis instances describe "$REDIS_NAME" --region="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud redis instances create "$REDIS_NAME" \
    --size=1 \
    --region="$REGION" \
    --zone="$REGION-a" \
    --network="$VPC_NAME" \
    --connect-mode=private-service-access \
    --tier=basic
  echo "Memorystore Redis instance '$REDIS_NAME' created (may take several minutes)."
else
  echo "Memorystore Redis instance '$REDIS_NAME' already exists."
fi

REDIS_HOST=$(gcloud redis instances describe "$REDIS_NAME" --region="$REGION" --format="get(host)")
REDIS_PORT=$(gcloud redis instances describe "$REDIS_NAME" --region="$REGION" --format="get(port)")

echo "Redis endpoint: $REDIS_HOST:$REDIS_PORT"

echo ""
echo "[8/8] Deploying to Cloud Run..."
gcloud builds submit \
  --tag "gcr.io/$PROJECT_ID/$SERVICE_NAME" \
  --project="$PROJECT_ID"

gcloud run deploy "$SERVICE_NAME" \
  --image="gcr.io/$PROJECT_ID/$SERVICE_NAME" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --timeout=300 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="REDIS_HOST=$REDIS_HOST,REDIS_PORT=$REDIS_PORT" \
  --set-secrets="GEMINI_API_KEY=$SECRET_GEMINI:latest,MAPS_API_KEY=$SECRET_MAPS:latest" \
  --vpc-connector="$CONNECTOR_NAME" \
  --vpc-egress=private-ranges-only \
  --project="$PROJECT_ID"

echo ""
echo "=========================================="
echo "Deployment complete!"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="get(status.url)" --project="$PROJECT_ID" 2>/dev/null || echo "N/A")
echo "Service URL: $SERVICE_URL"
echo "=========================================="

echo ""
echo "=== Next Steps ==="
echo "1. Seed Firestore with stadium data:"
echo "   gcloud firestore import gs://matchday-ai-data/stadiums.overall"
echo ""
echo "2. Store secrets if not already set:"
echo "   echo -n 'your-gemini-api-key' | gcloud secrets create $SECRET_GEMINI --data-file=-"
echo "   echo -n 'your-maps-api-key' | gcloud secrets create $SECRET_MAPS --data-file=-"
echo ""
echo "3. Monitor logs:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50"
