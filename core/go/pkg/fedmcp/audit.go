package fedmcp

import (
	"time"
	"github.com/google/uuid"
)

// AuditEvent represents an audit log entry
type AuditEvent struct {
	EventID     uuid.UUID `json:"eventId"`
	ArtifactID  uuid.UUID `json:"artifactId"`
	Action      string    `json:"action"`
	Actor       string    `json:"actor"`
	Timestamp   string    `json:"timestamp"`
	JWS         string    `json:"jws,omitempty"`
}

// AuditAction enumeration
const (
	ActionCreate = "create"
	ActionUpdate = "update"
	ActionDeploy = "deploy"
	ActionDelete = "delete"
)

// NewAuditEvent creates a new audit event
func NewAuditEvent(artifactID uuid.UUID, action, actor string) *AuditEvent {
	return &AuditEvent{
		EventID:    uuid.New(),
		ArtifactID: artifactID,
		Action:     action,
		Actor:      actor,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
	}
}