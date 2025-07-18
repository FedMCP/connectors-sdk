import {
  FedMCPArtifact,
  ArtifactType,
  LocalSigner,
  Verifier,
  FedMCPClient
} from '../src';

async function main() {
  console.log('🚀 FedMCP TypeScript Quick Start\n');

  // 1. Create an artifact
  console.log('1️⃣ Creating a healthcare AI artifact...');
  
  const artifact = new FedMCPArtifact({
    type: ArtifactType.AGENT_RECIPE,
    workspaceId: crypto.randomUUID(),
    jsonBody: {
      name: 'Clinical Decision Support Agent',
      version: '2.0.0',
      description: 'AI agent for clinical decision support',
      capabilities: [
        'patient_assessment',
        'risk_stratification',
        'treatment_planning',
        'drug_interaction_checking'
      ],
      compliance: ['HIPAA', 'FedRAMP-High', 'FDA 21 CFR Part 11'],
      model: {
        name: 'medllm-7b',
        version: '1.2.0',
        training_data: 'MIMIC-IV'
      }
    }
  });

  console.log('✅ Created artifact:');
  console.log(`   ID: ${artifact.id}`);
  console.log(`   Type: ${artifact.type}`);
  console.log(`   Workspace: ${artifact.workspaceId}`);
  console.log(`   Hash: ${artifact.hash()}`);

  // 2. Sign the artifact
  console.log('\n2️⃣ Signing the artifact...');
  
  const signer = new LocalSigner();
  await signer.initialize();
  
  const jws = await signer.sign(artifact.toJSON());
  
  console.log(`✅ Signed with key ID: ${signer.getKeyId()}`);
  console.log(`   JWS Token (first 100 chars): ${jws.substring(0, 100)}...`);

  // 3. Verify the artifact
  console.log('\n3️⃣ Verifying the artifact...');
  
  const verifier = new Verifier();
  const publicKeyJWK = await signer.getPublicKeyJWK();
  await verifier.addPublicKeyJWK(publicKeyJWK);
  
  try {
    const verifiedArtifact = await verifier.verify(jws);
    console.log('✅ Signature verified successfully!');
    console.log(`   Verified artifact ID: ${verifiedArtifact.id}`);
    console.log('   Integrity check: PASSED');
  } catch (error) {
    console.error(`❌ Verification failed: ${error}`);
  }

  // 4. Demonstrate client usage (requires server)
  console.log('\n4️⃣ Client example (requires server running)...');
  
  const client = new FedMCPClient({
    baseUrl: 'http://localhost:8000',
    workspaceId: artifact.workspaceId,
    apiKey: 'demo-token',
    signer: signer
  });

  console.log('To test client functionality:');
  console.log('1. Start the FedMCP server: cd server && python -m src.main');
  console.log('2. Uncomment the client code below');
  
  // Uncomment to test with server:
  /*
  try {
    const result = await client.createArtifact(
      ArtifactType.LLM_COMPLETION,
      {
        model: 'gpt-4',
        prompt: 'Diagnose patient symptoms',
        completion: 'Based on the symptoms...'
      }
    );
    console.log(`✅ Created artifact on server: ${result.artifactId}`);
  } catch (error) {
    console.error(`❌ Server error: ${error}`);
  }
  */

  // 5. Demonstrate tampering detection
  console.log('\n5️⃣ Testing tampering detection...');
  
  // Tamper with the JWS
  const tamperedJWS = jws.slice(0, -10) + 'TAMPERED!!';
  
  try {
    await verifier.verify(tamperedJWS);
    console.log('❌ Tampering not detected (this should not happen)');
  } catch (error) {
    console.log('✅ Tampering detected - signature verification failed as expected');
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Quick start complete!');
}

// Run the demo
main().catch(console.error);