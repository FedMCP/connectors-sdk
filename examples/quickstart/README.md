# FedMCP Quick Start

This directory contains quick start examples to get you up and running with FedMCP.

## Prerequisites

- Docker and docker-compose
- Python 3.8+ (for Python examples)
- curl and jq (for shell scripts)

## Quick Start Options

### 1. Docker Compose (Recommended)

Start a local FedMCP server:

```bash
# Start the server
docker-compose up -d

# Check that it's running
curl http://localhost:8000/health

# View API documentation
open http://localhost:8000/docs
```

### 2. Shell Script Demo

Run the automated demo:

```bash
./quickstart.sh
```

This script will:
- Start the FedMCP server
- Create a test artifact
- Sign and store it
- Retrieve it back
- Show the audit trail

### 3. Python Example

Run the Python demonstration:

```bash
# Install dependencies (optional, uses local imports)
pip install -r ../../core/python/requirements.txt

# Run the example
./quickstart.py
```

This demonstrates:
- Creating artifacts programmatically
- Local signing with ECDSA P-256
- Signature verification
- Tampering detection

## What's Included

- `docker-compose.yml` - Docker Compose configuration
- `quickstart.sh` - Shell script demonstration
- `quickstart.py` - Python code example
- `test_artifact.json` - Sample artifact (created by quickstart.sh)

## Server Endpoints

Once running, the server provides:

- `GET /health` - Health check
- `POST /artifacts` - Create and sign artifacts
- `GET /artifacts/{id}` - Retrieve artifacts
- `POST /artifacts/verify` - Verify signatures
- `GET /audit/events` - Query audit trail
- `GET /jwks` - Get public keys

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs for interactive API documentation

2. **Create Custom Artifacts**: Modify the examples to create your own artifact types

3. **Integrate with Your Platform**: Use the client libraries to integrate FedMCP into your AI/ML platform

4. **Deploy to Production**: See the deployment guide for AWS GovCloud setup

## Cleanup

To stop and remove all containers:

```bash
docker-compose down -v
```

## Troubleshooting

If the server doesn't start:
- Check Docker is running: `docker ps`
- View logs: `docker-compose logs fedmcp`
- Ensure port 8000 is free: `lsof -i :8000`

For more help, see the main documentation or file an issue on GitHub.