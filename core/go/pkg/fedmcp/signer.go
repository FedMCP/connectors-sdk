package fedmcp

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// JWSHeader represents the JOSE header
type JWSHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
	Kid string `json:"kid"`
}

// JWSPayload represents the JWT claims
type JWSPayload struct {
	Iss      string `json:"iss"`      // workspace UUID
	Sub      string `json:"sub"`      // artifact ID
	Iat      int64  `json:"iat"`      // issued at
	Artifact string `json:"artifact"` // canonical JSON
}

// Signer interface for artifact signing
type Signer interface {
	Sign(artifact *Artifact) (string, error)
	GetKeyID() string
	GetPublicKey() (*ecdsa.PublicKey, error)
}

// LocalSigner implements Signer with local ECDSA key
type LocalSigner struct {
	privateKey *ecdsa.PrivateKey
	keyID      string
}

// NewLocalSigner creates a signer with a new P-256 key
func NewLocalSigner() (*LocalSigner, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}
	
	// Generate key ID from public key
	pubBytes, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		return nil, err
	}
	keyID := fmt.Sprintf("%x", sha256.Sum256(pubBytes))[:16]
	
	return &LocalSigner{
		privateKey: privateKey,
		keyID:      keyID,
	}, nil
}

// Sign creates a JWS for the artifact
func (s *LocalSigner) Sign(artifact *Artifact) (string, error) {
	// Validate artifact first
	if err := artifact.Validate(); err != nil {
		return "", fmt.Errorf("invalid artifact: %w", err)
	}
	
	// Create header
	header := JWSHeader{
		Alg: "ES256",
		Typ: "JWT",
		Kid: s.keyID,
	}
	
	// Canonicalize artifact
	canonical, err := artifact.Canonicalize()
	if err != nil {
		return "", err
	}
	
	// Create payload
	payload := JWSPayload{
		Iss:      artifact.WorkspaceID.String(),
		Sub:      artifact.ID.String(),
		Iat:      time.Now().Unix(),
		Artifact: string(canonical),
	}
	
	// Encode header and payload
	headerJSON, _ := json.Marshal(header)
	payloadJSON, _ := json.Marshal(payload)
	
	headerB64 := base64.RawURLEncoding.EncodeToString(headerJSON)
	payloadB64 := base64.RawURLEncoding.EncodeToString(payloadJSON)
	
	// Create signature input
	signingInput := headerB64 + "." + payloadB64
	
	// Sign with ECDSA
	hash := sha256.Sum256([]byte(signingInput))
	r, s, err := ecdsa.Sign(rand.Reader, s.privateKey, hash[:])
	if err != nil {
		return "", err
	}
	
	// Encode signature
	signature := append(r.Bytes(), s.Bytes()...)
	signatureB64 := base64.RawURLEncoding.EncodeToString(signature)
	
	// Return complete JWS
	return signingInput + "." + signatureB64, nil
}

func (s *LocalSigner) GetKeyID() string {
	return s.keyID
}

func (s *LocalSigner) GetPublicKey() (*ecdsa.PublicKey, error) {
	return &s.privateKey.PublicKey, nil
}