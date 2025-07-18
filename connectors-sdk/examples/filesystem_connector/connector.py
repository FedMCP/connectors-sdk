"""
Example File System Connector for FedMCP
Shows how to build a connector for local file systems
"""

import os
import json
import aiofiles
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime

from fedmcp_connector import BaseConnector, ConnectorConfig


class FileSystemConnector(BaseConnector):
    """
    File system connector for reading local files
    
    This example shows how to:
    - Read files from the file system
    - Handle different file types
    - Create artifacts from file contents
    - Implement proper access controls
    """
    
    def __init__(self, config: ConnectorConfig):
        # File system specific config
        self.base_path = Path(config.get("base_path", "/data"))
        self.allowed_extensions = config.get("allowed_extensions", [".json", ".txt", ".csv"])
        self.max_file_size = config.get("max_file_size", 10 * 1024 * 1024)  # 10MB default
        
        super().__init__(config)
    
    def _initialize(self):
        """Validate base path exists and is accessible"""
        if not self.base_path.exists():
            raise ValueError(f"Base path does not exist: {self.base_path}")
        
        if not self.base_path.is_dir():
            raise ValueError(f"Base path is not a directory: {self.base_path}")
        
        # Check read permissions
        if not os.access(self.base_path, os.R_OK):
            raise PermissionError(f"No read access to base path: {self.base_path}")
    
    async def fetch_data(self, query: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fetch data from file system
        
        Args:
            query: Should contain:
                - path: Relative path to file or directory
                - action: "read_file", "list_directory", or "file_info"
                - encoding: Text encoding (default: utf-8)
        """
        relative_path = query.get("path", "")
        action = query.get("action", "read_file")
        encoding = query.get("encoding", "utf-8")
        
        # Validate and resolve path
        target_path = self._validate_path(relative_path)
        
        try:
            if action == "read_file":
                data = await self._read_file(target_path, encoding)
            elif action == "list_directory":
                data = await self._list_directory(target_path)
            elif action == "file_info":
                data = await self._get_file_info(target_path)
            else:
                raise ValueError(f"Unknown action: {action}")
            
            # Log successful access
            self.audit.log_access(
                resource=str(target_path),
                action=action,
                success=True,
                metadata={"encoding": encoding}
            )
            
            return data
            
        except Exception as e:
            # Log failed access
            self.audit.log_access(
                resource=str(target_path),
                action=action,
                success=False,
                metadata={"error": str(e)}
            )
            raise
    
    def _validate_path(self, relative_path: str) -> Path:
        """Validate path is within allowed base path"""
        # Resolve to absolute path
        target_path = (self.base_path / relative_path).resolve()
        
        # Check path is within base path (prevent directory traversal)
        if not str(target_path).startswith(str(self.base_path)):
            raise PermissionError(f"Path outside allowed directory: {relative_path}")
        
        # Check path exists
        if not target_path.exists():
            raise FileNotFoundError(f"Path does not exist: {relative_path}")
        
        return target_path
    
    async def _read_file(self, file_path: Path, encoding: str) -> Dict[str, Any]:
        """Read file contents"""
        if not file_path.is_file():
            raise ValueError(f"Path is not a file: {file_path}")
        
        # Check file extension
        if file_path.suffix not in self.allowed_extensions:
            raise PermissionError(f"File type not allowed: {file_path.suffix}")
        
        # Check file size
        file_size = file_path.stat().st_size
        if file_size > self.max_file_size:
            raise ValueError(f"File too large: {file_size} bytes")
        
        # Read file based on type
        async with aiofiles.open(file_path, mode='r', encoding=encoding) as f:
            content = await f.read()
        
        # Parse content based on extension
        if file_path.suffix == '.json':
            try:
                data = json.loads(content)
            except json.JSONDecodeError as e:
                data = {"raw_content": content, "parse_error": str(e)}
        else:
            data = {"content": content}
        
        return {
            "file_path": str(file_path.relative_to(self.base_path)),
            "file_name": file_path.name,
            "file_size": file_size,
            "file_type": file_path.suffix,
            "modified_time": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
            "data": data
        }
    
    async def _list_directory(self, dir_path: Path) -> Dict[str, Any]:
        """List directory contents"""
        if not dir_path.is_dir():
            raise ValueError(f"Path is not a directory: {dir_path}")
        
        files = []
        directories = []
        
        for item in dir_path.iterdir():
            relative_path = item.relative_to(self.base_path)
            
            if item.is_file():
                files.append({
                    "name": item.name,
                    "path": str(relative_path),
                    "size": item.stat().st_size,
                    "type": item.suffix,
                    "modified": datetime.fromtimestamp(item.stat().st_mtime).isoformat()
                })
            elif item.is_dir():
                directories.append({
                    "name": item.name,
                    "path": str(relative_path),
                    "modified": datetime.fromtimestamp(item.stat().st_mtime).isoformat()
                })
        
        return {
            "path": str(dir_path.relative_to(self.base_path)),
            "files": sorted(files, key=lambda x: x["name"]),
            "directories": sorted(directories, key=lambda x: x["name"]),
            "total_files": len(files),
            "total_directories": len(directories)
        }
    
    async def _get_file_info(self, file_path: Path) -> Dict[str, Any]:
        """Get file metadata without reading contents"""
        stat = file_path.stat()
        
        return {
            "path": str(file_path.relative_to(self.base_path)),
            "name": file_path.name,
            "type": "file" if file_path.is_file() else "directory",
            "size": stat.st_size if file_path.is_file() else None,
            "extension": file_path.suffix if file_path.is_file() else None,
            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "accessed": datetime.fromtimestamp(stat.st_atime).isoformat(),
            "permissions": oct(stat.st_mode)[-3:],
            "owner_uid": stat.st_uid,
            "group_gid": stat.st_gid
        }
    
    def _check_connection(self) -> bool:
        """Check file system access"""
        return self.base_path.exists() and os.access(self.base_path, os.R_OK)
    
    def get_version(self) -> str:
        """Return connector version"""
        return "1.0.0"


# Example usage
async def main():
    """Example of using the file system connector"""
    
    # Configure connector
    config = ConnectorConfig(
        workspace_id="example-workspace",
        connector_name="filesystem",
        extra_config={
            "base_path": "/tmp/fedmcp-test",
            "allowed_extensions": [".json", ".txt", ".md"]
        }
    )
    
    # Create test directory and file
    test_dir = Path("/tmp/fedmcp-test")
    test_dir.mkdir(exist_ok=True)
    test_file = test_dir / "example.json"
    test_file.write_text(json.dumps({"message": "Hello FedMCP!"}, indent=2))
    
    # Create connector
    async with FileSystemConnector(config) as connector:
        # List directory
        dir_data = await connector.fetch_data({
            "path": ".",
            "action": "list_directory"
        })
        print(f"Directory contents: {dir_data}")
        
        # Read file
        file_data = await connector.fetch_data({
            "path": "example.json",
            "action": "read_file"
        })
        
        # Create FedMCP artifact
        artifact = await connector.create_artifact(
            artifact_type="file-extract",
            data=file_data,
            metadata={
                "source": "Local filesystem",
                "classification": "UNCLASSIFIED"
            }
        )
        
        print(f"Created artifact: {artifact['id']}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())