import { describe, it, expect } from '@jest/globals';
import { FedMCPArtifact, ArtifactType } from '../src';

describe('FedMCPArtifact', () => {
  it('should create a valid artifact', () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.AGENT_RECIPE,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: {
        name: 'Test Recipe',
        description: 'A test agent recipe',
        steps: ['step1', 'step2']
      }
    });

    expect(artifact.type).toBe(ArtifactType.AGENT_RECIPE);
    expect(artifact.workspaceId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(artifact.version).toBe(1);
    expect(artifact.jsonBody.name).toBe('Test Recipe');
    expect(artifact.id).toBeDefined();
    expect(artifact.createdAt).toBeDefined();
  });

  it('should validate required fields', () => {
    expect(() => {
      new FedMCPArtifact({
        type: '',
        workspaceId: '550e8400-e29b-41d4-a716-446655440000',
        jsonBody: { test: true }
      });
    }).toThrow('Artifact type is required');

    expect(() => {
      new FedMCPArtifact({
        type: ArtifactType.AGENT_RECIPE,
        workspaceId: '',
        jsonBody: { test: true }
      });
    }).toThrow('Workspace ID is required');
  });

  it('should enforce size limit', () => {
    const largeData = 'x'.repeat(1024 * 1024 + 1);
    
    expect(() => {
      new FedMCPArtifact({
        type: ArtifactType.LLM_COMPLETION,
        workspaceId: '550e8400-e29b-41d4-a716-446655440000',
        jsonBody: { data: largeData }
      });
    }).toThrow('exceeds 1 MiB limit');
  });

  it('should generate consistent hash', () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.AUDIT_SCRIPT,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: {
        script: 'test.sh',
        schedule: '0 0 * * *'
      }
    });

    const hash1 = artifact.hash();
    const hash2 = artifact.hash();

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA256 hex string
  });

  it('should serialize to JSON correctly', () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.SSP_FRAGMENT,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: { control: 'AC-1', status: 'implemented' }
    });

    const json = artifact.toJSON();

    expect(json.id).toBe(artifact.id);
    expect(json.type).toBe(artifact.type);
    expect(json.version).toBe(artifact.version);
    expect(json.workspaceId).toBe(artifact.workspaceId);
    expect(json.createdAt).toBe(artifact.createdAt);
    expect(json.jsonBody).toEqual(artifact.jsonBody);
  });
});