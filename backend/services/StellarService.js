const { Keypair, Horizon, TransactionBuilder, Networks, Operation, Asset, BASE_FEE, Transaction } = require('@stellar/stellar-sdk');
const axios = require('axios');
const crypto = require('crypto');
const ErrorRecoveryService = require('./ErrorRecoveryService');
const MonitoringService = require('./MonitoringService');

class StellarService {
    constructor() {
        // Use testnet for development, mainnet for production
        this.isTestnet = process.env.STELLAR_NETWORK === 'testnet';
        this.server = new Horizon.Server(
            this.isTestnet
                ? 'https://horizon-testnet.stellar.org'
                : 'https://horizon.stellar.org'
        );

        // Load distributor keypair from environment (optional for basic operations)
        this.distributorSecret = process.env.STELLAR_DISTRIBUTOR_SECRET;
        this.distributorPublicKey = process.env.STELLAR_DISTRIBUTOR_PUBLIC_KEY;

        if (this.distributorSecret && this.distributorPublicKey) {
            this.distributorKeypair = Keypair.fromSecret(this.distributorSecret);
        } else {
            console.warn('Stellar distributor keys not configured - some operations will be limited');
            this.distributorKeypair = null;
        }

        // Asset configuration
        this.assetCode = process.env.STELLAR_ASSET_CODE || 'AKOFA';
        this.assetIssuer = process.env.STELLAR_ASSET_ISSUER;

        // Fee configuration
        this.baseFee = process.env.STELLAR_BASE_FEE || BASE_FEE;

        // Network passphrase
        this.networkPassphrase = this.isTestnet
            ? Networks.TESTNET
            : Networks.PUBLIC;
    }

    /**
     * Check wallet balance for a specific asset
     */
    async checkBalance(publicKey, assetCode = this.assetCode, issuer = this.assetIssuer) {
        try {
            // Validate public key format
            if (!this.isValidPublicKey(publicKey)) {
                throw new Error('Invalid Stellar public key format');
            }

            const account = await this.server.loadAccount(publicKey);
            const asset = assetCode === 'XLM' ? Asset.native() : new Asset(assetCode, issuer);

            const balance = account.balances.find(b => {
                if (assetCode === 'XLM') {
                    return b.asset_type === 'native';
                }
                return b.asset_code === assetCode && b.asset_issuer === issuer;
            });

            return {
                balance: balance ? parseFloat(balance.balance) : 0,
                asset: assetCode,
                issuer: issuer,
                buyingLiabilities: balance ? parseFloat(balance.buying_liiabilities || 0) : 0,
                sellingLiabilities: balance ? parseFloat(balance.selling_liiabilities || 0) : 0
            };
        } catch (error) {
            console.error('Error checking Stellar balance:', error);
            throw new Error(`Failed to check balance: ${error.message}`);
        }
    }

    /**
     * Get account details including balances and flags
     */
    async getAccountDetails(publicKey) {
        try {
            // Validate public key format
            if (!this.isValidPublicKey(publicKey)) {
                throw new Error('Invalid Stellar public key format');
            }

            const account = await this.server.loadAccount(publicKey);
            return {
                id: account.id,
                sequence: account.sequence,
                balances: account.balances,
                thresholds: account.thresholds,
                flags: account.flags,
                signers: account.signers,
                data: account.data
            };
        } catch (error) {
            if (error.response && error.response.status === 404) {
                throw new Error('Account not found on Stellar network');
            }
            throw new Error(`Failed to get account details: ${error.message}`);
        }
    }

    /**
     * Create a payment transaction
     */
    async createPaymentTransaction(fromSecret, toPublicKey, amount, assetCode = this.assetCode, issuer = this.assetIssuer, memo = null) {
        try {
            // Validate inputs
            if (!this.isValidSecret(fromSecret)) {
                throw new Error('Invalid Stellar secret key format');
            }
            if (!this.isValidPublicKey(toPublicKey)) {
                throw new Error('Invalid destination public key format');
            }
            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            const fromKeypair = Keypair.fromSecret(fromSecret);
            const fromAccount = await this.server.loadAccount(fromKeypair.publicKey());

            const asset = assetCode === 'XLM' ? Asset.native() : new Asset(assetCode, issuer);

            let transactionBuilder = new TransactionBuilder(fromAccount, {
                fee: this.baseFee,
                networkPassphrase: this.networkPassphrase
            });

            // Add payment operation
            transactionBuilder = transactionBuilder.addOperation(
                Operation.payment({
                    destination: toPublicKey,
                    asset: asset,
                    amount: amount.toString()
                })
            );

            // Add memo if provided
            if (memo) {
                transactionBuilder = transactionBuilder.addMemo(memo);
            }

            const transaction = transactionBuilder.setTimeout(300).build();

            // Sign the transaction
            transaction.sign(fromKeypair);

            return {
                transaction: transaction,
                xdr: transaction.toEnvelope().toXDR('base64'),
                hash: transaction.hash().toString('hex'),
                source: fromKeypair.publicKey(),
                destination: toPublicKey,
                amount: amount,
                asset: assetCode,
                issuer: issuer
            };
        } catch (error) {
            console.error('Error creating payment transaction:', error);
            throw new Error(`Failed to create payment transaction: ${error.message}`);
        }
    }

