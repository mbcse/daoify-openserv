#!/usr/bin/env node

const { NearTreasuryService } = require('./src/nearService');

async function setupRealTreasury() {
    console.log('🏗️ Setting up real NEAR treasury accounts...');
    
    const nearTreasury = new NearTreasuryService();
    await nearTreasury.initialize();
    
    const daos = nearTreasury.getAllDAOTreasuries();
    
    if (daos.length === 0) {
        console.log('❌ No DAOs found. Create a DAO first.');
        return;
    }
    
    console.log(`\n📋 Found ${daos.length} DAO(s):`);
    
    for (const dao of daos) {
        console.log(`\n🏛️ DAO: ${dao.daoName}`);
        console.log(`📍 Contract: ${dao.contractAddress}`);
        console.log(`🏦 Treasury: ${dao.treasuryAccountId}`);
        console.log(`💰 Current Balance: ${dao.balance} NEAR`);
        
        console.log(`\n🔧 To enable REAL transactions for this DAO:`);
        console.log(`1. Go to: https://wallet.testnet.near.org/`);
        console.log(`2. Create account: ${dao.treasuryAccountId}`);
        console.log(`3. Import private key (stored securely in our system)`);
        console.log(`4. Get testnet NEAR from faucet`);
        console.log(`5. Fund the account with at least 10 NEAR`);
        console.log(`6. Test donations will use REAL NEAR transfers!`);
        
        console.log(`\n🔗 Explorer: https://explorer.testnet.near.org/accounts/${dao.treasuryAccountId}`);
        console.log(`─────────────────────────────────────────────────────────────`);
    }
    
    console.log(`\n✅ Setup complete! Once funded, donations will use REAL NEAR transactions.`);
}

if (require.main === module) {
    setupRealTreasury().catch(console.error);
}

module.exports = { setupRealTreasury }; 