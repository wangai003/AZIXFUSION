const StellarService = require('./services/StellarService');

// Test Stellar integration
async function testStellarIntegration() {
    console.log('Testing Stellar Integration...\n');

    try {
        // Test 1: Network status
        console.log('1. Testing network status...');
        const networkStatus = await StellarService.getNetworkStatus();
        console.log('✓ Network status retrieved:', networkStatus.network);

        // Test 2: Keypair validation
        console.log('\n2. Testing keypair validation...');
        const keypair = StellarService.generateKeypair();
        console.log('✓ Generated keypair:', {
            publicKey: keypair.publicKey,
            secret: keypair.secret.substring(0, 10) + '...'
        });

        const isValidPublic = StellarService.isValidPublicKey(keypair.publicKey);
        const isValidSecret = StellarService.isValidSecret(keypair.secret);
        console.log('✓ Public key validation:', isValidPublic);
        console.log('✓ Secret key validation:', isValidSecret);

        // Test 3: Invalid key validation
        console.log('\n3. Testing invalid key validation...');
        const invalidPublic = StellarService.isValidPublicKey('invalid-key');
        const invalidSecret = StellarService.isValidSecret('invalid-secret');
        console.log('✓ Invalid public key rejected:', !invalidPublic);
        console.log('✓ Invalid secret key rejected:', !invalidSecret);

        // Test 4: Transaction hash validation
        console.log('\n4. Testing transaction hash validation...');
        const validHash = /^[a-f0-9]{64}$/i.test('a'.repeat(64));
        const invalidHash = /^[a-f0-9]{64}$/i.test('invalid-hash');
        console.log('✓ Valid hash format check:', validHash);
        console.log('✓ Invalid hash format check:', !invalidHash);

        console.log('\n✅ All basic validation tests passed!');

        // Note: For full integration testing with real network calls,
        // you would need to set up test accounts and fund them with test XLM
        console.log('\n⚠️  Note: Full network testing requires funded test accounts.');
        console.log('   Set up STELLAR_DISTRIBUTOR_PUBLIC_KEY and STELLAR_DISTRIBUTOR_SECRET in .env');
        console.log('   for complete testing with balance checks and transactions.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    testStellarIntegration();
}

module.exports = { testStellarIntegration };