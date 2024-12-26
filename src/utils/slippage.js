const { Decimal } = require('decimal.js');

class SlippageCalculator {
  // 基于市场深度和波动性计算动态滑点
  static async calculateAutoSlippage(market, side, amount) {
    const orderbook = await market.loadOrderbook();
    const volatility = await this.calculateVolatility(market);
    const liquidity = this.calculateLiquidity(orderbook, side, amount);
    
    // 基础滑点：根据流动性深度计算
    let baseSlippage = new Decimal(1).div(liquidity).mul(100);
    
    // 波动性调整：市场波动越大，滑点越高
    const volatilityAdjustment = new Decimal(volatility).mul(0.5);
    
    // 最终滑点 = 基础滑点 + 波动性调整
    let finalSlippage = baseSlippage.plus(volatilityAdjustment);
    
    // 设置滑点范围
    finalSlippage = Decimal.min(
      Decimal.max(finalSlippage, new Decimal(0.1)), // 最小 0.1%
      new Decimal(5) // 最大 5%
    );
    
    return finalSlippage.toFixed(2);
  }

  // 计算市场深度和流动性
  static calculateLiquidity(orderbook, side, amount) {
    const orders = side === 'buy' ? orderbook.asks : orderbook.bids;
    let totalLiquidity = new Decimal(0);
    
    for (const [price, size] of orders) {
      totalLiquidity = totalLiquidity.plus(
        new Decimal(price).mul(size)
      );
    }
    
    return totalLiquidity;
  }

  // 计算市场波动性
  static async calculateVolatility(market) {
    try {
      const trades = await market.loadRecentTrades();
      if (trades.length < 2) return 1;

      const prices = trades.map(trade => trade.price);
      const returns = [];
      
      for (let i = 1; i < prices.length; i++) {
        returns.push(
          Math.log(prices[i] / prices[i - 1])
        );
      }

      const volatility = this.standardDeviation(returns) * Math.sqrt(trades.length);
      return volatility;
    } catch (error) {
      return 1; // 默认值
    }
  }

  // 计算标准差
  static standardDeviation(values) {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }
}

module.exports = SlippageCalculator;