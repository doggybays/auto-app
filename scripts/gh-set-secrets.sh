#!/usr/bin/env bash
REPO="$1"
if [ -z "$REPO" ]; then echo "Usage: $0 owner/repo"; exit 1; fi
read -p "Enter base64-encoded GCLOUD_SA_KEY (paste): " GCLOUD_SA_KEY
gh secret set GCLOUD_SA_KEY --body "$GCLOUD_SA_KEY" --repo "$REPO"
read -p "GCP_PROJECT: " GCP_PROJECT; gh secret set GCP_PROJECT --body "$GCP_PROJECT" --repo "$REPO"
read -p "GCP_REGION: " GCP_REGION; gh secret set GCP_REGION --body "$GCP_REGION" --repo "$REPO"
read -p "OPENAI_API_KEY: " OPENAI_API_KEY; gh secret set OPENAI_API_KEY --body "$OPENAI_API_KEY" --repo "$REPO"
echo "Done"
