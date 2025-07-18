import pytest
from uuid import uuid4
from fedmcp import Artifact, ArtifactType


def test_create_artifact():
    """Test creating a basic artifact"""
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.AGENT_RECIPE,
        workspaceId=workspace_id,
        jsonBody={
            "name": "Test Recipe",
            "description": "A test agent recipe",
            "steps": ["step1", "step2"]
        }
    )
    
    assert artifact.type == ArtifactType.AGENT_RECIPE
    assert artifact.workspaceId == workspace_id
    assert artifact.version == 1
    assert artifact.jsonBody["name"] == "Test Recipe"
    assert artifact.id is not None
    assert artifact.createdAt is not None


def test_artifact_size_limit():
    """Test that artifacts over 1MB are rejected"""
    workspace_id = uuid4()
    
    # Create a large payload (over 1MB)
    large_data = "x" * (1024 * 1024 + 1)
    
    with pytest.raises(ValueError, match="exceeds 1 MiB limit"):
        Artifact(
            type=ArtifactType.LLM_COMPLETION,
            workspaceId=workspace_id,
            jsonBody={"data": large_data}
        )


def test_artifact_canonicalization():
    """Test canonical JSON representation"""
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.AUDIT_SCRIPT,
        workspaceId=workspace_id,
        jsonBody={
            "b": "second",
            "a": "first",
            "nested": {"z": 1, "y": 2}
        }
    )
    
    canonical = artifact.canonicalize()
    assert isinstance(canonical, bytes)
    
    # Should be deterministic
    canonical2 = artifact.canonicalize()
    assert canonical == canonical2
    
    # Should have sorted keys
    canonical_str = canonical.decode()
    assert canonical_str.index('"a"') < canonical_str.index('"b"')


def test_artifact_hash():
    """Test artifact hashing"""
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.SSP_FRAGMENT,
        workspaceId=workspace_id,
        jsonBody={"control": "AC-1", "status": "implemented"}
    )
    
    hash1 = artifact.hash()
    assert len(hash1) == 64  # SHA256 hex string
    
    # Hash should be deterministic
    hash2 = artifact.hash()
    assert hash1 == hash2