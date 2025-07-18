"""fmcpx CLI - FedMCP Connector SDK Command Line Tool"""
from __future__ import annotations

import json
import pathlib
import shutil
import sys
from typing import Final, Optional

import typer
from typer import colors

# ─────────────────────────────────────────────
# CLI Application
# ─────────────────────────────────────────────
app = typer.Typer(
    help="FedMCP Connector SDK - Build compliant connectors for government systems",
    context_settings={"help_option_names": ["-h", "--help"]},
    add_completion=False,
)

# Template directory paths
TEMPLATES_DIR: Final[pathlib.Path] = pathlib.Path(__file__).parent / "templates"
AVAILABLE_TEMPLATES = ["basic", "rest-api", "database", "filesystem"]


@app.command("create", help="Create a new FedMCP connector from a template")
def create_connector(
    name: str = typer.Argument(..., help="Name of your connector"),
    template: str = typer.Option(
        "basic",
        "--template", "-t",
        help="Template to use",
        callback=lambda x: x if x in AVAILABLE_TEMPLATES else None
    ),
    output_dir: Optional[str] = typer.Option(
        None,
        "--output", "-o",
        help="Output directory (default: current directory)"
    ),
):
    """Create a new FedMCP connector from a template"""
    
    # Validate template
    if template not in AVAILABLE_TEMPLATES:
        typer.secho(
            f"❌ Unknown template '{template}'. Available: {', '.join(AVAILABLE_TEMPLATES)}",
            fg=colors.RED
        )
        raise typer.Exit(1)
    
    # Determine output path
    base_dir = pathlib.Path(output_dir) if output_dir else pathlib.Path.cwd()
    dst = base_dir / name
    
    # Check if directory exists
    if dst.exists():
        typer.secho(f"❌ Directory '{dst}' already exists", fg=colors.RED)
        raise typer.Exit(1)
    
    # Copy template
    template_path = TEMPLATES_DIR / template
    if not template_path.exists():
        # Fall back to basic template if specific one doesn't exist yet
        template_path = TEMPLATES_DIR / "basic"
    
    try:
        shutil.copytree(template_path, dst)
        
        # Replace placeholders in files
        for file_path in dst.rglob("*"):
            if file_path.is_file() and file_path.suffix in [".py", ".json", ".md", ".txt", ".yml", ".yaml"]:
                try:
                    content = file_path.read_text()
                    content = content.replace("{{CONNECTOR_NAME}}", name)
                    content = content.replace("{{CONNECTOR_CLASS}}", name.replace("-", "_").title())
                    file_path.write_text(content)
                except Exception:
                    pass  # Skip binary files
        
        # Create tool.schema.json with FedMCP compliance fields
        schema = {
            "name": f"{name}_connector",
            "description": f"FedMCP connector for {name}",
            "version": "1.0.0",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "description": "Action to perform",
                        "enum": ["fetch", "list", "search"]
                    },
                    "query": {
                        "type": "object",
                        "description": "Query parameters"
                    }
                },
                "required": ["action"]
            },
            "outputSchema": {
                "type": "object",
                "properties": {
                    "data": {"type": "object"},
                    "_metadata": {"type": "object"}
                }
            },
            "compliance": {
                "pii_handling": True,
                "audit_log": True,
                "data_classification": ["UNCLASSIFIED", "CUI", "SECRET"],
                "retention_policy": "configurable",
                "encryption": "AES-256",
                "signing": "JWS"
            },
            "capabilities": {
                "batch_operations": False,
                "streaming": False,
                "caching": True,
                "rate_limiting": True
            }
        }
        
        (dst / "tool.schema.json").write_text(json.dumps(schema, indent=2) + "\n")
        
        # Success message
        typer.secho(f"\n✅ Created connector '{name}' using '{template}' template", fg=colors.GREEN)
        typer.secho(f"\n📁 Location: {dst}", fg=colors.BLUE)
        typer.secho("\n🚀 Next steps:", fg=colors.YELLOW)
        typer.echo("   1. cd " + str(dst))
        typer.echo("   2. pip install -r requirements.txt")
        typer.echo("   3. Edit connector.py to implement your logic")
        typer.echo("   4. Run: python connector.py")
        typer.echo("\n📚 Documentation: https://docs.fedmcp.org/connector-sdk")
        
    except Exception as e:
        typer.secho(f"❌ Error creating connector: {e}", fg=colors.RED)
        raise typer.Exit(1)


@app.command("list-templates", help="List available connector templates")
def list_templates():
    """List all available connector templates"""
    typer.secho("\n📋 Available FedMCP Connector Templates:\n", fg=colors.BLUE, bold=True)
    
    templates_info = {
        "basic": "Simple connector with minimal structure and FastAPI",
        "rest-api": "REST API connector with authentication and retry logic",
        "database": "Database connector with connection pooling (coming soon)",
        "filesystem": "File system connector with access controls (coming soon)"
    }
    
    for template_name, description in templates_info.items():
        status = "✅" if (TEMPLATES_DIR / template_name).exists() else "🚧"
        typer.echo(f"  {status} {template_name:<12} - {description}")
    
    typer.echo("\n💡 Usage: fmcpx create my-connector --template <template-name>\n")


