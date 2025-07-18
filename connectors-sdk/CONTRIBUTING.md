# Contributing to FedMCP Connector SDK

Thank you for your interest in contributing to the FedMCP Connector SDK! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Issues

- Check if the issue already exists in our [issue tracker](https://github.com/FedMCP/connectors/issues)
- Provide a clear description of the problem
- Include steps to reproduce the issue
- Share relevant logs or error messages
- Specify your environment (OS, Python version, etc.)

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Write clear code** that follows our style guidelines
3. **Add tests** for any new functionality
4. **Update documentation** as needed
5. **Write a clear PR description** explaining your changes

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/connectors.git
cd connectors

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-dev.txt

# Run tests
pytest
```

## Connector Development Guidelines

### Creating a New Example Connector

1. Create a new directory under `examples/`:
   ```
   examples/my_connector/
   ├── connector.py
   ├── requirements.txt
   ├── README.md
   └── tests/
       └── test_connector.py
   ```

2. Inherit from `BaseConnector`:
   ```python
   from fedmcp_connector import BaseConnector
   
   class MyConnector(BaseConnector):
       # Implementation
   ```

3. Implement required methods:
   - `_initialize()`
   - `fetch_data()`
   - `_check_connection()`
   - `get_version()`

4. Add comprehensive documentation
5. Include unit tests

### Code Style

- Follow PEP 8 guidelines
- Use type hints where appropriate
- Add docstrings to all public methods
- Keep functions focused and small
- Use meaningful variable names

### Testing

- Write unit tests for all new code
- Aim for >80% test coverage
- Use pytest for testing
- Mock external dependencies
- Test error cases

### Documentation

- Update README.md if adding new features
- Add docstrings following Google style
- Include usage examples
- Document configuration options
- Add to API reference if applicable

## Connector Best Practices

### Security

- Never log sensitive data (passwords, API keys, PII)
- Validate all inputs
- Use environment variables for secrets
- Implement proper access controls
- Follow principle of least privilege

### Performance

- Implement caching where appropriate
- Use connection pooling
- Handle rate limits gracefully
- Support batch operations
- Minimize API calls

### Reliability

- Add retry logic for transient failures
- Implement proper error handling
- Provide meaningful error messages
- Add health check endpoints
- Log important events

### Compliance

- Log all data access
- Include audit metadata
- Support data retention policies
- Enable PII/PHI detection where needed
- Document compliance features

## Review Process

1. All submissions require review before merging
2. CI/CD checks must pass
3. At least one maintainer approval required
4. Address all review feedback
5. Keep PR scope focused

## Community

- Join our [Slack channel](https://fedmcp.slack.com)
- Attend community meetings (monthly)
- Share your connectors and use cases
- Help others in discussions

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.

## Questions?

Feel free to reach out:
- GitHub Issues for bugs/features
- Slack for discussions
- Email: community@fedmcp.org

Thank you for helping make FedMCP better!