const ErrorRecoveryService = require('./ErrorRecoveryService');

class MonitoringService {
    constructor() {
        this.metrics = {
            payments: {
                total: 0,
                successful: 0,
                failed: 0,
                pending: 0
            },
            webhooks: {
                received: 0,
                processed: 0,
                failed: 0
            },
            rates: {
                fetches: 0,
                failures: 0,
                lastUpdate: null
            },
            errors: {
                recovered: 0,
                unrecoverable: 0
            }
        };

        this.alerts = [];
        this.startPeriodicCleanup();
    }

    /**
     * Record payment metrics
     */
    recordPayment(status, amount = 0, currency = 'AKOFA') {
        this.metrics.payments.total++;

        switch (status) {
            case 'paid':
            case 'completed':
                this.metrics.payments.successful++;
                break;
            case 'failed':
                this.metrics.payments.failed++;
                break;
            case 'pending':
                this.metrics.payments.pending++;
                break;
        }

        console.log(`📊 Payment recorded: ${status} - ${amount} ${currency}`);
    }

    /**
     * Record webhook metrics
     */
    recordWebhook(status) {
        this.metrics.webhooks.received++;

        switch (status) {
            case 'processed':
                this.metrics.webhooks.processed++;
                break;
            case 'failed':
                this.metrics.webhooks.failed++;
                break;
        }
    }

    /**
     * Record rate fetch metrics
     */
    recordRateFetch(success = true) {
        this.metrics.rates.fetches++;
        if (!success) {
            this.metrics.rates.failures++;
        }
        this.metrics.rates.lastUpdate = new Date();
    }

    /**
     * Record error recovery metrics
     */
    recordErrorRecovery(recovered = true) {
        if (recovered) {
            this.metrics.errors.recovered++;
        } else {
            this.metrics.errors.unrecoverable++;
        }
    }

    /**
     * Add alert
     */
    addAlert(type, message, severity = 'info') {
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            severity,
            timestamp: new Date(),
            resolved: false
        };

        this.alerts.push(alert);

        // Log alert
        console.log(`🚨 [${severity.toUpperCase()}] ${type}: ${message}`);

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }

        return alert.id;
    }

    /**
     * Resolve alert
     */
    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date();
        }
    }

    /**
     * Check for anomalies and create alerts
     */
    checkAnomalies() {
        const totalPayments = this.metrics.payments.total;
        const failedPayments = this.metrics.payments.failed;

        // Alert if failure rate > 10%
        if (totalPayments > 10 && (failedPayments / totalPayments) > 0.1) {
            this.addAlert(
                'high_failure_rate',
                `Payment failure rate is ${(failedPayments / totalPayments * 100).toFixed(1)}%`,
                'warning'
            );
        }

        // Alert if rate fetches are failing frequently
        const rateFailureRate = this.metrics.rates.failures / Math.max(this.metrics.rates.fetches, 1);
        if (this.metrics.rates.fetches > 5 && rateFailureRate > 0.5) {
            this.addAlert(
                'rate_fetch_failures',
                `Exchange rate fetch failure rate is ${(rateFailureRate * 100).toFixed(1)}%`,
                'error'
            );
        }

        // Alert if many unrecoverable errors
        if (this.metrics.errors.unrecoverable > 5) {
            this.addAlert(
                'high_error_rate',
                `${this.metrics.errors.unrecoverable} unrecoverable errors in the last hour`,
                'error'
            );
        }
    }

    /**
     * Get comprehensive health status
     */
    getHealthStatus() {
        const errorStats = ErrorRecoveryService.getStats();

        return {
            status: this.calculateOverallHealth(),
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            metrics: this.metrics,
            errorRecovery: {
                activeRetries: errorStats.activeRetries,
                failedOperations: errorStats.failedOperations
            },
            alerts: {
                active: this.alerts.filter(a => !a.resolved).length,
                total: this.alerts.length,
                recent: this.alerts.slice(-5).reverse()
            },
            system: {
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                environment: process.env.NODE_ENV || 'development'
            }
        };
    }

    /**
     * Calculate overall system health
     */
    calculateOverallHealth() {
        const errorRate = this.metrics.payments.failed / Math.max(this.metrics.payments.total, 1);
        const activeAlerts = this.alerts.filter(a => !a.resolved && a.severity === 'error').length;

        if (errorRate > 0.2 || activeAlerts > 3) {
            return 'critical';
        } else if (errorRate > 0.1 || activeAlerts > 1) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }

    /**
     * Periodic cleanup of old data
     */
    startPeriodicCleanup() {
        // Clean up old alerts every hour
        setInterval(() => {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            this.alerts = this.alerts.filter(alert =>
                !alert.resolved || alert.timestamp > oneWeekAgo
            );

            // Clear old failed operations
            ErrorRecoveryService.clearOldFailedOperations();

            // Check for anomalies
            this.checkAnomalies();

        }, 60 * 60 * 1000); // Every hour
    }

    /**
     * Export metrics for external monitoring
     */
    exportMetrics() {
        return {
            ...this.metrics,
            health: this.calculateOverallHealth(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reset metrics (for testing)
     */
    resetMetrics() {
        Object.keys(this.metrics).forEach(category => {
            Object.keys(this.metrics[category]).forEach(key => {
                if (typeof this.metrics[category][key] === 'number') {
                    this.metrics[category][key] = 0;
                } else {
                    this.metrics[category][key] = null;
                }
            });
        });
        this.alerts = [];
    }
}

module.exports = new MonitoringService();