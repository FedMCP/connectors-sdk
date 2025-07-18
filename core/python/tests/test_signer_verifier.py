import pytest
from uuid import uuid4
from fedmcp import Artifact, ArtifactType, LocalSigner, Verifier


def test_sign_and_verify():
    """Test signing and verifying an artifact"""
    # Create an artifact
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.AGENT_RECIPE,
        workspaceId=workspace_id,
        jsonBody={
            "name": "Test Recipe",
            "version": "1.0.0",
            "steps": ["initialize", "process", "complete"]
        }
    )
    
    # Sign it
    signer = LocalSigner()
    jws_token = signer.sign(artifact)
    
    assert jws_token is not None
    assert len(jws_token.split('.')) == 3  # JWS has three parts
    
    # Verify it
    verifier = Verifier()
    verifier.add_public_key(signer.get_key_id(), signer.private_key.public_key())
    
    verified_artifact = verifier.verify(jws_token)
    
    # Should get back the same artifact
    assert verified_artifact.id == artifact.id
    assert verified_artifact.type == artifact.type
    assert verified_artifact.workspaceId == artifact.workspaceId
    assert verified_artifact.jsonBody == artifact.jsonBody


def test_verify_with_wrong_key():
    """Test that verification fails with wrong key"""
    # Create and sign artifact
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.BASELINE_MODULE,
        workspaceId=workspace_id,
        jsonBody={"baseline": "NIST-800-53", "controls": ["AC-1", "AC-2"]}
    )
    
    signer = LocalSigner()
    jws_token = signer.sign(artifact)
    
    # Try to verify with different key
    verifier = Verifier()
    wrong_signer = LocalSigner()  # Different key
    verifier.add_public_key(signer.get_key_id(), wrong_signer.private_key.public_key())
    
    with pytest.raises(ValueError, match="Invalid signature"):
        verifier.verify(jws_token)


def test_verify_tampered_artifact():
    """Test that verification fails if artifact is tampered"""
    # Create and sign artifact
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.TOOL_INVOCATION,
        workspaceId=workspace_id,
        jsonBody={"tool": "diagnose", "parameters": {"patient_id": "12345"}}
    )
    
    signer = LocalSigner()
    jws_token = signer.sign(artifact)
    
    # Tamper with the payload
    parts = jws_token.split('.')
    import base64
    import json
    
    # Decode payload and modify it
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
    payload['artifact'] = payload['artifact'].replace('"diagnose"', '"malicious"')
    
    # Re-encode
    tampered_payload = base64.urlsafe_b64encode(
        json.dumps(payload).encode()
    ).decode().rstrip('=')
    
    tampered_jws = f"{parts[0]}.{tampered_payload}.{parts[2]}"
    
    # Try to verify
    verifier = Verifier()
    verifier.add_public_key(signer.get_key_id(), signer.private_key.public_key())
    
    with pytest.raises(ValueError, match="Invalid signature"):
        verifier.verify(tampered_jws)


def test_jwk_export():
    """Test exporting public key as JWK"""
    signer = LocalSigner()
    jwk = signer.get_public_key_jwk()
    
    assert jwk["kty"] == "EC"
    assert jwk["crv"] == "P-256"
    assert "x" in jwk
    assert "y" in jwk
    assert jwk["use"] == "sig"
    assert jwk["kid"] == signer.get_key_id()