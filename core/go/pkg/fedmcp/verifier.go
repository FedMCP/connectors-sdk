package fedmcp

import (
	"crypto/ecdsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

// Verifier verifies JWS signatures
type Verifier struct {
	publicKeys map[string]*ecdsa.PublicKey
}

// NewVerifier creates a new verifier
func NewVerifier() *Verifier {
	return &Verifier{
		publicKeys: make(map[string]*ecdsa.PublicKey),
	}
}

// AddPublicKey adds a public key for verification
func (v *Verifier) AddPublicKey(keyID string, publicKey *ecdsa.PublicKey) {
	v.publicKeys[keyID] = publicKey
}

// Verify checks the JWS signature
func (v *Verifier) Verify(jws string, artifact *Artifact) error {
	parts := strings.Split(jws, ".")
	if len(parts) != 3 {
		return fmt.Errorf("invalid JWS format")
	}
	
	// Decode header
	headerJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return err
	}
	
	var header JWSHeader
	if err := json.Unmarshal(headerJSON, &header); err != nil {
		return err
	}
	
	// Check algorithm
	if header.Alg != "ES256" {
		return fmt.Errorf("unsupported algorithm: %s", header.Alg)
	}
	
	// Get public key
	publicKey, ok := v.publicKeys[header.Kid]
	if !ok {
		return fmt.Errorf("unknown key ID: %s", header.Kid)
	}
	
	// Decode payload
	payloadJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return err
	}
	
	var payload JWSPayload
	if err := json.Unmarshal(payloadJSON, &payload); err != nil {
		return err
	}
	
	// Verify claims
	if payload.Iss != artifact.WorkspaceID.String() {
		return fmt.Errorf("issuer mismatch")
	}
	if payload.Sub != artifact.ID.String() {
		return fmt.Errorf("subject mismatch")
	}
	
	// Verify signature
	signingInput := parts[0] + "." + parts[1]
	signature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return err
	}
	
	// Split signature into r and s
	r := new(big.Int).SetBytes(signature[:32])
	s := new(big.Int).SetBytes(signature[32:])
	
	// Verify ECDSA signature
	hash := sha256.Sum256([]byte(signingInput))
	if !ecdsa.Verify(publicKey, hash[:], r, s) {
		return fmt.Errorf("invalid signature")
	}
	
	return nil
}