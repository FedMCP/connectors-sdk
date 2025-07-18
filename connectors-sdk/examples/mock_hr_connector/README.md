# Mock HR Connector Example

> 🎭 **This is an EXAMPLE connector using MOCK DATA** - It does not connect to any real HR system

## Overview

This example demonstrates how to build a FedMCP connector for HR systems. It shows best practices for:

- 📋 Data modeling with Pydantic
- 🔐 Input validation and error handling
- 📝 Audit logging for compliance
- 🏷️ Adding FedMCP metadata
- 🚀 FastAPI integration
- 🧪 Using mock data for testing

## Quick Start

### 1. Install Dependencies

```bash
pip install fastapi uvicorn pydantic
```

### 2. Run the Connector

```bash
# Start the connector
python connector.py

# Or use uvicorn with auto-reload
uvicorn connector:app --reload --port 8000
```

### 3. Test the Endpoints

```bash
# Check health
curl http://localhost:8000/

# Get an employee (mock data)
curl -X POST http://localhost:8000/employee \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "12345"}'

# Get department roster
curl -X POST http://localhost:8000/department \
  -H "Content-Type: application/json" \
  -d '{"department_name": "Information Technology"}'

# List all employees
curl http://localhost:8000/employees
```

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.

## Available Mock Data

The connector includes sample employees for testing:

| Employee ID | Name | Department | Title |
|------------|------|------------|-------|
| 12345 | Alice Johnson | Information Technology | Senior Developer |
| 67890 | Bob Smith | Information Technology | IT Director |
| 54321 | Carol Davis | Human Resources | HR Specialist |

## Key Features Demonstrated

### 1. FedMCP Metadata

Every response includes compliance metadata:

```json
{
  "employee_id": "12345",
  "first_name": "Alice",
  "_metadata": {
    "artifact_type": "employee-record",
    "created_at": "2024-01-15T10:30:00Z",
    "connector": "mock-hr-connector",
    "version": "1.0.0",
    "classification": "EXAMPLE_DATA",
    "retention_days": 7,
    "data_hash": "a1b2c3d4"
  }
}
```

### 2. Audit Logging

All data access is logged for compliance:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "action": "retrieve_employee",
  "resource": "employee/12345",
  "user": "system",
  "success": true,
  "details": {"department": "Information Technology"}
}
```

### 3. Error Handling

Proper HTTP status codes and error messages:

```json
{
  "detail": "Employee 99999 not found"
}
```

## Building a Real HR Connector

To create a production HR connector:

### 1. Replace Mock Data

```python
# Instead of mock data
employee_data = MOCK_EMPLOYEES.get(employee_id)

# Use real API
employee_data = await workday_client.get_employee(employee_id)
```

### 2. Add Authentication

```python
# Add OAuth2 or API key auth
security = HTTPBearer()

@app.post("/employee")
async def get_employee(
    request: EmployeeRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    # Validate credentials
    if not validate_token(credentials.credentials):
        raise HTTPException(status_code=401)
```

### 3. Implement Caching

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
async def get_employee_cached(employee_id: str):
    return await hr_system.get_employee(employee_id)
```

### 4. Add Rate Limiting

```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/employee")
@limiter.limit("100/minute")
async def get_employee(request: Request):
    # Handle request
```

### 5. Include Monitoring

```python
from prometheus_client import Counter, Histogram

request_count = Counter('hr_requests_total', 'Total HR API requests')
request_duration = Histogram('hr_request_duration_seconds', 'HR API request duration')
```

## Common HR Systems

When building real connectors, you might integrate with:

- **Workday** - REST API with OAuth2
- **SAP SuccessFactors** - OData API
- **Oracle HCM Cloud** - REST API
- **ADP** - REST API with certificates
- **BambooHR** - REST API with API keys

## Security Considerations

- 🔐 Never store employee data locally
- 🔑 Use secure credential storage (AWS Secrets Manager, etc.)
- 🛡️ Implement row-level security
- 📝 Log all access for compliance
- 🔒 Encrypt data in transit and at rest
- 👤 Implement proper authentication/authorization

## Need a Production HR Connector?

For production-ready HR connectors with:
- Real API integrations
- Enterprise authentication
- Advanced caching
- Full compliance features
- Professional support

Contact **Peregrine Tec LLC** at [www.peregrinetec.com](https://www.peregrinetec.com)

---

**Note**: This is an example for learning purposes. Always follow your organization's security and compliance policies when building production connectors.