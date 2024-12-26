const { Connection } = require('@solana/web3.js');
const config = require('./config');
const WalletManager = require('./wallet');
const TransactionMonitor = require('./transaction-monitor');
const DexTrader = require('./dex-trader');
const logger = require('./logger');

async function main() {
  try {
    // 初始化连接
    const connection = new Connection(config.rpcEndpoint, 'processed');
    
    // 初始化钱包
    const wallet = new WalletManager(config.privateKey);
    
    // 初始化交易监控器
    const monitor = new TransactionMonitor(
      connection,
      config.followAddresses
    );
    
    // 初始化交易执行器
    const trader = new DexTrader(connection, wallet, config);
    
    // 订阅交易事件
    monitor.subscribe((transaction) => {
      trader.analyzeTrade(transaction);
    });
    
    // 启动监控
    await monitor.start();
    
    logger.info('Bot started successfully', {
      followAddresses: config.followAddresses,
      walletAddress: wallet.getPublicKey().toString()
    });

  } catch (error) {
    logger.error('Bot initialization error:', error);
    process.exit(1);
  }
}

main();