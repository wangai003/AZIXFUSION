const express = require('express');
const StellarSdk = require('@stellar/stellar-sdk');
const router = express.Router();

router.post('/cryptoPayment', async (req, res) => {
    const { senderPublicKey, amount } = req.body;

    if (!senderPublicKey || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // Connect to Stellar testnet (change to public when live)
        const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

        // Your AKOFA business wallet address (where payments should be sent)
        const destination = "GDISSWB34FJ2OOIKLAGJ7GB7OU4CTGMTUZMRRNN3GF27Y4JCIRMEWWQH";
        const asset = new StellarSdk.Asset("AKOFA", "GDOMDAYWWHIDDETBRW4V36UBJULCCRO3H3FYZODRHUO376KS7SDHLOPU");

        // Load sender account
        const sourceAccount = await server.loadAccount(senderPublicKey);
        const fee = await server.fetchBaseFee();

        // Build transaction
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee,
            networkPassphrase: StellarSdk.Networks.TESTNET, // Change to PUBLIC when live
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination,
                    asset,
                    amount: amount.toString(),
                })
            )
            .setTimeout(30)
            .build();

        res.json({
            transactionXDR: transaction.toXDR(), // Send to frontend for signing
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
