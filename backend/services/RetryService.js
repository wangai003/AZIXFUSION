const EventEmitter = require('events');

class RetryService extends EventEmitter {
    constructor(options = {}) {
        super();
        this.maxRetries = options.maxRetries || 3;
        this.baseDelay = options.baseDelay || 1000; // 1 second
        this.maxDelay = options.maxDelay || 30000; // 30 seconds
        this.backoffFactor = options.backoffFactor || 2;
        this.retryQueue = new Map();
        this.isProcessing = false;
    }

    /**
     * Add a task to the retry queue
     */
    async addRetryTask(taskId, taskFunction, options = {}) {
        const task = {
            id: taskId,
            func: taskFunction,
            attempts: 0,
            maxRetries: options.maxRetries || this.maxRetries,
            createdAt: Date.now(),
            lastAttempt: null,
            nextAttempt: Date.now(),
            errors: []
        };

        this.retryQueue.set(taskId, task);
        this.emit('taskAdded', task);

        // Start processing if not already running
        if (!this.isProcessing) {
            this.processQueue();
        }

        return task;
    }

    /**
     * Process the retry queue
     */
    async processQueue() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.retryQueue.size > 0) {
            const now = Date.now();
            const readyTasks = Array.from(this.retryQueue.values())
                .filter(task => task.nextAttempt <= now)
                .sort((a, b) => a.nextAttempt - b.nextAttempt);

            if (readyTasks.length === 0) {
                // No tasks ready, wait a bit
                await this.delay(1000);
                continue;
            }

            // Process the next ready task
            const task = readyTasks[0];
            await this.executeTask(task);
        }

        this.isProcessing = false;
    }

    /**
     * Execute a single task
     */
    async executeTask(task) {
        task.attempts++;
        task.lastAttempt = Date.now();

        try {
            this.emit('taskAttempt', task);
            const result = await task.func();

            // Task succeeded
            this.retryQueue.delete(task.id);
            this.emit('taskSuccess', task, result);

        } catch (error) {
            task.errors.push({
                attempt: task.attempts,
                error: error.message,
                timestamp: Date.now()
            });

            if (task.attempts >= task.maxRetries) {
                // Max retries reached, mark as failed
                this.retryQueue.delete(task.id);
                this.emit('taskFailed', task, error);
            } else {
                // Schedule next retry with exponential backoff
                const delay = Math.min(
                    this.baseDelay * Math.pow(this.backoffFactor, task.attempts - 1),
                    this.maxDelay
                );
                task.nextAttempt = Date.now() + delay;
                this.emit('taskRetry', task, delay);
            }
        }
    }

    /**
     * Remove a task from the retry queue
     */
    removeTask(taskId) {
        const task = this.retryQueue.get(taskId);
        if (task) {
            this.retryQueue.delete(taskId);
            this.emit('taskRemoved', task);
            return true;
        }
        return false;
    }

    /**
     * Get task status
     */
    getTaskStatus(taskId) {
        return this.retryQueue.get(taskId) || null;
    }

    /**
     * Get all tasks in queue
     */
    getAllTasks() {
        return Array.from(this.retryQueue.values());
    }

    /**
     * Clear all tasks
     */
    clearAllTasks() {
        const tasks = Array.from(this.retryQueue.values());
        this.retryQueue.clear();
        this.emit('queueCleared', tasks);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = RetryService;