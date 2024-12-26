const { Market } = require('@project-serum/serum');
const { Connection, PublicKey } = require('@solana/web3.js');
const { Decimal } = require('decimal.js');
const logger = require('./logger');
const SlippageCalculator = require('./utils/slippage');

class DexTrader {
  constructor(connection, wallet, config) {
    this.connection = connection;
    this.wallet = wallet;
    this.config = config;
  }

  async calculatePrice(market, side, amount) {
    const orderbook = await market.loadOrderbook(this.connection);
    const bestPrice = side === 'buy' ? orderbook.asks[0][0] : orderbook.bids[0][0];
    
    // 使用自动滑点计算
    const slippagePercent = this.config.tradeConfig.slippage === 'auto' 
      ? await SlippageCalculator.calculateAutoSlippage(market, side, amount)
      : this.config.tradeConfig.slippage;
    
    const slippageMultiplier = new Decimal(1).plus(
      new Decimal(slippagePercent).div(100)
    );
    
    logger.info('Slippage calculation:', {
      side,
      bestPrice: bestPrice.toString(),
      slippagePercent,
      finalPrice: bestPrice.mul(slippageMultiplier).toString()
    });
    
    return side === 'buy'
      ? bestPrice.mul(slippageMultiplier)
      : bestPrice.div(slippageMultiplier);
  }

  // ... 其他方法保持不变
}