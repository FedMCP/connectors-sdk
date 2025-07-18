import base64
import json
import hashlib
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from cryptography.exceptions import InvalidSignature
from jose import jwt, JWTError
import boto3

from .artifact import Artifact


class Verifier:
    """Verifies JWS signatures on FedMCP artifacts"""
    
    def __init__(self, public_keys: Optional[Dict[str, ec.EllipticCurvePublicKey]] = None):
        """
        Initialize with a dictionary of key_id -> public_key mappings
        """
        self.public_keys = public_keys or {}
        
    def add_public_key(self, key_id: str, public_key: ec.EllipticCurvePublicKey):
        """Add a public key for verification"""
        self.public_keys[key_id] = public_key
        
    def add_jwk(self, jwk: Dict[str, Any]):
        """Add a public key from JWK format"""
        from jose import jwk as jose_jwk
        
        key_id = jwk.get("kid", self._generate_kid_from_jwk(jwk))
        public_key = jose_jwk.construct(jwk)
        self.public_keys[key_id] = public_key
        
    def _generate_kid_from_jwk(self, jwk: Dict[str, Any]) -> str:
        """Generate a key ID from JWK coordinates"""
        # Use first 16 chars of SHA256 of the key material
        key_material = f"{jwk.get('x', '')}{jwk.get('y', '')}".encode()
        return hashlib.sha256(key_material).hexdigest()[:16]
        
    def verify(self, jws_token: str) -> Artifact:
        """
        Verify a JWS token and return the artifact if valid
        
        Raises:
            JWTError: If signature is invalid or key not found
        """
        # Parse the JWS to get the header
        parts = jws_token.split('.')
        if len(parts) != 3:
            raise ValueError("Invalid JWS format")
            
        header = json.loads(base64.urlsafe_b64decode(parts[0] + '=='))
        kid = header.get('kid')
        
        if not kid:
            raise ValueError("No key ID in JWS header")
            
        if kid not in self.public_keys:
            raise ValueError(f"Unknown key ID: {kid}")
            
        # Verify with python-jose
        try:
            payload = jwt.decode(
                jws_token,
                self.public_keys[kid],
                algorithms=['ES256']
            )
        except JWTError as e:
            raise ValueError(f"Invalid signature: {str(e)}")
            
        # Extract and validate artifact
        if 'artifact' not in payload:
            raise ValueError("No artifact in JWS payload")
            
        artifact_data = json.loads(payload['artifact'])
        artifact = Artifact(**artifact_data)
        
        # Verify artifact ID matches subject claim
        if str(artifact.id) != payload.get('sub'):
            raise ValueError("Artifact ID doesn't match subject claim")
            
        # Verify workspace ID matches issuer claim
        if str(artifact.workspaceId) != payload.get('iss'):
            raise ValueError("Workspace ID doesn't match issuer claim")
            
        return artifact


class KMSVerifier(Verifier):
    """Verifier that can fetch public keys from AWS KMS"""
    
    def __init__(self, region: str = "us-gov-west-1"):
        super().__init__()
        self.region = region
        self.kms = boto3.client("kms", region_name=region)
        
    def add_kms_key(self, key_id: str, kms_key_id: str):
        """Add a public key from KMS"""
        response = self.kms.get_public_key(KeyId=kms_key_id)
        
        # Parse the DER-encoded public key
        from cryptography.hazmat.primitives.serialization import load_der_public_key
        public_key = load_der_public_key(response["PublicKey"])
        
        self.public_keys[key_id] = public_key