#!/usr/bin/env python3
"""
FedMCP Quick Start Example

Demonstrates creating, signing, and verifying artifacts
"""

import sys
import json
from pathlib import Path
from uuid import uuid4

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent / "core" / "python"))

from fedmcp import Artifact, ArtifactType, LocalSigner, Verifier


def main():
    print("🚀 FedMCP Python Quick Start")
    print("===========================\n")
    
    # 1. Create an artifact
    print("1️⃣ Creating a healthcare AI artifact...")
    
    workspace_id = uuid4()
    artifact = Artifact(
        type=ArtifactType.AGENT_RECIPE,
        workspaceId=workspace_id,
        jsonBody={
            "name": "Clinical Decision Support Agent",
            "version": "2.0.0",
            "description": "AI agent for clinical decision support",
            "capabilities": [
                "patient_assessment",
                "risk_stratification", 
                "treatment_planning",
                "drug_interaction_checking"
            ],
            "compliance": ["HIPAA", "FedRAMP-High", "FDA 21 CFR Part 11"],
            "model": {
                "name": "medllm-7b",
                "version": "1.2.0",
                "training_data": "MIMIC-IV"
            },
            "validation": {
                "accuracy": 0.94,
                "sensitivity": 0.91,
                "specificity": 0.96
            }
        }
    )
    
    print(f"✅ Created artifact:")
    print(f"   ID: {artifact.id}")
    print(f"   Type: {artifact.type}")
    print(f"   Workspace: {artifact.workspaceId}")
    print(f"   Created: {artifact.createdAt}")
    
    # 2. Sign the artifact
    print("\n2️⃣ Signing the artifact...")
    
    signer = LocalSigner()
    jws_token = signer.sign(artifact)
    
    print(f"✅ Signed with key ID: {signer.get_key_id()}")
    print(f"   JWS Token (first 100 chars): {jws_token[:100]}...")
    
    # Save JWS to file
    with open("signed_artifact.jws", "w") as f:
        f.write(jws_token)
    print("   Saved to: signed_artifact.jws")
    
    # 3. Verify the artifact
    print("\n3️⃣ Verifying the artifact...")
    
    verifier = Verifier()
    verifier.add_public_key(signer.get_key_id(), signer.private_key.public_key())
    
    try:
        verified_artifact = verifier.verify(jws_token)
        print("✅ Signature verified successfully!")
        print(f"   Verified artifact ID: {verified_artifact.id}")
        print(f"   Integrity check: PASSED")
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return 1
    
    # 4. Export public key
    print("\n4️⃣ Exporting public key for sharing...")
    
    jwk = signer.get_public_key_jwk()
    with open("public_key.jwk", "w") as f:
        json.dump(jwk, f, indent=2)
    
    print("✅ Public key exported to: public_key.jwk")
    print(f"   Key ID: {jwk['kid']}")
    print(f"   Algorithm: EC P-256")
    
    # 5. Demonstrate tampering detection
    print("\n5️⃣ Testing tampering detection...")
    
    # Tamper with the JWS
    tampered_jws = jws_token[:-10] + "TAMPERED!!"
    
    try:
        verifier.verify(tampered_jws)
        print("❌ Tampering not detected (this should not happen)")
    except Exception:
        print("✅ Tampering detected - signature verification failed as expected")
    
    # Summary
    print("\n" + "="*50)
    print("🎉 Quick start complete!")
    print("\nWhat we demonstrated:")
    print("- Created a FedRAMP-compliant AI artifact")
    print("- Signed it with ECDSA P-256")
    print("- Verified the signature")
    print("- Exported public key for verification")
    print("- Detected tampering attempts")
    print("\nNext steps:")
    print("- Run the FedMCP server: docker-compose up")
    print("- Push artifacts to the server")
    print("- Query audit trails")
    print("- Integrate with your AI platform")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())