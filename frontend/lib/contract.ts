import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { publicClient } from './wagmi'
import { getApiUrl, API_ENDPOINTS } from './config'
import { ensureCorrectNetwork } from './network-utils'

// DAO Contract ABI
const DAO_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_description", "type": "string" }
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getProposalCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ],
    "name": "getProposal",
    "outputs": [
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "votes", "type": "uint256" },
      { "internalType": "bool", "name": "executed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export function useDAOContract(contractAddress: string) {
  // Read contract data
  const { data: proposalCount } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: DAO_ABI,
    functionName: 'getProposalCount',
  })

  // Write contract functions
  const { writeContract: createProposal, data: createProposalData } = useWriteContract()

  const { writeContract: vote, data: voteData } = useWriteContract()

  const { writeContract: executeProposal, data: executeProposalData } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isCreatingProposal } = useWaitForTransactionReceipt({
    hash: createProposalData,
  })

  const { isLoading: isVoting } = useWaitForTransactionReceipt({
    hash: voteData,
  })

  const { isLoading: isExecuting } = useWaitForTransactionReceipt({
    hash: executeProposalData,
  })

  const handleCreateProposal = async (description: string) => {
    try {
      // Ensure user is on correct network before transaction
      await ensureCorrectNetwork()
      
      const tx = await createProposal({
        address: contractAddress as `0x${string}`,
        abi: DAO_ABI,
        functionName: 'createProposal',
        args: [description],
      })
      return tx
    } catch (error) {
      console.error('Error creating proposal:', error)
      throw error
    }
  }

  const handleVote = async (proposalId: bigint) => {
    try {
      // Ensure user is on correct network before transaction
      await ensureCorrectNetwork()
      
      await vote({
        address: contractAddress as `0x${string}`,
        abi: DAO_ABI,
        functionName: 'vote',
        args: [proposalId],
      })
    } catch (error) {
      console.error('Error voting:', error)
      throw error
    }
  }

  const handleExecuteProposal = async (proposalId: bigint) => {
    try {
      await executeProposal({
        address: contractAddress as `0x${string}`,
        abi: DAO_ABI,
        functionName: 'executeProposal',
        args: [proposalId],
      })
    } catch (error) {
      console.error('Error executing proposal:', error)
      throw error
    }
  }

  // New function to execute proposal and trigger agent with AI-generated tweets
  const executeProposalWithAgent = async (proposalId: number, proposalDescription: string, votes?: number) => {
    try {
      console.log('🤖 Starting proposal execution with agent integration...')
      
      // Get DAO data from localStorage to pass DAO name
      let daoName = 'DAO Community'
      try {
        const userAddress = window.ethereum?.selectedAddress
        if (userAddress) {
          const daoDataKey = `daoData_${userAddress}`
          const daoDataStr = localStorage.getItem(daoDataKey)
          if (daoDataStr) {
            const daoData = JSON.parse(daoDataStr)
            daoName = daoData.name || 'DAO Community'
          }
        }
             } catch {
         console.log('Could not get DAO name from localStorage, using default')
       }
      
      console.log('📋 Execution details:', {
        proposalId,
        proposalDescription,
        contractAddress,
        daoName,
        votes: votes || 1,
        backendUrl: getApiUrl(API_ENDPOINTS.EXECUTE)
      })
      
      // Call the backend API to execute and trigger Twitter agent with AI
      console.log('📡 Making API call to backend with AI tweet generation...')
      const response = await fetch(getApiUrl(API_ENDPOINTS.EXECUTE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalDescription,
          contractAddress,
          proposalId,
          daoName,
          votes: votes || 1
        })
      })

      console.log('📡 Backend response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend API error:', errorText)
        throw new Error(`Backend API error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Backend API success:', result)
      console.log('🤖 AI-generated tweet:', result.aiTweet?.content)
      console.log('📊 Proposal analysis:', result.aiTweet?.analysis)
      return result
    } catch (error) {
      console.error('❌ Error executing proposal with agent:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      throw error
    }
  }

  // Enhanced vote function that auto-executes at 1 vote with status tracking
  const handleVoteWithAutoExecution = async (proposalId: bigint) => {
    const statusKey = `proposal_${contractAddress}_${proposalId}_status`
    
    try {
      // Step 1: Update status to "voting"
      localStorage.setItem(statusKey, JSON.stringify({
        status: 'voting',
        timestamp: new Date().toISOString(),
        step: 1,
        totalSteps: 4
      }))

      console.log('🗳️ Starting vote process for proposal', proposalId)

      // First, vote on the proposal
      await vote({
        address: contractAddress as `0x${string}`,
        abi: DAO_ABI,
        functionName: 'vote',
        args: [proposalId],
      })

      console.log('✅ Vote transaction submitted successfully')

      // Step 2: Update status to "vote successful"
      localStorage.setItem(statusKey, JSON.stringify({
        status: 'vote_successful',
        timestamp: new Date().toISOString(),
        step: 2,
        totalSteps: 4
      }))

      // Wait for the vote transaction to be mined and check proposal status
      console.log('⏳ Waiting for vote to be confirmed and checking proposal status...')
      
      // Use a more reliable approach with multiple checks
      const checkProposalStatus = async (attempt = 1, maxAttempts = 5) => {
        try {
          console.log(`🔍 Checking proposal status (attempt ${attempt}/${maxAttempts})...`)
          
          const proposalData = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: DAO_ABI,
            functionName: 'getProposal',
            args: [proposalId],
          }) as [string, bigint, boolean]

          const [description, votes, executed] = proposalData
          console.log(`📊 Proposal ${proposalId} status:`, { 
            description, 
            votes: Number(votes), 
            executed,
            attempt 
          })

          // If proposal has 1 vote and is not executed, auto-execute it
          if (Number(votes) >= 1 && !executed) {
            console.log('🎉 Proposal reached 1 vote! Starting auto-execution...')
            
            // Step 3: Update status to "proposal passed"
            localStorage.setItem(statusKey, JSON.stringify({
              status: 'proposal_passed',
              timestamp: new Date().toISOString(),
              step: 3,
              totalSteps: 4,
              votes: Number(votes)
            }))

            // Small delay before execution
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Step 4: Update status to "agent executing"
            localStorage.setItem(statusKey, JSON.stringify({
              status: 'agent_executing',
              timestamp: new Date().toISOString(),
              step: 4,
              totalSteps: 4,
              votes: Number(votes)
            }))

            console.log('🤖 Calling executeProposalWithAgent...')
            
            try {
              const result = await executeProposalWithAgent(Number(proposalId), description, Number(votes))
              console.log('✅ Agent execution completed:', result)
              
              // Check if the result indicates success
              if (result && result.success) {
                console.log('🎊 Backend confirmed successful execution!')
                
                // Final: Update status to "agent executed"
                localStorage.setItem(statusKey, JSON.stringify({
                  status: 'agent_executed',
                  timestamp: new Date().toISOString(),
                  step: 4,
                  totalSteps: 4,
                  votes: Number(votes),
                  executionResult: result,
                  completed: true,
                  twitterPost: result.twitterPost,
                  aiTweet: result.aiTweet,
                  actionType: result.actionType
                }))
                
                console.log('🎊 Full execution flow completed successfully!')
              } else {
                console.warn('⚠️ Backend returned result but success flag not set:', result)
                
                // Still mark as executed but with warning
                localStorage.setItem(statusKey, JSON.stringify({
                  status: 'agent_executed',
                  timestamp: new Date().toISOString(),
                  step: 4,
                  totalSteps: 4,
                  votes: Number(votes),
                  executionResult: result,
                  completed: true,
                  warning: 'Backend response unclear'
                }))
              }
            } catch (error) {
              console.error('❌ Agent execution failed:', error)
              
              // Check if it's a network error vs actual execution failure
              const errorMessage = error instanceof Error ? error.message : String(error)
              const isNetworkError = errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')
              
              localStorage.setItem(statusKey, JSON.stringify({
                status: 'execution_failed',
                timestamp: new Date().toISOString(),
                step: 4,
                totalSteps: 4,
                votes: Number(votes),
                error: errorMessage,
                errorType: isNetworkError ? 'network' : 'execution',
                suggestion: isNetworkError ? 'Check if backend server is running on port 3000' : 'Check backend logs for details'
              }))
            }
          } else if (attempt < maxAttempts) {
            // If not enough votes yet, try again after a delay
            console.log(`⏳ Not enough votes yet (${Number(votes)}), retrying in 2 seconds...`)
            setTimeout(() => checkProposalStatus(attempt + 1, maxAttempts), 2000)
          } else {
            console.log('⚠️ Max attempts reached, proposal may not have enough votes')
            localStorage.setItem(statusKey, JSON.stringify({
              status: 'insufficient_votes',
              timestamp: new Date().toISOString(),
              votes: Number(votes),
              error: 'Proposal did not reach required votes after maximum attempts'
            }))
          }
        } catch (error) {
          console.error(`❌ Error checking proposal status (attempt ${attempt}):`, error)
          
          if (attempt < maxAttempts) {
            console.log(`🔄 Retrying in 3 seconds...`)
            setTimeout(() => checkProposalStatus(attempt + 1, maxAttempts), 3000)
          } else {
            localStorage.setItem(statusKey, JSON.stringify({
              status: 'check_failed',
              timestamp: new Date().toISOString(),
              error: error instanceof Error ? error.message : String(error)
            }))
          }
        }
      }

      // Start checking after a short delay to allow transaction to be mined
      setTimeout(() => checkProposalStatus(), 3000)

    } catch (error) {
      console.error('❌ Voting failed:', error)
      // Update status to "voting failed"
      localStorage.setItem(statusKey, JSON.stringify({
        status: 'voting_failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      }))
      throw error
    }
  }

  // Fetch all proposals using viem's readContract
  const fetchProposals = async () => {
    if (!contractAddress) {
      console.log('No contract address provided')
      return []
    }
    
    // Validate contract address format
    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      console.error('Invalid contract address format:', contractAddress)
      return []
    }
    
    console.log('Fetching proposals from contract:', contractAddress)
    
    try {
      // Get proposal count directly from contract
      console.log('Getting proposal count...')
      const count = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: DAO_ABI,
        functionName: 'getProposalCount',
      }) as bigint
      
      const proposalCount = Number(count)
      console.log('Proposal count from contract:', proposalCount)
      
      if (proposalCount === 0) {
        console.log('No proposals found in contract')
        return []
      }
      
      console.log(`Fetching ${proposalCount} proposals...`)
      const proposals = []
      for (let i = 0; i < proposalCount; i++) {
        try {
          console.log(`Fetching proposal ${i}...`)
          const data = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: DAO_ABI,
            functionName: 'getProposal',
            args: [BigInt(i)],
          })
          if (data) {
            const [description, votes, executed] = data as [string, bigint, boolean]
            const proposal = { description, votes, executed }
            proposals.push(proposal)
            console.log(`Proposal ${i} fetched:`, { description, votes: Number(votes), executed })
          } else {
            console.log(`Proposal ${i} returned no data`)
          }
        } catch (error) {
          console.error(`Error reading proposal ${i}:`, error)
        }
      }
      console.log('All proposals fetched:', proposals)
      return proposals
    } catch (error) {
      console.error('Error fetching proposals:', error)
      console.error('Contract address used:', contractAddress)
      console.error('Error details:', error)
      return []
    }
  }

  return {
    proposalCount,
    createProposal: handleCreateProposal,
    vote: handleVote,
    voteWithAutoExecution: handleVoteWithAutoExecution,
    executeProposal: handleExecuteProposal,
    executeProposalWithAgent,
    isCreatingProposal,
    isVoting,
    isExecuting,
    fetchProposals,
  }
}

// Settings for the DAO
export const DAO_SETTINGS = {
  minVotingPeriod: 24 * 60 * 60, // 24 hours in seconds
  quorum: 1, // Minimum number of votes required
  votingThreshold: 50, // Percentage of yes votes required to pass
  proposalThreshold: parseEther('0.1'), // Minimum tokens required to create a proposal
} 