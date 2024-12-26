const { Connection, PublicKey } = require('@solana/web3.js');
const logger = require('./logger');

class TransactionMonitor {
  constructor(connection, followAddresses) {
    this.connection = connection;
    this.followAddresses = followAddresses.map(addr => new PublicKey(addr));
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  async start() {
    this.connection.onLogs(
      'all',
      (logs) => {
        this.handleTransactionLogs(logs);
      },
      'processed'
    );

    logger.info('Transaction monitoring started');
  }

  async handleTransactionLogs(logs) {
    try {
      const { signature, err, logs: txLogs } = logs;
      
      if (err) return;

      const transaction = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) return;

      const isRelevantTransaction = this.followAddresses.some(
        addr => transaction.transaction.message.accountKeys.some(
          key => key.equals(addr)
        )
      );

      if (!isRelevantTransaction) return;

      // 通知所有订阅者
      this.subscribers.forEach(callback => {
        callback(transaction);
      });

    } catch (error) {
      logger.error('Error processing transaction:', error);
    }
  }
}

module.exports = TransactionMonitor;