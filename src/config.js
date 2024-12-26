require('dotenv').config();

module.exports = {
  // RPC配置
  rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
  
  // 跟单钱包地址列表
  followAddresses: (process.env.FOLLOW_ADDRESSES || '').split(',').filter(Boolean),
  
  // 交易配置
  tradeConfig: {
    amount: process.env.TRADE_AMOUNT || '0.1', // 每次交易数量
    slippage: process.env.SLIPPAGE || '1', // 滑点百分比
    gasAdjustment: process.env.GAS_ADJUSTMENT || '1.4' // gas调整系数
  },
  
  // 交易钱包私钥
  privateKey: process.env.PRIVATE_KEY,
  
  // 日志配置
  logLevel: process.env.LOG_LEVEL || 'info'
};