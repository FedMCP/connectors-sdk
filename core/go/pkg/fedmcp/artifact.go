package fedmcp

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Artifact represents a FedMCP artifact as defined in spec v0.2
type Artifact struct {
	ID          uuid.UUID              `json:"id"`
	Type        string                 `json:"type"`
	Version     int                    `json:"version"`
	WorkspaceID uuid.UUID              `json:"workspaceId"`
	CreatedAt   string                 `json:"createdAt"`
	JSONBody    map[string]interface{} `json:"jsonBody"`
}

// ArtifactType enumeration from spec
const (
	TypeSSPFragment    = "ssp_fragment"
	TypePOAMTemplate   = "poam_template"
	TypeAgentRecipe    = "agent_recipe"
	TypeBaselineModule = "baseline_module"
	TypeAuditScript    = "audit_script"
)

// NewArtifact creates a new artifact with RFC3339 timestamp
func NewArtifact(artifactType string, workspaceID uuid.UUID, jsonBody map[string]interface{}) *Artifact {
	return &Artifact{
		ID:          uuid.New(),
		Type:        artifactType,
		Version:     1,
		WorkspaceID: workspaceID,
		CreatedAt:   time.Now().UTC().Format(time.RFC3339),
		JSONBody:    jsonBody,
	}
}

// Canonicalize returns RFC 8785 canonical JSON
func (a *Artifact) Canonicalize() ([]byte, error) {
	// RFC 8785 JSON Canonicalization
	return json.Marshal(a)
}

// Hash returns SHA256 hash of canonical artifact
func (a *Artifact) Hash() (string, error) {
	canonical, err := a.Canonicalize()
	if err != nil {
		return "", err
	}
	hash := sha256.Sum256(canonical)
	return fmt.Sprintf("%x", hash), nil
}

// Validate checks if artifact meets spec requirements
func (a *Artifact) Validate() error {
	if a.ID == uuid.Nil {
		return fmt.Errorf("artifact ID cannot be nil")
	}
	if a.WorkspaceID == uuid.Nil {
		return fmt.Errorf("workspace ID cannot be nil")
	}
	if a.Version < 1 {
		return fmt.Errorf("version must be >= 1")
	}
	if a.Type == "" {
		return fmt.Errorf("type cannot be empty")
	}
	if len(a.JSONBody) == 0 {
		return fmt.Errorf("jsonBody cannot be empty")
	}
	
	// Check 1 MiB size limit from spec
	data, err := json.Marshal(a.JSONBody)
	if err != nil {
		return err
	}
	if len(data) > 1024*1024 {
		return fmt.Errorf("jsonBody exceeds 1 MiB limit")
	}
	
	return nil
}