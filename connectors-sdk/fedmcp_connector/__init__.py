"""
FedMCP Connector SDK
Open source framework for building FedMCP-compliant connectors
"""

from .base import (
    BaseConnector,
    ConnectorConfig,
    AuditLogger,
    RateLimiter,
    RetryHandler
)

__all__ = [
    'BaseConnector',
    'ConnectorConfig',
    'AuditLogger',
    'RateLimiter',
    'RetryHandler'
]

__version__ = '1.0.0'
__author__ = 'FedMCP Community'
__license__ = 'Apache 2.0'