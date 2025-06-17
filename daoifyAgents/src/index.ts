import { z } from 'zod'
import { Agent } from '@openserv-labs/sdk'
import express from 'express'
import 'dotenv/config'

// Configuration
const CONFIG = {
  WORKSPACE_ID: parseInt(process.env.WORKSPACE_ID || '4473'),
  TWITTER_AGENT_ID: parseInt(process.env.TWITTER_AGENT_ID || '757'),
  TELEGRAM_AGENT_ID: parseInt(process.env.TELEGRAM_AGENT_ID || '267'),
  MAIN_AGENT_PORT: parseInt(process.env.MAIN_AGENT_PORT || '7380'),
  EXPRESS_PORT: parseInt(process.env.EXPRESS_PORT || '4000')
}

// Create the main orchestrator agent
const agent = new Agent({
  systemPrompt: `You are a DAO orchestrator agent. Your task is to read proposals from the workspace and execute appropriate actions.

You can:
1. Read proposal.md files from workspace
2. Create tweets for social media promotion
3. Send tasks to Twitter agents for posting
4. Send tasks to Telegram agents for group messaging
5. Create tokens on blockchain networks
6. Analyze proposals and decide on appropriate actions

When given a proposal, analyze it and determine the best course of action. If it mentions giveaways, promotions, or announcements, consider creating social media content. If it involves blockchain operations, execute those tasks.`,
  port: CONFIG.MAIN_AGENT_PORT,
  apiKey: '0ddf335989f342ad803c6dc491c6befc'
})

// Add tweet creation capability
agent.addCapability({
  name: 'createTweet',
  description: 'Create a tweet based on proposal content or specific requirements',
  schema: z.object({
    content: z.string().describe('The main content or topic for the tweet'),
    hashtags: z.array(z.string()).optional().describe('Hashtags to include'),
    mentionOpenserv: z.boolean().optional().default(true).describe('Whether to mention @openserv'),
    tweetType: z
      .enum(['announcement', 'giveaway', 'general', 'promotional'])
      .describe('Type of tweet')
  }),
  async run({ args }) {
    const { content, hashtags = [], mentionOpenserv, tweetType } = args

    let tweet = ''

    switch (tweetType) {
      case 'giveaway':
        tweet = `🎉 GIVEAWAY ALERT! 🎉\n\n${content}\n\n💰 Don't miss out on this amazing opportunity!`
        break
      case 'announcement':
        tweet = `📢 ${content}\n\nStay tuned for more updates!`
        break
      case 'promotional':
        tweet = `🚀 ${content}\n\nJoin the revolution!`
        break
      default:
        tweet = content
    }

    // Add OpenServ mention if requested
    if (mentionOpenserv) {
      tweet += `\n\n@openserv #OpenServ`
    }

    // Add hashtags
    if (hashtags.length > 0) {
      tweet += ` ${hashtags.map(tag => `#${tag}`).join(' ')}`
    }

    // Ensure tweet is under 280 characters
    if (tweet.length > 280) {
      tweet = tweet.substring(0, 277) + '...'
    }

    console.log('📱 Created tweet:', tweet)
    const result = {
      tweet,
      length: tweet.length,
      tweetType,
      timestamp: new Date().toISOString()
    }

    return JSON.stringify(result, null, 2)
  }
})