@app.command("validate", help="Validate a connector meets FedMCP requirements")
def validate_connector(
    path: str = typer.Argument(..., help="Path to connector directory")
):
    """Validate that a connector meets FedMCP requirements"""
    connector_path = pathlib.Path(path)
    
    if not connector_path.exists():
        typer.secho(f"❌ Path '{path}' does not exist", fg=colors.RED)
        raise typer.Exit(1)
    
    typer.secho(f"\n🔍 Validating connector at: {connector_path}\n", fg=colors.BLUE)
    
    # Check required files
    required_files = {
        "connector.py": "Main connector implementation",
        "requirements.txt": "Python dependencies",
        "tool.schema.json": "MCP tool schema with compliance info",
        "Dockerfile": "Container definition",
    }
    
    recommended_files = {
        "README.md": "Documentation",
        "tests/": "Unit tests directory",
        ".env.example": "Environment variables example"
    }
    
    errors = []
    warnings = []
    
    # Check required files
    for file_name, description in required_files.items():
        file_path = connector_path / file_name
        if not file_path.exists():
            errors.append(f"Missing required file: {file_name} ({description})")
        else:
            typer.echo(f"  ✅ {file_name}")
    
    # Check recommended files
    for file_name, description in recommended_files.items():
        file_path = connector_path / file_name
        if not file_path.exists():
            warnings.append(f"Missing recommended: {file_name} ({description})")
    
    # Validate tool.schema.json
    schema_path = connector_path / "tool.schema.json"
    if schema_path.exists():
        try:
            schema = json.loads(schema_path.read_text())
            
            # Check for compliance section
            if "compliance" not in schema:
                errors.append("tool.schema.json missing 'compliance' section")
            else:
                typer.echo("  ✅ Compliance metadata present")
            
            # Check for required schema fields
            if "inputSchema" not in schema:
                errors.append("tool.schema.json missing 'inputSchema'")
            if "name" not in schema:
                errors.append("tool.schema.json missing 'name'")
                
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON in tool.schema.json: {e}")
    
    # Check connector.py structure
    connector_file = connector_path / "connector.py"
    if connector_file.exists():
        content = connector_file.read_text()
        
        # Basic checks
        checks = {
            "FastAPI app": "app = FastAPI" in content or "from fastapi import FastAPI" in content,
            "Health endpoint": "health" in content or "@app.get" in content,
            "Audit logging": "audit" in content.lower(),
            "Error handling": "try:" in content or "except" in content,
        }
        
        for check_name, check_passed in checks.items():
            if not check_passed:
                warnings.append(f"Consider adding: {check_name}")
    
    # Show results
    typer.echo("")
    
    if errors:
        typer.secho("❌ Validation FAILED\n", fg=colors.RED, bold=True)
        typer.secho("Errors:", fg=colors.RED)
        for error in errors:
            typer.echo(f"  • {error}")
    else:
        typer.secho("✅ Validation PASSED\n", fg=colors.GREEN, bold=True)
    
    if warnings:
        typer.secho("\n⚠️  Warnings:", fg=colors.YELLOW)
        for warning in warnings:
            typer.echo(f"  • {warning}")
    
    if not errors and not warnings:
        typer.secho("🎉 Excellent! Your connector meets all FedMCP requirements.", fg=colors.GREEN)
    
    typer.echo("\n📚 Learn more: https://docs.fedmcp.org/connector-sdk/validation")


@app.command("version", help="Show fmcpx version")
def show_version():
    """Display version information"""
    typer.echo("FedMCP Connector SDK (fmcpx)")
    typer.echo("Version: 1.0.0")
    typer.echo("License: Apache 2.0")
    typer.echo("Docs: https://docs.fedmcp.org/connector-sdk")


@app.command("info", help="Show information about FedMCP connectors")
def show_info():
    """Display helpful information about FedMCP connectors"""
    info_text = """
╔══════════════════════════════════════════════════════════════╗
║                  FedMCP Connector SDK                        ║
╚══════════════════════════════════════════════════════════════╝

The FedMCP Connector SDK helps you build compliant connectors
for integrating data sources with the Federal Model Context
Protocol (FedMCP).

🔑 Key Features:
  • JWS signatures for all artifacts
  • Built-in audit logging
  • PII detection and handling
  • FedRAMP-aligned security controls

📦 What's Included:
  • CLI tool for scaffolding (fmcpx)
  • Connector templates
  • Compliance helpers
  • Testing utilities

🚀 Quick Start:
  1. Create a connector:  fmcpx create my-connector
  2. Implement your logic in connector.py
  3. Test locally:        python connector.py
  4. Package for deploy:  docker build -t my-connector .

💡 Need Premium Connectors?
  Peregrine Tec LLC offers pre-built connectors for:
  • LexisNexis Federal SDOH
  • VA VistA/CPRS
  • Salesforce Government Cloud
  • AWS GovCloud
  • And more...
  
  Visit: www.peregrinetec.com

📚 Documentation: https://docs.fedmcp.org/connector-sdk
💬 Community: https://github.com/FedMCP/connectors
    """
    typer.echo(info_text)


# Aliases for common commands
app.command("new", help="Alias for 'create'")(create_connector)
app.command("ls", help="Alias for 'list-templates'")(list_templates)


if __name__ == "__main__":
    sys.exit(app())