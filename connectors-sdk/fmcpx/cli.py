"""
CLI tool for FedMCP Connector SDK
"""

import click
import os
import shutil
from pathlib import Path


@click.group()
def cli():
    """FedMCP Connector SDK CLI - Create and manage FedMCP connectors"""
    pass


@cli.command()
@click.argument('name')
@click.option('--template', '-t', default='basic', 
              type=click.Choice(['basic', 'rest-api', 'database', 'filesystem']),
              help='Connector template to use')
@click.option('--output-dir', '-o', default='.', 
              help='Output directory for the connector')
def create(name, template, output_dir):
    """Create a new FedMCP connector from a template"""
    
    # Validate name
    if not name.replace('-', '').replace('_', '').isalnum():
        click.echo("Error: Connector name must be alphanumeric (hyphens and underscores allowed)")
        return
    
    # Create output directory
    output_path = Path(output_dir) / name
    if output_path.exists():
        click.echo(f"Error: Directory {output_path} already exists")
        return
    
    # Get template path
    template_path = Path(__file__).parent / 'templates' / template
    if not template_path.exists():
        click.echo(f"Error: Template '{template}' not found")
        return
    
    # Copy template
    shutil.copytree(template_path, output_path)
    
    # Update files with connector name
    for file_path in output_path.rglob('*'):
        if file_path.is_file() and file_path.suffix in ['.py', '.json', '.md', '.txt']:
            try:
                content = file_path.read_text()
                content = content.replace('{{CONNECTOR_NAME}}', name)
                content = content.replace('{{CONNECTOR_CLASS}}', name.replace('-', '_').title())
                file_path.write_text(content)
            except Exception:
                pass  # Skip binary files
    
    click.echo(f"✅ Created connector '{name}' in {output_path}")
    click.echo("\nNext steps:")
    click.echo(f"1. cd {output_path}")
    click.echo("2. pip install -r requirements.txt")
    click.echo("3. Edit connector.py to implement your logic")
    click.echo("4. Run tests with: pytest")


@cli.command()
@click.argument('connector_path')
def validate(connector_path):
    """Validate a connector meets FedMCP requirements"""
    path = Path(connector_path)
    
    if not path.exists():
        click.echo(f"Error: Path {path} does not exist")
        return
    
    # Check required files
    required_files = ['connector.py', 'requirements.txt', 'tool.schema.json']
    missing_files = []
    
    for file_name in required_files:
        if not (path / file_name).exists():
            missing_files.append(file_name)
    
    if missing_files:
        click.echo("❌ Missing required files:")
        for file_name in missing_files:
            click.echo(f"   - {file_name}")
        return
    
    # Check connector.py structure
    connector_file = path / 'connector.py'
    content = connector_file.read_text()
    
    checks = {
        'Imports BaseConnector': 'from fedmcp_connector import BaseConnector' in content,
        'Implements fetch_data': 'def fetch_data' in content or 'async def fetch_data' in content,
        'Implements get_version': 'def get_version' in content,
        'Has initialization': 'def _initialize' in content,
    }
    
    failed_checks = [check for check, passed in checks.items() if not passed]
    
    if failed_checks:
        click.echo("❌ Failed validation checks:")
        for check in failed_checks:
            click.echo(f"   - {check}")
    else:
        click.echo("✅ Connector validation passed!")


@cli.command()
def list_templates():
    """List available connector templates"""
    templates_dir = Path(__file__).parent / 'templates'
    
    click.echo("Available connector templates:")
    click.echo("")
    
    templates = {
        'basic': 'Basic connector with minimal structure',
        'rest-api': 'REST API connector with authentication and retry logic',
        'database': 'Database connector with connection pooling',
        'filesystem': 'File system connector with access controls'
    }
    
    for template_name, description in templates.items():
        click.echo(f"  {template_name:<12} - {description}")
    
    click.echo("")
    click.echo("Use: fmcpx create <name> --template <template-name>")


def main():
    """Main entry point for CLI"""
    cli()


if __name__ == '__main__':
    main()