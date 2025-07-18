import base64
import json
import hashlib
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Tuple, Optional
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from jose import jws
import boto3

from .artifact import Artifact


class Signer(ABC):
    """Abstract base class for artifact signers"""
    
    @abstractmethod
    def sign(self, artifact: Artifact) -> str:
        """Sign an artifact and return JWS"""
        pass
    
    @abstractmethod
    def get_key_id(self) -> str:
        """Return the key ID for this signer"""
        pass
    
    @abstractmethod
    def get_public_key_jwk(self) -> dict:
        """Return public key in JWK format"""
        pass


class LocalSigner(Signer):
    """Local ECDSA P-256 signer for development/testing"""
    
    def __init__(self, private_key: Optional[ec.EllipticCurvePrivateKey] = None):
        if private_key is None:
            # Generate new P-256 key
            self.private_key = ec.generate_private_key(
                ec.SECP256R1(), 
                default_backend()
            )
        else:
            self.private_key = private_key
        
        # Generate key ID from public key
        pub_bytes = self.private_key.public_key().public_bytes(
            encoding=serialization.Encoding.DER,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        self.key_id = hashlib.sha256(pub_bytes).hexdigest()[:16]
    
    def sign(self, artifact: Artifact) -> str:
        """Sign artifact with local key"""
        # Create JWT header
        header = {
            "alg": "ES256",
            "typ": "JWT",
            "kid": self.key_id
        }
        
        # Create JWT payload
        payload = {
            "iss": str(artifact.workspaceId),
            "sub": str(artifact.id),
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "artifact": artifact.canonicalize().decode()
        }
        
        # Sign with python-jose
        token = jws.sign(
            payload,
            self.private_key,
            headers=header,
            algorithm="ES256"
        )
        
        return token
    
    def get_key_id(self) -> str:
        return self.key_id
    
    def get_public_key_jwk(self) -> dict:
        """Return public key in JWK format"""
        from jose import jwk
        public_key = self.private_key.public_key()
        return jwk.construct(public_key, algorithm="ES256").to_dict()


class KMSSigner(Signer):
    """AWS KMS signer for production use"""
    
    def __init__(self, kms_key_id: str, region: str = "us-gov-west-1"):
        self.kms_key_id = kms_key_id
        self.region = region
        self.kms = boto3.client("kms", region_name=region)
        
        # Get public key to generate key ID
        response = self.kms.get_public_key(KeyId=kms_key_id)
        self.key_id = kms_key_id.split("/")[-1][:16]  # Use last part of ARN
    
    def sign(self, artifact: Artifact) -> str:
        """Sign artifact with KMS"""
        # Create JWT header  
        header = {
            "alg": "ES256",
            "typ": "JWT", 
            "kid": self.key_id
        }
        
        # Create JWT payload
        payload = {
            "iss": str(artifact.workspaceId),
            "sub": str(artifact.id),
            "iat": int(datetime.now(timezone.utc).timestamp()),
            "artifact": artifact.canonicalize().decode()
        }
        
        # Encode header and payload
        header_b64 = base64.urlsafe_b64encode(
            json.dumps(header).encode()
        ).decode().rstrip("=")
        
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).decode().rstrip("=")
        
        # Create signing input
        signing_input = f"{header_b64}.{payload_b64}"
        
        # Sign with KMS
        response = self.kms.sign(
            KeyId=self.kms_key_id,
            Message=signing_input.encode(),
            MessageType="RAW",
            SigningAlgorithm="ECDSA_SHA_256"
        )
        
        # Encode signature
        signature_b64 = base64.urlsafe_b64encode(
            response["Signature"]
        ).decode().rstrip("=")
        
        return f"{signing_input}.{signature_b64}"
    
    def get_key_id(self) -> str:
        return self.key_id
    
    def get_public_key_jwk(self) -> dict:
        """Get public key from KMS in JWK format"""
        response = self.kms.get_public_key(KeyId=self.kms_key_id)
        
        # Parse the DER-encoded public key
        from cryptography.hazmat.primitives.serialization import load_der_public_key
        public_key = load_der_public_key(response["PublicKey"])
        
        # Convert to JWK
        from jose import jwk
        return jwk.construct(public_key, algorithm="ES256").to_dict()