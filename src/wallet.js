const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

class WalletManager {
  constructor(privateKeyString) {
    this.keypair = this.parsePrivateKey(privateKeyString);
  }

  parsePrivateKey(privateKeyString) {
    try {
      // 尝试base58格式
      if (privateKeyString.match(/^[1-9A-HJ-NP-Za-km-z]{88,}$/)) {
        return Keypair.fromSecretKey(bs58.decode(privateKeyString));
      }
      
      // 尝试hex格式
      if (privateKeyString.match(/^[0-9a-fA-F]{64}$/)) {
        const secretKey = Buffer.from(privateKeyString, 'hex');
        return Keypair.fromSecretKey(secretKey);
      }

      // 尝试数组格式
      if (privateKeyString.startsWith('[') && privateKeyString.endsWith(']')) {
        const secretKey = new Uint8Array(JSON.parse(privateKeyString));
        return Keypair.fromSecretKey(secretKey);
      }

      throw new Error('Unsupported private key format');
    } catch (error) {
      throw new Error(`Failed to parse private key: ${error.message}`);
    }
  }

  getPublicKey() {
    return this.keypair.publicKey;
  }
}

module.exports = WalletManager;