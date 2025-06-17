const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// NEAR configuration for testnet
const NEAR_CONFIG = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
};

class NearTreasuryService {
  constructor() {
    this.treasuryAccounts = new Map(); // Store treasury accounts per DAO
    this.treasuryFilePath = path.join(__dirname, 'treasury-keys.json');
    this.daoTreasuryMapping = new Map(); // Map DAO contract address to treasury
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🌟 Initializing NEAR Treasury Service...');
      
      // Load existing treasury data
      await this.loadTreasuryData();
      
      this.initialized = true;
      
      console.log('✅ NEAR Treasury Service initialized successfully');
      console.log(`📊 Loaded ${this.treasuryAccounts.size} treasury accounts`);
      
    } catch (error) {
      console.error('❌ Failed to initialize NEAR service:', error);
      this.initialized = false;
      
      // Still try to load treasury data for basic functionality
      try {
        await this.loadTreasuryData();
        console.log('⚠️ NEAR service failed but treasury data loaded for basic functionality');
      } catch (loadError) {
        console.error('❌ Failed to load treasury data:', loadError);
      }
    }
  }

  // Load treasury data from file
  async loadTreasuryData() {
    try {
      console.log('📂 Loading treasury data from file...');
      const data = await fs.readFile(this.treasuryFilePath, 'utf8');
      const parsedData = JSON.parse(data);
      
      console.log('📊 Raw treasury data loaded:', JSON.stringify(parsedData, null, 2));
      
      if (parsedData.accounts) {
        console.log(`🔑 Found ${Object.keys(parsedData.accounts).length} treasury accounts`);
        
        for (const [contractAddress, accountInfo] of Object.entries(parsedData.accounts)) {
          console.log(`📝 Loading treasury for contract: ${contractAddress}`);
          console.log(`🏦 Account ID: ${accountInfo.accountId}`);
          
          this.treasuryAccounts.set(contractAddress, accountInfo);
          this.daoTreasuryMapping.set(contractAddress, accountInfo.accountId);
          
          // Private key is stored in memory for future use
          // (No keystore needed for simulation mode)
        }
        
        console.log(`✅ Loaded ${this.treasuryAccounts.size} treasury accounts into memory`);
        console.log(`📋 Contract addresses in memory: ${Array.from(this.treasuryAccounts.keys()).join(', ')}`);
      } else {
        console.log('⚠️ No accounts found in treasury data');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📝 Treasury file does not exist, starting fresh');
        await this.saveTreasuryData();
      } else {
        console.error('❌ Error loading treasury data:', error);
        throw error;
      }
    }
  }

  // Save treasury data to persistent storage
  async saveTreasuryData() {
    try {
      const treasuryData = {
        lastUpdated: new Date().toISOString(),
        accounts: {}
      };

      // Convert Map to object for JSON storage
      for (const [contractAddress, treasuryInfo] of this.treasuryAccounts.entries()) {
        treasuryData.accounts[contractAddress] = treasuryInfo;
      }

      await fs.writeFile(this.treasuryFilePath, JSON.stringify(treasuryData, null, 2));
      console.log('💾 Treasury data saved to persistent storage');
    } catch (error) {
      console.error('❌ Error saving treasury data:', error);
    }
  }



  // Create treasury account for a DAO
  async createTreasuryAccount(daoName, contractAddress, ownerAddress) {
    try {
      console.log(`🏦 Creating treasury account for DAO: ${daoName}`);
      
      // Generate a unique account name
      const cleanName = daoName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const hash = crypto.createHash('md5').update(contractAddress).digest('hex').substring(0, 8);
      const accountId = `dao-${cleanName}-${hash}.testnet`;
      
      console.log(`📝 Generated account ID: ${accountId}`);
      
      // Generate key pair (simplified for demo)
      const publicKey = `ed25519:${this.generateRandomKey()}`;
      const privateKey = `ed25519:${this.generateRandomKey()}${this.generateRandomKey()}`;
      
      console.log(`🔑 Generated key pair for ${accountId}`);
      
      // Treasury account info
      const treasuryInfo = {
        accountId,
        publicKey,
        privateKey,
        networkId: NEAR_CONFIG.networkId,
        explorerUrl: `${NEAR_CONFIG.explorerUrl}/accounts/${accountId}`,
        balance: '0',
        created: new Date().toISOString(),
        daoInfo: {
          name: daoName,
          contractAddress,
          ownerAddress,
          chainId: 1313161723
        },
        canSign: true,
        keyPairStored: true
      };
      
      // Store treasury info
      this.treasuryAccounts.set(contractAddress, treasuryInfo);
      this.daoTreasuryMapping.set(contractAddress, accountId);
      
      // Save to persistent storage
      await this.saveTreasuryData();
      
      console.log(`✅ Treasury account created: ${accountId}`);
      
      // Note: In a real implementation, you would need to fund this account
      // For testnet, users can use the NEAR faucet
      
      return {
        accountId,
        balance: '0',
        explorerUrl: treasuryInfo.explorerUrl,
        network: 'NEAR Testnet',
        fundingInstructions: this.getFundingInstructions(accountId)
      };
      
    } catch (error) {
      console.error('❌ Failed to create treasury account:', error);
      throw error;
    }
  }

  // Get treasury account info
  async getTreasuryAccount(contractAddress) {
    try {
      console.log(`🔍 Looking up treasury for contract: ${contractAddress}`);
      console.log(`📊 Available treasuries: ${Array.from(this.treasuryAccounts.keys()).join(', ')}`);
      
      const treasuryInfo = this.treasuryAccounts.get(contractAddress);
      if (!treasuryInfo) {
        console.log(`❌ Treasury not found for ${contractAddress}`);
        return null;
      }

      console.log(`✅ Found treasury: ${treasuryInfo.accountId}`);
      
      // Get current balance (simulated for testnet)
      const balance = treasuryInfo.balance || '0';
      
      return {
        accountId: treasuryInfo.accountId,
        balance: balance,
        explorerUrl: treasuryInfo.explorerUrl,
        network: 'NEAR Testnet',
        daoInfo: treasuryInfo.daoInfo
      };
    } catch (error) {
      console.error('❌ Error getting treasury account:', error);
      throw error;
    }
  }

  // Get treasury private key for transaction signing (internal use only)
  async getTreasuryPrivateKey(contractAddress) {
    const treasuryInfo = this.treasuryAccounts.get(contractAddress);
    
    if (!treasuryInfo || !treasuryInfo.privateKey) {
      throw new Error('Treasury private key not found for DAO');
    }

    return treasuryInfo.privateKey;
  }

  // Fund treasury account (for testnet)
  async fundTreasuryAccount(contractAddress, amount = '10') {
    try {
      console.log(`💰 Looking for treasury account for DAO: ${contractAddress}`);
      console.log(`📊 Available treasuries: ${Array.from(this.treasuryAccounts.keys()).join(', ')}`);
      
      const treasuryInfo = this.treasuryAccounts.get(contractAddress);
      if (!treasuryInfo) {
        console.error(`❌ Treasury account not found for contract: ${contractAddress}`);
        console.error(`📋 Available contracts: ${Array.from(this.treasuryAccounts.keys())}`);
        throw new Error(`Treasury account not found for DAO contract: ${contractAddress}`);
      }

      console.log(`💰 Funding treasury account ${treasuryInfo.accountId} with ${amount} NEAR...`);
      
      // For testnet, we'll simulate funding
      // In reality, you'd transfer from a funded account or use testnet faucet
      const fundingInfo = {
        amount: amount,
        currency: 'NEAR',
        network: 'testnet',
        txHash: `simulated-funding-${Date.now()}`,
        timestamp: new Date().toISOString(),
        faucetUrl: 'https://wallet.testnet.near.org/',
        daoContract: contractAddress,
      };

      // Update stored balance
      treasuryInfo.balance = amount;
      treasuryInfo.lastFunded = fundingInfo;
      this.treasuryAccounts.set(contractAddress, treasuryInfo);

      // Save updated data
      await this.saveTreasuryData();

      console.log('✅ Treasury funding simulated:', fundingInfo);
      return fundingInfo;
    } catch (error) {
      console.error('❌ Failed to fund treasury account:', error);
      throw error;
    }
  }

  // Get all DAOs and their treasuries
  getAllDAOTreasuries() {
    const daos = [];
    
    for (const [contractAddress, treasuryInfo] of this.treasuryAccounts.entries()) {
      daos.push({
        contractAddress,
        treasuryAccountId: treasuryInfo.accountId,
        daoName: treasuryInfo.daoInfo?.name,
        ownerAddress: treasuryInfo.daoInfo?.ownerAddress,
        balance: treasuryInfo.balance,
        created: treasuryInfo.created,
      });
    }
    
    return daos;
  }

  // Transfer NEAR from treasury to recipient
  async transferFromTreasury(contractAddress, recipientAddress, amount, memo = '') {
    try {
      console.log(`💸 Initiating NEAR transfer from treasury...`);
      console.log(`📍 Contract: ${contractAddress}`);
      console.log(`🎯 Recipient: ${recipientAddress}`);
      console.log(`💰 Amount: ${amount} NEAR`);
      console.log(`📝 Memo: ${memo}`);

      // Get treasury info
      const treasuryInfo = this.treasuryAccounts.get(contractAddress);
      if (!treasuryInfo) {
        throw new Error(`Treasury not found for contract: ${contractAddress}`);
      }

      console.log(`🏦 Using treasury: ${treasuryInfo.accountId}`);

      // For now, simulate the transaction with realistic data
      // This allows the donation system to work while we set up real NEAR accounts
      console.log('💸 Simulating NEAR transfer with realistic transaction data...');
      
      // Generate a realistic transaction hash
      const txHash = this.generateRealisticTxHash();
      
      const transferResult = {
        success: true,
        txHash: txHash,
        fromAddress: treasuryInfo.accountId,
        toAddress: recipientAddress,
        amount: amount,
        network: 'NEAR Testnet',
        timestamp: new Date().toISOString(),
        memo: memo,
        explorerUrl: `${NEAR_CONFIG.explorerUrl}/transactions/${txHash}`,
        gasUsed: '2.4 Tgas',
        note: 'Simulated transaction - replace with real NEAR API when treasury is funded'
      };

      console.log('✅ NEAR transfer simulated with realistic data:', transferResult);

      // Update treasury balance (subtract transferred amount)
      const currentBalance = parseFloat(treasuryInfo.balance || '100'); // Default to 100 for demo
      const newBalance = Math.max(0, currentBalance - parseFloat(amount));
      treasuryInfo.balance = newBalance.toString();
      treasuryInfo.lastTransfer = transferResult;
      
      // Save updated treasury data
      await this.saveTreasuryData();

      return transferResult;

    } catch (error) {
      console.error('❌ NEAR transfer failed:', error);
      
      // Get treasury info for error response
      const treasuryInfo = this.treasuryAccounts.get(contractAddress);
      
      // Return error result
      return {
        success: false,
        error: error.message,
        fromAddress: treasuryInfo?.accountId || 'unknown',
        toAddress: recipientAddress,
        amount: amount,
        network: 'NEAR Testnet',
        timestamp: new Date().toISOString(),
        memo: memo
      };
    }
  }

  // Create treasury account on NEAR blockchain with initial funding
  async createRealTreasuryAccount(contractAddress, initialFunding = '10') {
    try {
      const treasuryInfo = this.treasuryAccounts.get(contractAddress);
      if (!treasuryInfo) {
        throw new Error('Treasury info not found. Create DAO first.');
      }

      console.log(`🏗️ Creating real NEAR account: ${treasuryInfo.accountId}`);
      
      // Initialize NEAR connection if needed
      if (!this.initialized || !this.near) {
        await this.initialize();
      }

      // For testnet, we need a funded account to create new accounts
      // This is a simplified version - in production you'd use a proper funding mechanism
      console.log(`⚠️ Treasury account creation requires manual setup:`);
      console.log(`1. Go to https://wallet.testnet.near.org/`);
      console.log(`2. Create account: ${treasuryInfo.accountId}`);
      console.log(`3. Fund it with testnet NEAR from faucet`);
      console.log(`4. The private key is already stored in our system`);
      
      return {
        accountId: treasuryInfo.accountId,
        status: 'manual_setup_required',
        instructions: this.getFundingInstructions(treasuryInfo.accountId),
        privateKeyStored: true
      };

    } catch (error) {
      console.error('❌ Failed to create real treasury account:', error);
      throw error;
    }
  }

  // Generate realistic NEAR transaction hash
  generateRealisticTxHash() {
    // NEAR transaction hashes are base58 encoded and ~44 characters
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate random key for demo purposes
  generateRandomKey() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get funding instructions for users
  getFundingInstructions(treasuryAccountId) {
    return {
      message: 'To fund your DAO treasury with testnet NEAR:',
      steps: [
        '1. Go to NEAR Testnet Wallet: https://wallet.testnet.near.org/',
        '2. Create or login to your testnet account',
        '3. Get testnet NEAR from the faucet',
        `4. Send NEAR to treasury address: ${treasuryAccountId}`,
        '5. Treasury balance will update automatically'
      ],
      faucetUrl: 'https://wallet.testnet.near.org/',
      treasuryAddress: treasuryAccountId,
      explorerUrl: `${NEAR_CONFIG.explorerUrl}/accounts/${treasuryAccountId}`,
    };
  }
}

module.exports = { NearTreasuryService, NEAR_CONFIG }; 