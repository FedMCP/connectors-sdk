import { v4 as uuidv4 } from 'uuid';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read', 
  UPDATE = 'update',
  DELETE = 'delete',
  VERIFY = 'verify',
  SIGN = 'sign',
  EXPORT = 'export',
  IMPORT = 'import'
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  artifactId?: string;
  workspaceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export class FedMCPAuditEvent implements AuditEvent {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: string;
  artifactId?: string;
  workspaceId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  constructor(params: {
    action: AuditAction;
    actor: string;
    workspaceId: string;
    artifactId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }) {
    this.id = uuidv4();
    this.timestamp = new Date().toISOString();
    this.action = params.action;
    this.actor = params.actor;
    this.workspaceId = params.workspaceId;
    this.artifactId = params.artifactId;
    this.metadata = params.metadata;
    this.ipAddress = params.ipAddress;
    this.userAgent = params.userAgent;
    this.sessionId = params.sessionId;
  }

  toCloudWatchLog(): Record<string, any> {
    return {
      eventId: this.id,
      timestamp: this.timestamp,
      action: this.action,
      actor: this.actor,
      artifactId: this.artifactId || null,
      workspaceId: this.workspaceId,
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId
    };
  }

  toJSON(): AuditEvent {
    return {
      id: this.id,
      timestamp: this.timestamp,
      action: this.action,
      actor: this.actor,
      artifactId: this.artifactId,
      workspaceId: this.workspaceId,
      metadata: this.metadata,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      sessionId: this.sessionId
    };
  }
}