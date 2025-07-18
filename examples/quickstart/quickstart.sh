#!/bin/bash
set -e

echo "🚀 FedMCP Quick Start Demo"
echo "========================="
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Start the services
echo "📦 Starting FedMCP server..."
docker-compose up -d

# Wait for server to be healthy
echo "⏳ Waiting for server to be ready..."
sleep 5

# Check health
echo "🔍 Checking server health..."
curl -s http://localhost:8000/health | jq '.' || echo "Server health check failed"

# Create a test artifact
echo
echo "📝 Creating a test artifact..."
cat > test_artifact.json <<EOF
{
  "type": "agent_recipe",
  "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
  "jsonBody": {
    "name": "Healthcare Diagnostic Agent",
    "version": "1.0.0",
    "description": "An AI agent for healthcare diagnostics",
    "capabilities": [
      "symptom_analysis",
      "diagnosis_suggestion",
      "treatment_recommendation"
    ],
    "compliance": ["HIPAA", "FedRAMP-High"],
    "model": "gpt-4"
  }
}
EOF

# Send artifact to server
echo "📤 Sending artifact to server..."
RESPONSE=$(curl -s -X POST http://localhost:8000/artifacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token-12345678" \
  -d "{\"artifact\": $(cat test_artifact.json), \"sign\": true}")

echo "Response:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"

# Extract artifact ID
ARTIFACT_ID=$(echo "$RESPONSE" | jq -r '.artifact_id' 2>/dev/null || echo "")

if [ -n "$ARTIFACT_ID" ] && [ "$ARTIFACT_ID" != "null" ]; then
    echo
    echo "✅ Artifact created with ID: $ARTIFACT_ID"
    
    # Retrieve the artifact
    echo
    echo "📥 Retrieving artifact..."
    curl -s -X GET "http://localhost:8000/artifacts/$ARTIFACT_ID" \
      -H "Authorization: Bearer demo-token-12345678" | jq '.'
    
    # Get audit events
    echo
    echo "📊 Checking audit trail..."
    curl -s -X GET "http://localhost:8000/audit/events?artifact_id=$ARTIFACT_ID" | jq '.'
else
    echo "❌ Failed to create artifact"
fi

echo
echo "🎉 Quick start complete!"
echo
echo "Server is running at: http://localhost:8000"
echo "API documentation: http://localhost:8000/docs"
echo
echo "To stop the server, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"