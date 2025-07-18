import { Artifact, VerificationResult } from './types';
import { Signer } from './signer';
import { FedMCPArtifact } from './artifact';

export interface FedMCPClientOptions {
  baseUrl: string;
  workspaceId: string;
  apiKey?: string;
  signer?: Signer;
}

export class FedMCPClient {
  private baseUrl: string;
  private workspaceId: string;
  private headers: Record<string, string>;
  private signer?: Signer;

  constructor(options: FedMCPClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.workspaceId = options.workspaceId;
    this.signer = options.signer;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Workspace-ID': this.workspaceId
    };
    
    if (options.apiKey) {
      this.headers['Authorization'] = `Bearer ${options.apiKey}`;
    }
  }

  async createArtifact(
    type: string,
    jsonBody: Record<string, any>,
    version: number = 1,
    sign: boolean = true
  ): Promise<{ artifactId: string; jws?: string }> {
    const artifact = new FedMCPArtifact({
      type,
      version,
      workspaceId: this.workspaceId,
      jsonBody
    });

    let jws: string | undefined;
    if (sign && this.signer) {
      jws = await this.signer.sign(artifact.toJSON());
    }

    const response = await fetch(`${this.baseUrl}/artifacts`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ 
        artifact: artifact.toJSON(),
        sign: sign && !!this.signer
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create artifact: ${response.statusText} - ${error}`);
    }

    const result = await response.json();
    return {
      artifactId: result.artifact_id || artifact.id,
      jws: result.jws || jws
    };
  }

  async getArtifact(artifactId: string): Promise<Artifact> {
    const response = await fetch(
      `${this.baseUrl}/artifacts/${artifactId}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to get artifact: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyArtifact(
    artifact: Artifact,
    jws: string
  ): Promise<VerificationResult> {
    const response = await fetch(`${this.baseUrl}/artifacts/verify`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ artifact, jws })
    });

    if (!response.ok) {
      throw new Error(`Failed to verify artifact: ${response.statusText}`);
    }

    return response.json();
  }

  async getAuditTrail(artifactId: string): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/audit/artifacts/${artifactId}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to get audit trail: ${response.statusText}`);
    }

    const data = await response.json();
    return data.events;
  }
}