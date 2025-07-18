import { subtle } from 'crypto';
import { Artifact, VerificationResult } from './types';
import { base64urlDecode } from './signer';

export class Verifier {
  private publicKeys: Map<string, CryptoKey> = new Map();

  async addPublicKey(keyId: string, publicKey: CryptoKey): Promise<void> {
    this.publicKeys.set(keyId, publicKey);
  }

  async addPublicKeyJWK(jwk: any): Promise<void> {
    const keyId = jwk.kid || await this.generateKeyIdFromJWK(jwk);
    
    const publicKey = await subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      true,
      ['verify']
    );
    
    this.publicKeys.set(keyId, publicKey);
  }

  async verify(jws: string): Promise<Artifact> {
    // Split JWS into parts
    const parts = jws.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWS format');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Decode header
    const headerJson = new TextDecoder().decode(base64urlDecode(encodedHeader));
    const header = JSON.parse(headerJson);
    
    const keyId = header.kid;
    if (!keyId) {
      throw new Error('No key ID in JWS header');
    }

    const publicKey = this.publicKeys.get(keyId);
    if (!publicKey) {
      throw new Error(`Unknown key ID: ${keyId}`);
    }

    // Verify signature
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = base64urlDecode(encodedSignature);

    const isValid = await subtle.verify(
      {
        name: 'ECDSA',
        hash: 'SHA-256'
      },
      publicKey,
      signature,
      new TextEncoder().encode(signingInput)
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Decode and validate payload
    const payloadJson = new TextDecoder().decode(base64urlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson);

    // Extract artifact
    if (!payload.artifact) {
      throw new Error('No artifact in JWS payload');
    }

    const artifact = payload.artifact as Artifact;

    // Verify claims
    if (artifact.id !== payload.sub) {
      throw new Error("Artifact ID doesn't match subject claim");
    }

    if (artifact.workspaceId !== payload.iss) {
      throw new Error("Workspace ID doesn't match issuer claim");
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token has expired');
    }

    return artifact;
  }

  async verifyWithResult(jws: string): Promise<VerificationResult> {
    try {
      const artifact = await this.verify(jws);
      return {
        valid: true,
        claims: { artifact }
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateKeyIdFromJWK(jwk: any): Promise<string> {
    // Generate key ID from JWK coordinates
    const keyMaterial = `${jwk.x || ''}${jwk.y || ''}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(keyMaterial);
    const hash = await subtle.digest('SHA-256', data);
    
    return Array.from(new Uint8Array(hash))
      .slice(0, 8)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}