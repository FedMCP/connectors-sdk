export interface Artifact {
    id: string;
    type: string;
    version: number;
    workspaceId: string;
    createdAt: string;
    jsonBody: Record<string, any>;
  }
  
  export enum ArtifactType {
    SSP_FRAGMENT = 'ssp_fragment',
    POAM_TEMPLATE = 'poam_template',
    AGENT_RECIPE = 'agent_recipe',
    BASELINE_MODULE = 'baseline_module',
    AUDIT_SCRIPT = 'audit_script',
    RAG_QUERY = 'rag_query',
    LLM_COMPLETION = 'llm_completion',
    TOOL_INVOCATION = 'tool_invocation'
  }
  
  export interface AuditEvent {
    eventId: string;
    artifactId: string;
    action: string;
    actor: string;
    timestamp: string;
    jws?: string;
  }
  
  export enum AuditAction {
    CREATE = 'create',
    UPDATE = 'update',
    DEPLOY = 'deploy',
    DELETE = 'delete'
  }
  
  export interface SignerOptions {
    keyId?: string;
    privateKey?: CryptoKey;
  }
  
  export interface VerificationResult {
    valid: boolean;
    claims?: Record<string, any>;
    error?: string;
  }