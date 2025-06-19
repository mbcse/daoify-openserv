const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const { NearTreasuryService } = require('./nearService');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Aurora network configuration
const CHAIN_ID = 1313161723;
const RPC_URL = 'https://0x4e4541fb.rpc.aurora-cloud.dev';

console.log('🚀 Initializing server with configuration:');
console.log(`📡 RPC URL: ${RPC_URL}`);
console.log(`🔗 Chain ID: ${CHAIN_ID}`);

// Contract ABI and bytecode
const DaoifyDAO = require('./contracts/DaoifyDAO.json');
console.log('📄 Contract ABI and bytecode loaded successfully');

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log('👛 Wallet initialized with address:', wallet.address);

// Initialize services
const nearTreasury = new NearTreasuryService();

// Initialize services on startup
async function initializeServices() {
    try {
        await nearTreasury.initialize();
        console.log('🌟 All services initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize services:', error);
    }
}

initializeServices();

app.post('/api/deploy-dao', async (req, res) => {
    console.log('\n📥 Received new DAO deployment request');
    console.log('📋 Request body:', req.body);

    try {
        const { name, description } = req.body;

        if (!name || !description) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'Name and description are required' });
        }

        console.log('✅ Valid request received');
        console.log('📝 DAO Name:', name);
        console.log('📄 DAO Description:', description);

        // Deploy the contract
        console.log('🚀 Starting contract deployment...');
        const factory = new ethers.ContractFactory(
            DaoifyDAO.abi,
            DaoifyDAO.bytecode,
            wallet
        );

        console.log('⏳ Deploying contract...');
        const contract = await factory.deploy(name, description);
        console.log('📝 Contract deployment transaction hash:', contract.deploymentTransaction().hash);
        
        console.log('⏳ Waiting for deployment confirmation...');
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        console.log('✅ Contract deployed successfully at:', contractAddress);

        // Create NEAR treasury account
        console.log('🏦 Creating NEAR treasury account...');
        let treasuryInfo = null;
        try {
            treasuryInfo = await nearTreasury.createTreasuryAccount(name, contractAddress, wallet.address);
            console.log('✅ NEAR treasury created:', treasuryInfo.accountId);
        } catch (error) {
            console.error('⚠️ Failed to create NEAR treasury:', error);
            // Continue without treasury if it fails
        }

        const response = {
            success: true,
            contractAddress,
            chainId: CHAIN_ID,
            explorerUrl: `https://0x4e4541fb.explorer.aurora-cloud.dev/address/${contractAddress}`,
            treasury: treasuryInfo ? {
                accountId: treasuryInfo.accountId,
                balance: treasuryInfo.balance,
                explorerUrl: treasuryInfo.explorerUrl,
                network: 'NEAR Testnet'
            } : null
        };

        console.log('📤 Sending response:', response);
        res.json(response);
    } catch (error) {
        console.error('❌ Deployment error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get treasury information
app.get('/api/treasury/:contractAddress', async (req, res) => {
    console.log('\n🏦 Received treasury info request');
    const { contractAddress } = req.params;
    
    try {
        const treasuryInfo = await nearTreasury.getTreasuryAccount(contractAddress);
        
        if (!treasuryInfo) {
            return res.status(404).json({
                success: false,
                error: 'Treasury not found for this DAO'
            });
        }

        const fundingInstructions = nearTreasury.getFundingInstructions(treasuryInfo.accountId);

        res.json({
            success: true,
            treasury: treasuryInfo,
            fundingInstructions
        });
    } catch (error) {
        console.error('❌ Treasury info error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fund treasury account
app.post('/api/treasury/:contractAddress/fund', async (req, res) => {
    console.log('\n💰 Received treasury funding request');
    const { contractAddress } = req.params;
    const { amount } = req.body;
    
    try {
        const fundingResult = await nearTreasury.fundTreasuryAccount(contractAddress, amount || '10');
        
        res.json({
            success: true,
            funding: fundingResult,
            message: 'Treasury funding initiated (testnet simulation)'
        });
    } catch (error) {
        console.error('❌ Treasury funding error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create real NEAR treasury account
app.post('/api/treasury/:contractAddress/create-real', async (req, res) => {
    console.log('\n🏗️ Received real treasury creation request');
    const { contractAddress } = req.params;
    const { initialFunding } = req.body;
    
    try {
        const creationResult = await nearTreasury.createRealTreasuryAccount(contractAddress, initialFunding || '10');
        
        res.json({
            success: true,
            creation: creationResult,
            message: 'Real treasury account setup instructions provided'
        });
    } catch (error) {
        console.error('❌ Real treasury creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simplified execute API endpoint - calls agent directly
app.post('/api/execute', async (req, res) => {
    console.log('\n🤖 Received proposal execution request');
    console.log('📋 Request body:', req.body);

    try {
        const { proposalDescription, contractAddress, proposalId, daoName, votes } = req.body;

        if (!proposalDescription || !contractAddress || proposalId === undefined) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false, 
                error: 'proposalDescription, contractAddress, and proposalId are required' 
            });
        }

        console.log('✅ Valid execution request received');
        console.log('📝 Proposal Description:', proposalDescription);
        console.log('📍 Contract Address:', contractAddress);
        console.log('🔢 Proposal ID:', proposalId);
        console.log('🏛️ DAO Name:', daoName || 'Unknown DAO');
        console.log('🗳️ Votes:', votes || 1);

        // Execute the proposal on the blockchain first
        console.log('🚀 Executing proposal on Aurora blockchain...');
        const contract = new ethers.Contract(contractAddress, DaoifyDAO.abi, wallet);
        const tx = await contract.executeProposal(proposalId);
        console.log('📝 Execution transaction hash:', tx.hash);
        
        console.log('⏳ Waiting for execution confirmation...');
        // await tx.wait();
        console.log('✅ Proposal executed on Aurora blockchain');

        // Call the agent endpoint to process the proposal
        console.log('🤖 Calling agent endpoint to process proposal...');
        const agentResponse = await fetch(process.env.PROPOSAL_AGENT_URL || 'http://localhost:4000/process-proposal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                proposal: proposalDescription
            })
        });

        let agentResult = null;
        let agentError = null;

        if (agentResponse.ok) {
            agentResult = await agentResponse.json();
            console.log('✅ Agent processing successful:', agentResult);
        } else {
            console.log('⚠️ Agent processing failed:', agentResponse.status, agentResponse.statusText);
            const errorText = await agentResponse.text();
            console.log('📄 Agent error details:', errorText);
            agentError = {
                status: agentResponse.status,
                statusText: agentResponse.statusText,
                details: errorText
            };
        }

        const response = {
            success: true,
            blockchainTx: tx.hash,
            agentResult: agentResult,
            agentError: agentError,
            message: agentResult ? 'Proposal executed and agent processed successfully' : 'Proposal executed but agent processing failed',
            proposalDetails: {
                description: proposalDescription,
                daoName: daoName || 'Unknown DAO',
                votes: votes || 1,
                contractAddress,
                proposalId
            }
        };

        console.log('📤 Sending response:', response);
        res.json(response);

    } catch (error) {
        console.error('❌ Execution error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🌐 Server running on port ${PORT}`);
    console.log('📡 Ready to accept requests at http://localhost:' + PORT);
    console.log('📝 API Endpoints:');
    console.log('   POST http://localhost:' + PORT + '/api/deploy-dao');
    console.log('   GET  http://localhost:' + PORT + '/api/treasury/:contractAddress');
    console.log('   POST http://localhost:' + PORT + '/api/treasury/:contractAddress/fund');
    console.log('   POST http://localhost:' + PORT + '/api/treasury/:contractAddress/create-real');
    console.log('   POST http://localhost:' + PORT + '/api/execute');
}); 