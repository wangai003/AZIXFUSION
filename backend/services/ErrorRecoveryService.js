const RetryService = require('./RetryService');

class ErrorRecoveryService {
    constructor() {
        this.retryService = new RetryService({
            maxRetries: 5,
            baseDelay: 2000, // 2 seconds
            maxDelay: 60000, // 1 minute
            backoffFactor: 1.5
        });

        this.failedOperations = new Map();
        this.setupRetryListeners();
    }

    /**
     * Setup event listeners for retry service
     */
    setupRetryListeners() {
        this.retryService.on('taskAdded', (task) => {
            console.log(`🔄 Retry task added: ${task.id} (attempts: ${task.attempts}/${task.maxRetries})`);
        });

        this.retryService.on('taskAttempt', (task) => {
            console.log(`⚡ Executing retry task: ${task.id} (attempt ${task.attempts})`);
        });

        this.retryService.on('taskSuccess', (task, result) => {
            console.log(`✅ Retry task succeeded: ${task.id} after ${task.attempts} attempts`);
            this.failedOperations.delete(task.id);
        });

        this.retryService.on('taskRetry', (task, delay) => {
            console.log(`⏳ Scheduling retry for task: ${task.id} in ${delay}ms (attempt ${task.attempts + 1})`);
        });

        this.retryService.on('taskFailed', (task, error) => {
            console.error(`❌ Retry task failed permanently: ${task.id} after ${task.attempts} attempts`);
            console.error(`Last error: ${error.message}`);
            this.failedOperations.set(task.id, {
                task,
                finalError: error,
                failedAt: Date.now()
            });
        });
    }

    /**
     * Handle payment processing errors with retry
     */
    async handlePaymentError(operationId, operation, context = {}) {
        const taskId = `payment_${operationId}`;

        return this.retryService.addRetryTask(taskId, async () => {
            console.log(`Processing payment operation: ${operationId}`);
            return await operation();
        }, {
            maxRetries: 3,
            context
        });
    }

    /**
     * Handle webhook processing errors
     */
    async handleWebhookError(webhookId, webhookData, processingFunction) {
        const taskId = `webhook_${webhookId}`;

        return this.retryService.addRetryTask(taskId, async () => {
            console.log(`Reprocessing webhook: ${webhookId}`);
            return await processingFunction(webhookData);
        }, {
            maxRetries: 5,
            context: { webhookId, webhookData }
        });
    }

    /**
     * Handle order fulfillment errors
     */
    async handleFulfillmentError(orderId, fulfillmentFunction) {
        const taskId = `fulfillment_${orderId}`;

        return this.retryService.addRetryTask(taskId, async () => {
            console.log(`Retrying order fulfillment: ${orderId}`);
            return await fulfillmentFunction();
        }, {
            maxRetries: 3,
            context: { orderId }
        });
    }

    /**
     * Handle notification delivery errors
     */
    async handleNotificationError(notificationId, notificationFunction) {
        const taskId = `notification_${notificationId}`;

        return this.retryService.addRetryTask(taskId, async () => {
            console.log(`Retrying notification delivery: ${notificationId}`);
            return await notificationFunction();
        }, {
            maxRetries: 3,
            context: { notificationId }
        });
    }

    /**
     * Handle rate fetching errors with fallback
     */
    async handleRateFetchError(currency, primaryFetch, fallbackFetch) {
        const taskId = `rate_fetch_${currency}_${Date.now()}`;

        return this.retryService.addRetryTask(taskId, async () => {
            try {
                // Try primary source first
                return await primaryFetch();
            } catch (primaryError) {
                console.warn(`Primary rate fetch failed for ${currency}, trying fallback`);
                try {
                    return await fallbackFetch();
                } catch (fallbackError) {
                    throw new Error(`Both primary and fallback rate fetches failed for ${currency}`);
                }
            }
        }, {
            maxRetries: 2,
            context: { currency }
        });
    }

    /**
     * Handle database operation errors
     */
    async handleDatabaseError(operationId, dbOperation) {
        const taskId = `db_${operationId}`;

        return this.retryService.addRetryTask(taskId, async () => {
            console.log(`Retrying database operation: ${operationId}`);
            return await dbOperation();
        }, {
            maxRetries: 3,
            context: { operationId }
        });
    }

    /**
     * Get status of a failed operation
     */
    getFailedOperationStatus(operationId) {
        return this.failedOperations.get(operationId) || null;
    }

    /**
     * Get all failed operations
     */
    getAllFailedOperations() {
        return Array.from(this.failedOperations.values());
    }

    /**
     * Manually retry a failed operation
     */
    async manualRetry(operationId) {
        const failedOp = this.failedOperations.get(operationId);
        if (!failedOp) {
            throw new Error(`No failed operation found with ID: ${operationId}`);
        }

        // Remove from failed operations and add back to retry queue
        this.failedOperations.delete(operationId);

        return this.retryService.addRetryTask(
            failedOp.task.id,
            failedOp.task.func,
            { maxRetries: failedOp.task.maxRetries }
        );
    }

    /**
     * Clear old failed operations (cleanup)
     */
    clearOldFailedOperations(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
        const cutoff = Date.now() - maxAge;
        let cleared = 0;

        for (const [id, operation] of this.failedOperations) {
            if (operation.failedAt < cutoff) {
                this.failedOperations.delete(id);
                cleared++;
            }
        }

        if (cleared > 0) {
            console.log(`Cleared ${cleared} old failed operations`);
        }

        return cleared;
    }

    /**
     * Get retry service statistics
     */
    getStats() {
        const retryTasks = this.retryService.getAllTasks();
        const failedOps = this.getAllFailedOperations();

        return {
            activeRetries: retryTasks.length,
            failedOperations: failedOps.length,
            retryQueue: retryTasks.map(task => ({
                id: task.id,
                attempts: task.attempts,
                maxRetries: task.maxRetries,
                nextAttempt: new Date(task.nextAttempt).toISOString()
            })),
            failedOperationsSummary: failedOps.map(op => ({
                id: op.task.id,
                attempts: op.task.attempts,
                finalError: op.finalError.message,
                failedAt: new Date(op.failedAt).toISOString()
            }))
        };
    }
}

module.exports = new ErrorRecoveryService();