// Add capability to delegate tasks to Twitter agent
agent.addCapability({
  name: 'delegateToTwitterAgent',
  description: 'Create a task for the Twitter agent to post content',
  schema: z.object({
    tweetContent: z.string().describe('The tweet content to post'),
    priority: z.enum(['high', 'medium', 'low']).default('medium').describe('Task priority')
  }),
  async run({ args }) {
    const { tweetContent, priority } = args

    if (!CONFIG.TWITTER_AGENT_ID) {
      throw new Error('TWITTER_AGENT_ID not configured in environment variables')
    }

    try {
      const task = await agent.createTask({
        workspaceId: CONFIG.WORKSPACE_ID,
        assignee: CONFIG.TWITTER_AGENT_ID,
        description: `[TWITTER] Post Tweet - ${priority} Priority`,
        body: `Please post the following tweet to the configured Twitter account:\n\n${tweetContent}`,
        input: `Please post the following tweet to the configured Twitter account:\n\n${tweetContent}`,
        expectedOutput: 'Confirmation of tweet posting with engagement metrics',
        dependencies: []
      })

      console.log(`🐦 Delegated Twitter task: ${task.id}`)

      const result = {
        taskId: task.id,
        agentId: CONFIG.TWITTER_AGENT_ID,
        action: 'twitter_post',
        content: tweetContent,
        priority
      }

      return JSON.stringify(result, null, 2)
    } catch (error) {
      console.error('Error delegating to Twitter agent:', error)
      throw error
    }
  }
})

// Add capability to delegate tasks to Telegram agent
agent.addCapability({
  name: 'delegateToTelegramAgent',
  description: 'Create a task for the Telegram agent to send messages to groups',
  schema: z.object({
    message: z.string().describe('The message to send'),
    groupName: z.string().describe('The name of the group to send the message to'),
    urgent: z.boolean().default(false).describe('Whether message is urgent')
  }),
  async run({ args }) {
    const { message, groupName, urgent } = args

    if (!CONFIG.TELEGRAM_AGENT_ID) {
      throw new Error('TELEGRAM_AGENT_ID not configured in environment variables')
    }

    try {
      const task = await agent.createTask({
        workspaceId: CONFIG.WORKSPACE_ID,
        assignee: CONFIG.TELEGRAM_AGENT_ID,
        description: `[TELEGRAM] Send Message - ${groupName} ${urgent ? '(URGENT)' : ''}`,
        body: `Please send the following message to ${groupName} Telegram groups:\n\n${message}`,
        input: `Please send the following message to ${groupName} Telegram groups:\n\n${message}`,
        expectedOutput: 'Confirmation of message delivery with group statistics',
        dependencies: []
      })

      console.log(`💬 Delegated Telegram task: ${task.id}`)

      const result = {
        taskId: task.id,
        agentId: CONFIG.TELEGRAM_AGENT_ID,
        action: 'telegram_message',
        content: message,
        groupName,
        urgent
      }

      return JSON.stringify(result, null, 2)
    } catch (error) {
      console.error('Error delegating to Telegram agent:', error)
      throw error
    }
  }
})

// Add capability to create tokens on blockchain
agent.addCapability({
  name: 'createToken',
  description: 'Create a new token on specified blockchain network',
  schema: z.object({
    tokenName: z.string().describe('Name of the token'),
    tokenSymbol: z.string().describe('Symbol/ticker of the token'),
    network: z
      .enum(['sepolia', 'mainnet', 'polygon', 'bsc'])
      .default('sepolia')
      .describe('Blockchain network'),
    initialSupply: z.number().default(1000000).describe('Initial token supply'),
    decimals: z.number().default(18).describe('Token decimals')
  }),
  async run({ args }) {
    const { tokenName, tokenSymbol, network, initialSupply, decimals } = args

    console.log(`🪙 Creating token ${tokenSymbol} (${tokenName}) on ${network}...`)

    // Simulate token creation process
    const tokenInfo = {
      name: tokenName,
      symbol: tokenSymbol,
      network,
      initialSupply,
      decimals,
      contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`, // Mock address
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`, // Mock tx hash
      createdAt: new Date().toISOString(),
      status: 'deployed'
    }

    console.log('✅ Token created successfully:', tokenInfo)

    return JSON.stringify(tokenInfo, null, 2)
  }
})

