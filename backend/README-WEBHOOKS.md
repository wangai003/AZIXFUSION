# MoonPay Webhook Configuration Guide

This guide explains how to set up and configure webhooks for MoonPay payment integration.

## 🚀 Quick Setup

### 1. Run Setup Script
```bash
cd backend
node scripts/setup-webhooks.js
```

### 2. Configure MoonPay Dashboard
1. Go to [MoonPay Dashboard](https://dashboard.moonpay.com/webhooks)
2. Add new webhook endpoint
3. Use the URL provided by the setup script
4. Select events: `transaction.updated`, `transaction.completed`, `transaction.failed`

### 3. Environment Variables
Add to your `.env` file:
```env
MOONPAY_API_KEY=your_api_key_here
MOONPAY_SECRET_KEY=your_secret_key_here
MOONPAY_ENVIRONMENT=sandbox  # or 'production'
BACKEND_URL=http://localhost:8000  # or your production URL
```

## 📡 Webhook Endpoints

### Production Endpoint
```
POST https://yourdomain.com/payments/webhook/moonpay
```
- Uses raw body parsing for signature verification
- Required for live transactions

### Development/Test Endpoint
```
POST http://localhost:8000/payments/webhook/moonpay/test
```
- Uses JSON parsing for easier debugging
- Only for development/testing

### Health Check
```
GET https://yourdomain.com/payments/webhook/health
```
- Monitor webhook endpoint health
- Returns server status and configuration

### Test Webhook
```
POST https://yourdomain.com/payments/webhook/test
```
- Send test webhook payload
- Useful for development testing

## 🔒 Security

### Signature Verification
- All webhooks include HMAC signature in `MoonPay-Signature` header
- Server verifies signature using your MoonPay secret key
- Unsigned webhooks are rejected with 401 status

### HTTPS Requirement
- Production webhooks must use HTTPS
- Development can use HTTP for testing

### Rate Limiting
- Webhook endpoints are not rate-limited (as required by MoonPay)
- Other payment endpoints have appropriate rate limits

## 📊 Monitoring

### Logs
Webhook events are logged with request IDs for tracking:
```
[wh_1697123456789_abc123] MoonPay webhook received
[wh_1697123456789_abc123] MoonPay webhook processed successfully in 150ms
```

### Health Monitoring
Use the health check endpoint to monitor:
- Server uptime
- Database connectivity
- Webhook endpoint availability

## 🧪 Testing

### Development Testing
1. Use the test webhook endpoint
2. Send sample payloads to verify processing
3. Check server logs for processing details

### MoonPay Sandbox
1. Use sandbox API keys
2. Configure sandbox webhook URL
3. Test with small amounts

### Manual Testing
```bash
# Test health check
curl http://localhost:8000/payments/webhook/health

# Test webhook processing
curl -X POST http://localhost:8000/payments/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"externalId":"test_123","status":"completed"}'
```

## 🚨 Troubleshooting

### Common Issues

**Webhook Not Received**
- Check if server is publicly accessible
- Verify HTTPS in production
- Confirm webhook URL in MoonPay dashboard

**Signature Verification Failed**
- Ensure `MOONPAY_SECRET_KEY` is correct
- Check that raw body is used (not parsed JSON)

**Order Not Updated**
- Check database connectivity
- Verify order exists with correct `paymentIntentId`
- Review server logs for errors

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
DEBUG=moonpay:*
```

## 📋 Webhook Payload Structure

```json
{
  "id": "transaction_id",
  "externalId": "pi_1234567890_abc123",
  "status": "completed",
  "amount": 100.50,
  "currency": "USDC",
  "createdAt": "2023-10-22T07:54:52.000Z",
  "updatedAt": "2023-10-22T07:55:00.000Z"
}
```

## 🔄 Supported Events

- `transaction.completed` - Payment successful
- `transaction.failed` - Payment failed
- `transaction.updated` - Status changed

## 📞 Support

For MoonPay-specific issues:
- [MoonPay Documentation](https://docs.moonpay.com/)
- [MoonPay Dashboard](https://dashboard.moonpay.com/)

For integration issues:
- Check server logs
- Use health check endpoint
- Test with development endpoints