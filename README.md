# DAOify: Autonomous DAO Infrastructure with OpenServ Agents

DAOify is a next-generation agentic DAO platform built on blockchain, powered by OpenServ agents for true proposal-to-execution autonomy. It eliminates manual DAO operations by integrating an AI-based Orchestrator Agent that reads proposals and delegates tasks to specialized agents and workflows. The agent controls the dao and manages proposals and execution when passed.


---

## 🚀 What Makes DAOify Unique?

### 🤖 Agentic Autonomy

DAOify integrates the **DAO Orchestrator Agent**, a smart agent using OpenServ infrastructure to:

* Read and analyze proposals (markdown or messages)
* Detect intent (e.g. token creation, announcement)
* Automatically delegate execution to:

  * Blockchain deployment routines
  * Messaging or governance agents via OpenServ

### ⚙️ Powered by OpenServ

* Utilizes OpenServ API for secure and programmable agent management
* Leverages OpenServ Workflows to coordinate multi-step proposals
* Modular agent delegation: easily extend with new capabilities

### ⚡ Gasless DAO on Aurora

* Deployed on Aurora EVM for Ethereum compatibility
* DAO creation, proposal voting, and execution are **gasless**
* Real treasury operations on NEAR via internal bridging

---

## 🔧 Architecture Overview

```
┌────────────────────────┐
│   DAOify Frontend      │
└────────┬───────────────┘
         │ Proposals
         ▼
┌────────────────────────┐
│ DAO Orchestrator Agent │ ← Reads proposals
└────────┬────────────────┘
         │ AI Detection
         ▼
┌────────────────────────┐
│  Action Router (AI)    │
└────────┬───────────────┘
         ▼
┌────────────────────────────────────────────┐
│ Delegated Tasks (via OpenServ API):        │
│ - Blockchain Token Deployment              │
│ - Telegram/Discord Agent Messaging         │
│ - Custom Workflow Execution (OpenServ)     │
└────────────────────────────────────────────┘
```

---

## 🧠 Core Components

### 🧩 DAO Orchestrator Agent

The key logic module that reads proposals and maps them to workflows.

**Responsibilities:**

* Reads `proposal.md` or JSON input
* Runs prompt-based classification
* Delegates action to proper OpenServ agent/workflow
* Handles response logging and return values

**Endpoint:**

```http
POST /process
```

Example:

```json
{
  "messages": [{
    "role": "user",
    "content": "create a token ABC on sepolia"
  }]
}
```

### ⚙️ Token Creator Module

* Uses Ethers.js to deploy tokens on:

  * Ethereum Mainnet, Sepolia
  * Polygon
  * BSC
* Returns contract address, tx hash

### 🔁 OpenServ Delegator

* Authenticated API calls to OpenServ
* Delegates execution to named agents or workflows
* Tracks task IDs and statuses

---

## 🛠 Setup Instructions

### Prerequisites

* Node.js v18+
* OpenServ account and agent setup
* MetaMask (for Aurora interaction)

### Install

```bash
git clone https://github.com/your-org/daoify.git
cd daoify
```

```bash
# Install all components
cd frontend && npm install
cd ../server && npm install
cd ../donation-frontend && npm install
```

### Environment Variables (for `server/.env`)

```env
PRIVATE_KEY=aurora_wallet_key
OPENAI_API_KEY=your_openai_api_key
OPENSERV_API_KEY=your_openserv_key
WORKSPACE_ID=your_openserv_workspace_id
MAIN_AGENT_PORT=7380
```

### Start

```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd server && npm start

# Optional: Donation frontend
cd donation-frontend && npm start
```

---

## 📂 Project Structure

```
daoify/
├── frontend/                 # DAO dashboard (Next.js)
├── server/                  # Express server + Orchestrator Agent
│   ├── src/
│   │   ├── orchestrator.js  # Proposal processor
│   │   ├── tokenDeployer.js # Blockchain logic
│   │   └── agentDelegator.js# OpenServ API logic
├── donation-frontend/       # Optional donation UI
```

---

## ✅ Agent Capabilities

### `readProposal()`

* Reads proposals from markdown or JSON
* Supports flexible formats

### `processProposal()`

* Identifies action type (token creation, message dispatch)
* Calls sub-modules accordingly

### `createToken()`

* Deploys ERC-20 token contracts
* Configurable name, symbol, supply, chain

### `delegateToOpenServAgent()`

* Sends action metadata to OpenServ agent or workflow
* Tracks response and status via API

---

## 🧪 Example Request

```bash
curl -X POST http://localhost:7380/process \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "create a token DAOX on polygon"
    }]
  }'
```



## 🏁 Summary

DAOify leverages OpenServ and modular agents to fully automate DAO workflows. By integrating the DAO Orchestrator Agent, DAOify removes the bottlenecks in human-based execution, making governance faster, cheaper, and autonomous.