// Add capability to read and analyze proposals
agent.addCapability({
  name: 'readProposal',
  description: 'Read and analyze proposal from workspace files',
  schema: z.object({
    fileName: z.string().default('proposal.md').describe('Name of the proposal file to read')
  }),
  async run({ args }) {
    const { fileName } = args

    try {
      const files = await agent.getFiles({
        workspaceId: CONFIG.WORKSPACE_ID
      })

      const proposalFile = files.find(
        (file: any) => file.path?.includes(fileName) || file.name?.includes(fileName)
      )

      if (!proposalFile) {
        const result = {
          error: `Proposal file ${fileName} not found in workspace`,
          availableFiles: files.map((f: any) => f.path || f.name)
        }
        return JSON.stringify(result, null, 2)
      }

      console.log(`📄 Reading proposal: ${fileName}`)

      const result = {
        fileName,
        fileId: proposalFile.id,
        content: proposalFile.content || 'Content not available',
        summary:
          'Proposal analysis: Contains actionable items that may require social media promotion or blockchain operations',
        timestamp: new Date().toISOString()
      }

      return JSON.stringify(result, null, 2)
    } catch (error) {
      console.error('Error reading proposal:', error)
      throw error
    }
  }
})

// Add comprehensive proposal processing capability
agent.addCapability({
  name: 'processProposal',
  description: 'Process a proposal and execute appropriate actions (tweets, telegram, blockchain)',
  schema: z.object({
    proposalContent: z.string().describe('The proposal content or instruction'),
    autoExecute: z
      .boolean()
      .default(true)
      .describe('Whether to automatically execute recommended actions')
  }),
  async run({ args }) {
    const { proposalContent, autoExecute } = args
    const actions = []

    console.log('🔍 Analyzing proposal content...')

    // Analyze content for different action types
    const content = proposalContent.toLowerCase()

    // Check for giveaway/promotional content
    if (content.includes('giveaway') || content.includes('$') || content.includes('prize')) {
      const tweetAction = {
        type: 'tweet',
        content: proposalContent,
        tweetType: 'giveaway',
        hashtags: ['Giveaway', 'Crypto', 'Web3']
      }
      actions.push(tweetAction)

      if (autoExecute) {
        console.log('🚀 Auto-executing tweet creation for giveaway...')
        // Create tweet directly without runCapability
        const tweetResult = await agent.process({
          messages: [
            {
              role: 'user',
              content: `Create a tweet about: ${proposalContent} (giveaway type)`
            }
          ]
        })
        console.log('📱 Tweet created via process:', tweetResult.choices[0].message.content)
      }
    }

    // Check for token creation
    if (content.includes('create') && content.includes('token')) {
      const tokenMatch = content.match(/token (\w+)/i)
      const networkMatch = content.match(/on (\w+)/i)

      if (tokenMatch) {
        const tokenAction = {
          type: 'token_creation',
          tokenSymbol: tokenMatch[1].toUpperCase(),
          tokenName: `${tokenMatch[1]} Token`,
          network: networkMatch ? networkMatch[1].toLowerCase() : 'sepolia'
        }
        actions.push(tokenAction)

        if (autoExecute) {
          console.log('🪙 Auto-executing token creation...')
          // Create token directly without runCapability
          const tokenResult = await agent.process({
            messages: [
              {
                role: 'user',
                content: `Create token ${tokenAction.tokenSymbol} named ${tokenAction.tokenName} on ${tokenAction.network}`
              }
            ]
          })
          console.log('💰 Token created via process:', tokenResult.choices[0].message.content)
        }
      }
    }

    // Check for general announcements
    if (content.includes('announce') || content.includes('update') || content.includes('news')) {
      const telegramAction = {
        type: 'telegram',
        message: proposalContent,
        groupType: 'announcement',
        urgent: content.includes('urgent') || content.includes('important')
      }
      actions.push(telegramAction)

      if (autoExecute) {
        console.log('📢 Auto-executing telegram message...')
        // Send telegram message directly without runCapability
        const telegramResult = await agent.process({
          messages: [
            {
              role: 'user',
              content: `Send telegram message: ${proposalContent} (announcement type)`
            }
          ]
        })
        console.log(
          '💬 Telegram message sent via process:',
          telegramResult.choices[0].message.content
        )
      }
    }

    const result = {
      proposalContent,
      analyzedActions: actions,
      executed: autoExecute,
      timestamp: new Date().toISOString(),
      summary: `Identified ${actions.length} action(s) from proposal analysis`
    }

    return JSON.stringify(result, null, 2)
  }
})

