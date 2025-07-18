import { describe, it, expect, beforeAll } from '@jest/globals';
import { FedMCPArtifact, ArtifactType, LocalSigner, Verifier } from '../src';

describe('Signer and Verifier', () => {
  let signer: LocalSigner;
  let verifier: Verifier;

  beforeAll(async () => {
    signer = new LocalSigner();
    await signer.initialize();
    
    verifier = new Verifier();
    const publicKeyJWK = await signer.getPublicKeyJWK();
    await verifier.addPublicKeyJWK(publicKeyJWK);
  });

  it('should sign and verify an artifact', async () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.AGENT_RECIPE,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: {
        name: 'Test Recipe',
        version: '1.0.0',
        steps: ['initialize', 'process', 'complete']
      }
    });

    // Sign the artifact
    const jws = await signer.sign(artifact.toJSON());
    
    expect(jws).toBeDefined();
    expect(jws.split('.')).toHaveLength(3); // JWS has three parts

    // Verify the artifact
    const verifiedArtifact = await verifier.verify(jws);
    
    expect(verifiedArtifact.id).toBe(artifact.id);
    expect(verifiedArtifact.type).toBe(artifact.type);
    expect(verifiedArtifact.workspaceId).toBe(artifact.workspaceId);
    expect(verifiedArtifact.jsonBody).toEqual(artifact.jsonBody);
  });

  it('should fail verification with wrong key', async () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.BASELINE_MODULE,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: { baseline: 'NIST-800-53', controls: ['AC-1', 'AC-2'] }
    });

    const jws = await signer.sign(artifact.toJSON());

    // Create a different verifier with a different key
    const wrongSigner = new LocalSigner();
    await wrongSigner.initialize();
    const wrongVerifier = new Verifier();
    const wrongPublicKeyJWK = await wrongSigner.getPublicKeyJWK();
    await wrongVerifier.addPublicKeyJWK(wrongPublicKeyJWK);

    // Should fail verification
    await expect(wrongVerifier.verify(jws)).rejects.toThrow('Unknown key ID');
  });

  it('should detect tampering', async () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.TOOL_INVOCATION,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: { tool: 'diagnose', parameters: { patient_id: '12345' } }
    });

    const jws = await signer.sign(artifact.toJSON());

    // Tamper with the signature
    const parts = jws.split('.');
    const tamperedJWS = `${parts[0]}.${parts[1]}.TAMPERED_SIGNATURE`;

    await expect(verifier.verify(tamperedJWS)).rejects.toThrow();
  });

  it('should include proper claims in JWT', async () => {
    const artifact = new FedMCPArtifact({
      type: ArtifactType.LLM_COMPLETION,
      workspaceId: '550e8400-e29b-41d4-a716-446655440000',
      jsonBody: { 
        prompt: 'Test prompt',
        completion: 'Test completion'
      }
    });

    const jws = await signer.sign(artifact.toJSON());
    
    // Decode the payload to check claims
    const parts = jws.split('.');
    const payload = JSON.parse(atob(parts[1]));

    expect(payload.iss).toBe(artifact.workspaceId); // Issuer is workspace
    expect(payload.sub).toBe(artifact.id); // Subject is artifact ID
    expect(payload.iat).toBeDefined(); // Issued at
    expect(payload.exp).toBeDefined(); // Expiration
    expect(payload.artifact).toBeDefined(); // Contains artifact
  });

  it('should generate consistent key IDs', async () => {
    const keyId1 = signer.getKeyId();
    const keyId2 = signer.getKeyId();

    expect(keyId1).toBe(keyId2);
    expect(keyId1).toHaveLength(16); // 8 bytes as hex
  });

  it('should export valid JWK', async () => {
    const jwk = await signer.getPublicKeyJWK();

    expect(jwk.kty).toBe('EC');
    expect(jwk.crv).toBe('P-256');
    expect(jwk.x).toBeDefined();
    expect(jwk.y).toBeDefined();
    expect(jwk.use).toBe('sig');
    expect(jwk.kid).toBe(signer.getKeyId());
  });
});