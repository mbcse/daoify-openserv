# DAO Orchestrator Agent

A smart agent that reads proposals and orchestrates actions across Twitter, Telegram, and blockchain networks.

## Features

- 📄 **Proposal Analysis**: Reads and analyzes proposals from workspace files
- 🐦 **Tweet Creation**: Generates engaging tweets for giveaways, announcements, and promotions
- 📱 **Multi-Agent Delegation**: Delegates tasks to Twitter and Telegram agents
- 🪙 **Token Creation**: Creates tokens on various blockchain networks (Sepolia, Mainnet, Polygon, BSC)
- 🤖 **Intelligent Processing**: Automatically determines the best actions based on proposal content

## Environment Variables

Create a `.env` file with the following variables:

```env
# OpenServ API Configuration
OPENSERV_API_KEY=your_openserv_api_key_here

# Workspace Configuration  
WORKSPACE_ID=your_workspace_id_here

# Agent IDs - Get these from your OpenServ dashboard
TWITTER_AGENT_ID=your_twitter_agent_id_here
TELEGRAM_AGENT_ID=your_telegram_agent_id_here

# Main Orchestrator Agent Port
MAIN_AGENT_PORT=7380
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy the environment variables above into a `.env` file
   - Get your API key from [OpenServ Platform](https://platform.openserv.ai)
   - Get your workspace ID from your dashboard
   - Create Twitter and Telegram agents and note their IDs

3. **Start the agent**:
   ```bash
   npm run dev
   ```

4. **Expose the agent** (in a separate terminal):
   ```bash
   ngrok http 7380
   ```

## Usage Examples

### Giveaway Tweet
```bash
curl -X POST http://localhost:7380/process \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user", 
      "content": "proposal send tweet about 300$ giveaway for openserv"
    }]
  }'
```

### Token Creation
```bash
curl -X POST http://localhost:7380/process \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "create a token ABC on sepolia"
    }]
  }'
```

### Announcement
```bash
curl -X POST http://localhost:7380/process \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "announce new product launch to telegram groups"
    }]
  }'
```

## Capabilities

### 1. createTweet
Creates formatted tweets based on content type:
- **Giveaway**: Adds celebration emojis and call-to-action
- **Announcement**: Professional format with updates
- **Promotional**: Engaging format with revolution theme
- **General**: Clean, simple format

### 2. delegateToTwitterAgent
Creates tasks for your Twitter agent to execute:
- Assigns tweet posting to your Twitter agent
- Sets priority levels (high/medium/low)
- Tracks task completion

### 3. delegateToTelegramAgent
Creates tasks for your Telegram agent:
- Sends messages to specific group types
- Supports urgent message flagging
- Handles community, announcement, and dev groups

### 4. createToken
Deploys tokens on blockchain networks:
- Supports Sepolia, Mainnet, Polygon, BSC
- Configurable supply and decimals
- Returns contract address and transaction hash

### 5. readProposal
Reads proposal files from workspace:
- Searches for proposal.md files
- Analyzes content for actionable items
- Returns structured proposal data

### 6. processProposal
Comprehensive proposal processing:
- Analyzes content for different action types
- Auto-executes recommended actions
- Handles complex multi-step workflows

## Architecture

```
┌─────────────────────┐
│   Main Agent        │
│   (Orchestrator)    │
│   Port: 7380        │
└─────────┬───────────┘
          │
          ├─── Twitter Agent (delegates tweets)
          ├─── Telegram Agent (delegates messages)  
          └─── Blockchain (creates tokens)
```

## Workflow

1. **Proposal Input**: Agent receives proposal content
2. **Content Analysis**: Analyzes for keywords (giveaway, token, announce)
3. **Action Determination**: Decides on appropriate actions
4. **Execution**: Creates tweets, delegates to agents, or creates tokens
5. **Confirmation**: Returns execution results


