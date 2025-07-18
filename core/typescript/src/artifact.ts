import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { Artifact } from './types';

export class FedMCPArtifact implements Artifact {
  id: string;
  type: string;
  version: number;
  workspaceId: string;
  createdAt: string;
  jsonBody: Record<string, any>;

  constructor(params: {
    type: string;
    workspaceId: string;
    jsonBody: Record<string, any>;
    version?: number;
    id?: string;
    createdAt?: string;
  }) {
    this.id = params.id || uuidv4();
    this.type = params.type;
    this.version = params.version || 1;
    this.workspaceId = params.workspaceId;
    this.createdAt = params.createdAt || new Date().toISOString();
    this.jsonBody = params.jsonBody;
    
    this.validate();
  }

  validate(): void {
    if (!this.id) throw new Error('Artifact ID is required');
    if (!this.type) throw new Error('Artifact type is required');
    if (!this.workspaceId) throw new Error('Workspace ID is required');
    if (this.version < 1) throw new Error('Version must be >= 1');
    if (!this.jsonBody || Object.keys(this.jsonBody).length === 0) {
      throw new Error('jsonBody cannot be empty');
    }
    
    // Check 1 MiB size limit
    const size = new TextEncoder().encode(JSON.stringify(this.jsonBody)).length;
    if (size > 1024 * 1024) {
      throw new Error(`jsonBody size ${size} exceeds 1 MiB limit`);
    }
  }

  canonicalize(): string {
    // RFC 8785 JSON Canonicalization
    // For now, using sorted keys
    return JSON.stringify(this, Object.keys(this).sort());
  }

  hash(): string {
    const canonical = this.canonicalize();
    return createHash('sha256').update(canonical).digest('hex');
  }

  toJSON(): Artifact {
    return {
      id: this.id,
      type: this.type,
      version: this.version,
      workspaceId: this.workspaceId,
      createdAt: this.createdAt,
      jsonBody: this.jsonBody
    };
  }
}