const admin = require('firebase-admin');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  // This would be initialized in your main app file
}

class NotificationService {
    constructor() {
        this.messaging = admin.messaging();
    }

    /**
     * Send push notification to user
     */
    async sendPushNotification(token, title, body, data = {}) {
        try {
            const message = {
                token,
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK'
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1
                        }
                    }
                }
            };

            const response = await this.messaging.send(message);
            console.log('Push notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending push notification:', error);
            throw error;
        }
    }

    /**
     * Send order status notification
     */
    async sendOrderStatusNotification(userId, orderId, status, paymentMethod = null) {
        try {
            // Get user device tokens from database
            const User = require('../models/User');
            const user = await User.findById(userId);

            if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
                console.log('No device tokens found for user:', userId);
                return;
            }

            let title, body;

            switch (status) {
                case 'confirmed':
                    title = 'Order Confirmed! 🎉';
                    body = paymentMethod === 'moonpay'
                        ? 'Your crypto payment was successful. Order is being processed.'
                        : 'Your order has been confirmed and is being processed.';
                    break;
                case 'shipped':
                    title = 'Order Shipped! 🚚';
                    body = 'Your order has been shipped and is on its way.';
                    break;
                case 'delivered':
                    title = 'Order Delivered! 📦';
                    body = 'Your order has been delivered. Enjoy your purchase!';
                    break;
                case 'cancelled':
                    title = 'Order Cancelled';
                    body = 'Your order has been cancelled. Please contact support for details.';
                    break;
                default:
                    title = 'Order Update';
                    body = `Your order status has been updated to: ${status}`;
            }

            // Send to all user device tokens
            const promises = user.deviceTokens.map(token =>
                this.sendPushNotification(token, title, body, {
                    orderId,
                    status,
                    type: 'order_update'
                })
            );

            await Promise.allSettled(promises);
            console.log('Order notifications sent for order:', orderId);

        } catch (error) {
            console.error('Error sending order notification:', error);
            // Don't throw - notifications are not critical
        }
    }

    /**
     * Send payment status notification
     */
    async sendPaymentStatusNotification(userId, paymentIntentId, status) {
        try {
            const User = require('../models/User');
            const user = await User.findById(userId);

            if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
                return;
            }

            let title, body;

            switch (status) {
                case 'paid':
                    title = 'Payment Successful! 💳';
                    body = 'Your payment has been processed successfully.';
                    break;
                case 'failed':
                    title = 'Payment Failed';
                    body = 'Your payment could not be processed. Please try again.';
                    break;
                case 'pending':
                    title = 'Payment Processing';
                    body = 'Your payment is being processed. Please wait.';
                    break;
                default:
                    return; // Don't send notifications for unknown statuses
            }

            const promises = user.deviceTokens.map(token =>
                this.sendPushNotification(token, title, body, {
                    paymentIntentId,
                    status,
                    type: 'payment_update'
                })
            );

            await Promise.allSettled(promises);
            console.log('Payment notifications sent for payment:', paymentIntentId);

        } catch (error) {
            console.error('Error sending payment notification:', error);
        }
    }
}

module.exports = new NotificationService();