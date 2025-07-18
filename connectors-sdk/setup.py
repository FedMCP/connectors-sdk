"""
Setup configuration for FedMCP Connector SDK
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="fedmcp-connector-sdk",
    version="1.0.0",
    author="FedMCP Community",
    author_email="community@fedmcp.org",
    description="Open source framework for building FedMCP-compliant connectors",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/FedMCP/connectors",
    project_urls={
        "Bug Tracker": "https://github.com/FedMCP/connectors/issues",
        "Documentation": "https://docs.fedmcp.org/connector-sdk",
        "Source Code": "https://github.com/FedMCP/connectors",
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "fedmcp>=0.1.0",
        "aiohttp>=3.8.0",
        "aiofiles>=0.8.0",
        "pydantic>=2.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.18.0",
            "pytest-cov>=3.0.0",
            "black>=22.0.0",
            "isort>=5.10.0",
            "mypy>=0.950",
        ],
    },
    entry_points={
        "console_scripts": [
            "fmcpx=fmcpx:main",
        ],
    },
)