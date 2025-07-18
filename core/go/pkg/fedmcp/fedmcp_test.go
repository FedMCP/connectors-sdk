package fedmcp

import (
	"testing"
	"github.com/google/uuid"
)

func TestArtifactCreation(t *testing.T) {
	workspaceID := uuid.New()
	artifact := NewArtifact(TypeSSPFragment, workspaceID, map[string]interface{}{
		"control": "AC-2",
		"text":    "Account management procedures...",
	})
	
	if err := artifact.Validate(); err != nil {
		t.Fatalf("Failed to validate artifact: %v", err)
	}
	
	// Test canonicalization
	canonical, err := artifact.Canonicalize()
	if err != nil {
		t.Fatalf("Failed to canonicalize: %v", err)
	}
	
	if len(canonical) == 0 {
		t.Fatal("Canonical form is empty")
	}
}

func TestSigningAndVerification(t *testing.T) {
	// Create signer
	signer, err := NewLocalSigner()
	if err != nil {
		t.Fatalf("Failed to create signer: %v", err)
	}
	
	// Create artifact
	workspaceID := uuid.New()
	artifact := NewArtifact(TypeAgentRecipe, workspaceID, map[string]interface{}{
		"name":        "test-agent",
		"description": "Test agent recipe",
	})
	
	// Sign artifact
	jws, err := signer.Sign(artifact)
	if err != nil {
		t.Fatalf("Failed to sign: %v", err)
	}
	
	// Verify signature
	verifier := NewVerifier()
	publicKey, _ := signer.GetPublicKey()
	verifier.AddPublicKey(signer.GetKeyID(), publicKey)
	
	if err := verifier.Verify(jws, artifact); err != nil {
		t.Fatalf("Failed to verify: %v", err)
	}
}