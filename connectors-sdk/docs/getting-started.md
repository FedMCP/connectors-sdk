# Getting Started with FedMCP Connector SDK

## Prerequisites

- Python 3.8 or higher
- pip package manager
- Basic understanding of REST APIs
- Familiarity with FedMCP concepts

## Installation

### Install the SDK

```bash
pip install fmcpx
```

### Verify Installation

```bash
fmcpx version
```

You should see:
```
FedMCP Connector SDK (fmcpx)
Version: 1.0.0
License: Apache 2.0
```

## Create Your First Connector

### 1. Generate a Connector

```bash
fmcpx create my-first-connector
```

This creates a new directory with:
```
my-first-connector/
├── connector.py          # Main connector code
├── requirements.txt      # Python dependencies
├── Dockerfile           # Container configuration
├── tool.schema.json     # Connector metadata
├── README.md            # Documentation
└── .env.example         # Environment variables
```

### 2. Install Dependencies

```bash
cd my-first-connector
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run the Connector

```bash
python connector.py
```

Visit http://localhost:8000/docs to see your API.

## Understanding the Code

### connector.py

The main file contains:

1. **Health Check Endpoint**
   ```python
   @app.get("/")
   async def health_check():
       return {"status": "healthy"}
   ```

2. **Data Endpoint**
   ```python
   @app.post("/data")
   async def get_data(request: DataRequest):
       # Your logic here
       return DataResponse(data=data, _metadata=metadata)
   ```

3. **Audit Logging**
   ```python
   audit_log(
       action="retrieve_data",
       resource="query:example",
       success=True
   )
   ```

### tool.schema.json

Defines your connector's:
- Input/output schemas
- Compliance settings
- Capabilities

## Next Steps

1. **Modify the connector** to connect to your data source
2. **Add authentication** if required
3. **Implement error handling**
4. **Write tests** for your logic
5. **Deploy** using Docker or Kubernetes

## Common Patterns

### Adding Authentication

```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends

security = HTTPBearer()

@app.post("/data")
async def get_data(
    request: DataRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Validate token
    if not is_valid_token(credentials.credentials):
        raise HTTPException(status_code=401)
```

### Connecting to Databases

```python
import asyncpg

async def get_db_connection():
    return await asyncpg.connect(
        host="localhost",
        database="mydb",
        user="user",
        password="password"
    )
```

### Making API Calls

```python
import httpx

async def fetch_external_data(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.example.com/data",
            params={"q": query}
        )
        return response.json()
```

## Getting Help

- **Documentation**: https://docs.fedmcp.org
- **Examples**: See the `examples/` directory
- **Community**: Join us on Slack
- **Issues**: GitHub Issues

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
PORT=8001 python connector.py
```

### Missing Dependencies

```bash
# Reinstall requirements
pip install -r requirements.txt --upgrade
```

### Permission Errors

```bash
# Run with proper permissions
sudo python connector.py  # Not recommended
# Better: Configure proper user permissions
```