    /**
     * Submit a signed transaction to the network
     */
    async submitTransaction(transactionXdr) {
        try {
            // Validate XDR format (basic check)
            if (!transactionXdr || typeof transactionXdr !== 'string') {
                throw new Error('Invalid transaction XDR format');
            }

            const transaction = new Transaction({ xdr: transactionXdr, networkPassphrase: this.networkPassphrase });
            const result = await this.server.submitTransaction(transaction);

            MonitoringService.recordPayment('stellar_submitted', result.fee_charged / 10000000, 'XLM');

            return {
                successful: true,
                hash: result.hash,
                ledger: result.ledger,
                fee: result.fee_charged,
                result: result
            };
        } catch (error) {
            console.error('Error submitting Stellar transaction:', error);

            MonitoringService.recordPayment('stellar_failed', 0, 'XLM');

            if (error.response && error.response.data) {
                const errorData = error.response.data;
                throw new Error(`Transaction failed: ${errorData.extras?.result_codes?.operations || errorData.detail || error.message}`);
            }
            throw new Error(`Failed to submit transaction: ${error.message}`);
        }
    }

    /**
     * Create and submit a payment in one operation (for trusted operations)
     */
    async sendPayment(fromSecret, toPublicKey, amount, assetCode = this.assetCode, issuer = this.assetIssuer, memo = null) {
        try {
            const txData = await this.createPaymentTransaction(fromSecret, toPublicKey, amount, assetCode, issuer, memo);
            const result = await this.submitTransaction(txData.xdr);

            return {
                ...txData,
                ...result
            };
        } catch (error) {
            console.error('Error sending Stellar payment:', error);
            throw error;
        }
    }

    /**
     * Process payment from user wallet to merchant
     */
    async processPayment(fromPublicKey, toPublicKey, amount, assetCode = this.assetCode, issuer = this.assetIssuer, memo = null) {
        try {
            // Validate inputs
            if (!this.isValidPublicKey(fromPublicKey) || !this.isValidPublicKey(toPublicKey)) {
                throw new Error('Invalid Stellar public key format');
            }
            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            // Note: In production, the transaction should be signed by the user
            // This method assumes the transaction is pre-signed or uses a service account

            // For now, we'll use the distributor account for testing
            // In production, you'd receive a signed transaction from the frontend
            const result = await this.sendPayment(
                this.distributorSecret,
                toPublicKey,
                amount,
                assetCode,
                issuer,
                memo
            );

            return result;
        } catch (error) {
            console.error('Error processing Stellar payment:', error);
            throw error;
        }
    }

    /**
     * Verify transaction on the network
     */
    async verifyTransaction(transactionHash) {
        try {
            // Validate transaction hash format (64 character hex string)
            if (!transactionHash || !/^[a-f0-9]{64}$/i.test(transactionHash)) {
                throw new Error('Invalid transaction hash format');
            }

            const transaction = await this.server.transactions().transaction(transactionHash).call();

            return {
                hash: transaction.hash,
                successful: transaction.successful,
                ledger: transaction.ledger_attr,
                createdAt: transaction.created_at,
                source: transaction.source_account,
                fee: transaction.fee_charged,
                operations: transaction.operation_count,
                memo: transaction.memo
            };
        } catch (error) {
            console.error('Error verifying Stellar transaction:', error);
            throw new Error(`Failed to verify transaction: ${error.message}`);
        }
    }

