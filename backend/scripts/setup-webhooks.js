#!/usr/bin/env node

/**
 * Webhook Setup Script for MoonPay Integration
 *
 * This script helps configure webhook endpoints for MoonPay.
 * Run this after deploying your application to get the correct webhook URLs.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    environment: process.env.NODE_ENV || 'development',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
    moonpayDashboardUrl: 'https://dashboard.moonpay.com'
};

// Webhook endpoints
const webhooks = {
    production: {
        moonpay: `${config.backendUrl}/payments/webhook/moonpay`
    },
    staging: {
        moonpay: `${config.backendUrl}/payments/webhook/moonpay`
    },
    development: {
        moonpay: `${config.backendUrl}/payments/webhook/moonpay/test` // Use test endpoint for dev
    }
};

function displaySetupInstructions() {
    console.log('🚀 MoonPay Webhook Setup Instructions');
    console.log('=====================================\n');

    console.log('1. Access MoonPay Dashboard:');
    console.log(`   ${config.moonpayDashboardUrl}/webhooks\n`);

    console.log('2. Add Webhook Endpoint:');
    console.log(`   URL: ${webhooks[config.environment].moonpay}`);
    console.log('   Events: transaction.updated, transaction.completed, transaction.failed\n');

    console.log('3. Security Configuration:');
    console.log('   - Ensure your server is publicly accessible');
    console.log('   - HTTPS is required for production');
    console.log('   - Webhook secret will be configured in environment variables\n');

    console.log('4. Test Webhook (Development only):');
    console.log(`   GET  ${config.backendUrl}/payments/webhook/health`);
    console.log(`   POST ${config.backendUrl}/payments/webhook/test\n`);

    console.log('5. Environment Variables Required:');
    console.log('   MOONPAY_API_KEY=your_api_key');
    console.log('   MOONPAY_SECRET_KEY=your_secret_key');
    console.log('   MOONPAY_ENVIRONMENT=sandbox|production\n');

    console.log('6. Verify Setup:');
    console.log('   - Check server logs for webhook events');
    console.log('   - Use health check endpoint to monitor');
    console.log('   - Test with small transactions first\n');

    console.log('📋 Current Configuration:');
    console.log(`   Environment: ${config.environment}`);
    console.log(`   Backend URL: ${config.backendUrl}`);
    console.log(`   Webhook URL: ${webhooks[config.environment].moonpay}\n`);

    console.log('⚠️  Important Notes:');
    console.log('   - Webhook endpoints must be publicly accessible');
    console.log('   - Use HTTPS in production');
    console.log('   - Monitor webhook logs for any failures');
    console.log('   - Test thoroughly in sandbox before production\n');
}

function createWebhookConfigFile() {
    const configPath = path.join(__dirname, '..', 'webhook-config.json');

    const webhookConfig = {
        environment: config.environment,
        backendUrl: config.backendUrl,
        webhooks: webhooks[config.environment],
        setupDate: new Date().toISOString(),
        instructions: 'See setup-webhooks.js for detailed instructions'
    };

    fs.writeFileSync(configPath, JSON.stringify(webhookConfig, null, 2));
    console.log(`✅ Webhook configuration saved to: ${configPath}`);
}

function checkEnvironmentVariables() {
    const required = ['MOONPAY_API_KEY', 'MOONPAY_SECRET_KEY'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.log('\n⚠️  Missing Environment Variables:');
        missing.forEach(key => console.log(`   - ${key}`));
        console.log('   Please set these in your .env file\n');
    } else {
        console.log('\n✅ All required environment variables are set\n');
    }
}

// Main execution
if (require.main === module) {
    console.log('\n');
    displaySetupInstructions();
    checkEnvironmentVariables();
    createWebhookConfigFile();

    console.log('🎉 Webhook setup script completed!');
    console.log('   Next: Configure webhooks in MoonPay dashboard\n');
}

module.exports = {
    webhooks,
    config,
    displaySetupInstructions,
    checkEnvironmentVariables
};