// Start the agent
agent.start()

// Create Express app
const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    agent: 'running',
    ports: {
      agent: CONFIG.MAIN_AGENT_PORT,
      api: CONFIG.EXPRESS_PORT
    }
  })
})

// Process proposal endpoint
app.post('/process-proposal', async (req, res) => {
  try {
    const { proposal } = req.body
    console.log('🔍 Processing proposal via API:', proposal)

    if (!proposal) {
      return res.status(400).json({
        error: 'Missing proposal in request body',
        example: { proposal: 'Create a giveaway tweet for $300 OpenServ tokens' }
      })
    }

    console.log('📝 Processing proposal via API:', proposal)

    // Process the proposal using the agent
    const result = await agent.process({
      messages: [
        {
          role: 'user',
          content: proposal
        }
      ]
    })

    const response = {
      success: true,
      proposal,
      result: result.choices[0].message.content,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Proposal processed successfully')
    res.json(response)
  } catch (error) {
    console.error('❌ Error processing proposal:', error)
    res.status(500).json({
      error: 'Failed to process proposal',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
})

// Get agent status endpoint
app.get('/agent-status', (req, res) => {
  res.json({
    config: CONFIG,
    capabilities: [
      'createTweet',
      'delegateToTwitterAgent',
      'delegateToTelegramAgent',
      'createToken',
      'readProposal',
      'processProposal'
    ],
    timestamp: new Date().toISOString()
  })
})

// Start Express server
app.listen(CONFIG.EXPRESS_PORT, () => {
  console.log(`🌐 Express API Server Started on port ${CONFIG.EXPRESS_PORT}!`)
  console.log(`📡 API Endpoints:`)
  console.log(`   POST http://localhost:${CONFIG.EXPRESS_PORT}/process-proposal`)
  console.log(`   GET  http://localhost:${CONFIG.EXPRESS_PORT}/health`)
  console.log(`   GET  http://localhost:${CONFIG.EXPRESS_PORT}/agent-status`)
  console.log('')
})

console.log('🤖 DAO Orchestrator Agent Started!')
console.log('=====================================')
console.log(`Agent Port: ${CONFIG.MAIN_AGENT_PORT}`)
console.log(`API Port: ${CONFIG.EXPRESS_PORT}`)
console.log(`Workspace: ${CONFIG.WORKSPACE_ID}`)
console.log(`Twitter Agent: ${CONFIG.TWITTER_AGENT_ID}`)
console.log(`Telegram Agent: ${CONFIG.TELEGRAM_AGENT_ID}`)
console.log('')
console.log('Available capabilities:')
console.log('- createTweet: Generate tweets from proposals')
console.log('- delegateToTwitterAgent: Send tasks to Twitter agent')
console.log('- delegateToTelegramAgent: Send tasks to Telegram agent')
console.log('- createToken: Deploy tokens on blockchain')
console.log('- readProposal: Read proposals from workspace')
console.log('- processProposal: Full proposal analysis and execution')
console.log('')
console.log('🔗 Start tunneling: ngrok http', CONFIG.MAIN_AGENT_PORT)

// Example usage function
async function exampleUsage() {
  console.log('\n📝 Example Usage:')
  console.log('================')

  // Example 1: Process giveaway proposal
  const giveawayResult = await agent.process({
    messages: [
      {
        role: 'user',
        content: 'proposal send tweet about 300$ giveaway for openserv'
      }
    ]
  })

  console.log('🎉 Giveaway proposal result:', giveawayResult.choices[0].message.content)

  // Example 2: Token creation
  const tokenResult = await agent.process({
    messages: [
      {
        role: 'user',
        content: 'send telegram message about 300$ giveaway for TestDao Telegram Group/Channel'
      }
    ]
  })

  console.log('🪙 Token creation result:', tokenResult.choices[0].message.content)
}

// Run example after a delay to ensure agent is ready
setTimeout(() => {
  // exampleUsage().catch(console.error)
}, 3000)

export { agent, CONFIG }
