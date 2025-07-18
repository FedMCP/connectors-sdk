"""
Example REST API Connector for FedMCP
Shows how to build a connector for external REST APIs
"""

import aiohttp
from typing import Dict, Any, Optional
from fedmcp_connector import BaseConnector, ConnectorConfig, RetryHandler


class RestApiConnector(BaseConnector):
    """
    Generic REST API connector with authentication and retry logic
    
    This example shows how to:
    - Make authenticated API calls
    - Handle rate limiting
    - Retry on failures
    - Transform API responses into FedMCP artifacts
    """
    
    def __init__(self, config: ConnectorConfig):
        # API-specific config
        self.api_base_url = config.get("api_base_url", "https://api.example.com")
        self.api_key = config.get("api_key")
        self.timeout = config.get("timeout", 30)
        
        # Initialize retry handler
        self.retry_handler = RetryHandler(
            max_retries=config.get("max_retries", 3),
            backoff_factor=config.get("backoff_factor", 2.0)
        )
        
        super().__init__(config)
    
    def _initialize(self):
        """Initialize HTTP session"""
        self.session = None
        self._headers = {
            "User-Agent": f"FedMCP-Connector/{self.connector_name}",
            "Accept": "application/json"
        }
        
        # Add API key if provided
        if self.api_key:
            self._headers["Authorization"] = f"Bearer {self.api_key}"
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession(
                headers=self._headers,
                timeout=aiohttp.ClientTimeout(total=self.timeout)
            )
        return self.session
    
    async def fetch_data(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetch data from REST API
        
        Args:
            query: Should contain:
                - endpoint: API endpoint path
                - method: HTTP method (GET, POST, etc.)
                - params: Query parameters (optional)
                - data: Request body (optional)
        """
        endpoint = query.get("endpoint", "/")
        method = query.get("method", "GET").upper()
        params = query.get("params", {})
        data = query.get("data")
        
        # Check cache first
        cache_key = f"{method}:{endpoint}:{str(params)}"
        cached = self.get_cache(cache_key)
        if cached:
            self.audit.log_access(
                resource=endpoint,
                action="fetch_cached",
                success=True
            )
            return cached["value"]
        
        # Make API call with retry
        try:
            response_data = await self.retry_handler.retry_async(
                self._make_request,
                method=method,
                endpoint=endpoint,
                params=params,
                data=data
            )
            
            # Cache successful responses
            self.set_cache(cache_key, response_data, ttl=300)  # 5 min cache
            
            # Log successful access
            self.audit.log_access(
                resource=endpoint,
                action="fetch_data",
                success=True,
                metadata={
                    "method": method,
                    "records": len(response_data) if isinstance(response_data, list) else 1
                }
            )
            
            return response_data
            
        except Exception as e:
            # Log failed access
            self.audit.log_access(
                resource=endpoint,
                action="fetch_data",
                success=False,
                metadata={"error": str(e)}
            )
            raise
    
    async def _make_request(self, method: str, endpoint: str, 
                          params: Optional[Dict] = None, 
                          data: Optional[Any] = None) -> Dict[str, Any]:
        """Make HTTP request to API"""
        session = await self._get_session()
        url = f"{self.api_base_url}{endpoint}"
        
        async with session.request(
            method=method,
            url=url,
            params=params,
            json=data if method in ["POST", "PUT", "PATCH"] else None
        ) as response:
            response.raise_for_status()
            return await response.json()
    
    def _check_connection(self) -> bool:
        """Check API connectivity"""
        # In a real implementation, make a lightweight API call
        # For now, just check if we have required config
        return bool(self.api_base_url and (self.api_key or True))
    
    def get_version(self) -> str:
        """Return connector version"""
        return "1.0.0"
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None


# Example usage
async def main():
    """Example of using the REST API connector"""
    
    # Configure connector
    config = ConnectorConfig(
        workspace_id="example-workspace",
        connector_name="example-api",
        api_endpoint="https://jsonplaceholder.typicode.com",
        extra_config={
            "api_base_url": "https://jsonplaceholder.typicode.com"
        }
    )
    
    # Create connector
    async with RestApiConnector(config) as connector:
        # Fetch data
        data = await connector.fetch_data({
            "endpoint": "/users/1",
            "method": "GET"
        })
        
        # Create FedMCP artifact
        artifact = await connector.create_artifact(
            artifact_type="user-data",
            data=data,
            metadata={
                "source": "JSONPlaceholder API",
                "classification": "UNCLASSIFIED"
            }
        )
        
        print(f"Created artifact: {artifact['id']}")
        print(f"Data: {artifact['jsonBody']}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())