    /**
     * Get transaction history for an account
     */
    async getTransactionHistory(publicKey, limit = 20, cursor = null) {
        try {
            // Validate inputs
            if (!this.isValidPublicKey(publicKey)) {
                throw new Error('Invalid Stellar public key format');
            }
            if (limit < 1 || limit > 200) {
                throw new Error('Limit must be between 1 and 200');
            }

            let builder = this.server.transactions().forAccount(publicKey).limit(limit);

            if (cursor) {
                builder = builder.cursor(cursor);
            }

            const transactions = await builder.call();

            return {
                records: transactions.records.map(tx => ({
                    hash: tx.hash,
                    ledger: tx.ledger_attr,
                    createdAt: tx.created_at,
                    successful: tx.successful,
                    source: tx.source_account,
                    fee: tx.fee_charged,
                    operations: tx.operation_count,
                    memo: tx.memo
                })),
                nextCursor: transactions.next ? transactions.next() : null
            };
        } catch (error) {
            console.error('Error getting transaction history:', error);
            throw new Error(`Failed to get transaction history: ${error.message}`);
        }
    }

    /**
     * Create a trustline for a custom asset
     */
    async createTrustline(accountSecret, assetCode, issuer, limit = null) {
        try {
            // Validate inputs
            if (!this.isValidSecret(accountSecret)) {
                throw new Error('Invalid Stellar secret key format');
            }
            if (!assetCode || !issuer) {
                throw new Error('Asset code and issuer are required');
            }
            if (!this.isValidPublicKey(issuer)) {
                throw new Error('Invalid issuer public key format');
            }

            const keypair = Keypair.fromSecret(accountSecret);
            const account = await this.server.loadAccount(keypair.publicKey());

            const asset = new Asset(assetCode, issuer);

            const transaction = new TransactionBuilder(account, {
                fee: this.baseFee,
                networkPassphrase: this.networkPassphrase
            })
            .addOperation(Operation.changeTrust({
                asset: asset,
                limit: limit ? limit.toString() : undefined
            }))
            .setTimeout(300)
            .build();

            transaction.sign(keypair);

            const result = await this.server.submitTransaction(transaction);

            return {
                successful: true,
                hash: result.hash,
                asset: assetCode,
                issuer: issuer
            };
        } catch (error) {
            console.error('Error creating trustline:', error);
            throw new Error(`Failed to create trustline: ${error.message}`);
        }
    }

    /**
     * Check if account has trustline for asset
     */
    async hasTrustline(publicKey, assetCode, issuer) {
        try {
            // Validate inputs
            if (!this.isValidPublicKey(publicKey)) {
                throw new Error('Invalid Stellar public key format');
            }
            if (!assetCode || !issuer) {
                throw new Error('Asset code and issuer are required');
            }
            if (!this.isValidPublicKey(issuer)) {
                throw new Error('Invalid issuer public key format');
            }

            const account = await this.server.loadAccount(publicKey);
            const asset = new Asset(assetCode, issuer);

            const trustline = account.balances.find(b =>
                b.asset_code === assetCode && b.asset_issuer === issuer
            );

            return !!trustline;
        } catch (error) {
            console.error('Error checking trustline:', error);
            return false;
        }
    }

    /**
     * Generate a new Stellar keypair
     */
    generateKeypair() {
        const keypair = Keypair.random();
        return {
            publicKey: keypair.publicKey(),
            secret: keypair.secret()
        };
    }

    /**
     * Validate Stellar public key
     */
    isValidPublicKey(publicKey) {
        try {
            Keypair.fromPublicKey(publicKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate Stellar secret key
     */
    isValidSecret(secret) {
        try {
            Keypair.fromSecret(secret);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get network status and fee stats
     */
    async getNetworkStatus() {
        try {
            const feeStats = await this.server.feeStats();
            const latestLedger = await this.server.ledgers().order('desc').limit(1).call();

            return {
                network: this.isTestnet ? 'testnet' : 'mainnet',
                latestLedger: latestLedger.records[0].sequence,
                feeStats: {
                    min: feeStats.fee_charged.min,
                    mode: feeStats.fee_charged.mode,
                    p10: feeStats.fee_charged.p10,
                    p20: feeStats.fee_charged.p20,
                    p30: feeStats.fee_charged.p30,
                    p40: feeStats.fee_charged.p40,
                    p50: feeStats.fee_charged.p50,
                    p60: feeStats.fee_charged.p60,
                    p70: feeStats.fee_charged.p70,
                    p80: feeStats.fee_charged.p80,
                    p90: feeStats.fee_charged.p90,
                    p95: feeStats.fee_charged.p95,
                    p99: feeStats.fee_charged.p99
                }
            };
        } catch (error) {
            console.error('Error getting network status:', error);
            throw new Error(`Failed to get network status: ${error.message}`);
        }
    }
}

module.exports = new StellarService();