"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAccount } from 'wagmi'
import { Calendar, Clock, Plus, ThumbsDown, CheckCircle2, Activity, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useDAOContract } from "@/lib/contract"
import { TreasuryCard } from "@/components/treasury-card"

interface Proposal {
  id: string
  description: string
  status: 'open' | 'passed' | 'failed'
  votes: number
  createdAt: string
  voters: string[]
  executionStatus?: {
    status: string
    step: number
    totalSteps: number
    timestamp: string
    votes?: number
    completed?: boolean
    error?: string
  }
}

interface DaoData {
  name: string
  description: string
  contractAddress: string
  chainId: number
  explorerUrl: string
  ownerAddress: string
  createdAt: string
  treasury?: {
    accountId: string
    balance: string
    explorerUrl: string
    network: string
  } | null
}

interface ContractProposal {
  description: string
  votes: bigint
  executed: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState("overview")
  const [daoData, setDaoData] = useState<DaoData | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isVoting, setIsVoting] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get DAO data from localStorage
  useEffect(() => {
    if (!isConnected || !address) {
      router.replace('/')
      return
    }

    const userDaoData = localStorage.getItem(`daoData_${address}`)
    if (userDaoData) {
      const parsedData = JSON.parse(userDaoData)
      console.log('DAO Data loaded:', parsedData)
      setDaoData(parsedData)
    } else {
      router.replace('/create')
    }
  }, [address, isConnected, router])

  // Use contract hooks
  const { voteWithAutoExecution, isVoting: isContractVoting, fetchProposals } = useDAOContract(daoData?.contractAddress || '')

  // Function to load proposals
  const loadProposals = async () => {
    if (!daoData?.contractAddress) {
      console.log('No contract address available')
      return
    }
    
    console.log('Loading proposals for contract:', daoData.contractAddress)
    console.log('DAO Data:', daoData)
    
    setIsLoading(true)
    try {
      const contractProposals = await fetchProposals()
      console.log('Fetched proposals:', contractProposals)
      
      if (contractProposals && contractProposals.length > 0) {
        const formattedProposals = contractProposals.map((p: ContractProposal, index: number) => ({
          id: index.toString(),
          description: p.description,
          status: p.executed ? 'passed' as const : 'open' as const,
          votes: Number(p.votes),
          createdAt: new Date().toISOString(),
          voters: [],
        }))
        console.log('Formatted proposals:', formattedProposals)
        setProposals(formattedProposals)
      } else {
        console.log('No proposals found or empty array returned')
        setProposals([])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
      console.error('Error details:', {
        contractAddress: daoData?.contractAddress,
        error: error
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch proposals whenever contract address changes
  useEffect(() => {
    loadProposals()
  }, [daoData?.contractAddress])

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadProposals()
    setIsRefreshing(false)
  }

  const handleVote = async (proposalId: string) => {
    if (!address || !daoData?.contractAddress) return

    setIsVoting(proposalId)
    try {
      // Use the new voting function with auto-execution
      await voteWithAutoExecution(BigInt(proposalId))
      
      // Wait a bit longer for the auto-execution to complete
      setTimeout(async () => {
        await loadProposals()
      }, 5000) // Wait 5 seconds for execution to complete
      
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    } finally {
      setIsVoting(null)
    }
  }

  // Function to get proposal execution status from localStorage
  const getProposalExecutionStatus = (proposalId: string) => {
    if (!daoData?.contractAddress) return null
    
    const statusKey = `proposal_${daoData.contractAddress}_${proposalId}_status`
    const statusData = localStorage.getItem(statusKey)
    
    if (statusData) {
      try {
        return JSON.parse(statusData)
      } catch (error) {
        console.error('Error parsing status data:', error)
        return null
      }
    }
    return null
  }

  // Function to get display status based on execution status
  const getDisplayStatus = (proposal: Proposal) => {
    const executionStatus = getProposalExecutionStatus(proposal.id)
    
    if (executionStatus) {
      switch (executionStatus.status) {
        case 'voting':
          return { text: 'Voting...', variant: 'secondary' as const, icon: '🗳️' }
        case 'vote_successful':
          return { text: 'Vote Successful', variant: 'secondary' as const, icon: '✅' }
        case 'proposal_passed':
          return { text: 'Proposal Passed', variant: 'default' as const, icon: '🎉' }
        case 'agent_executing':
          return { text: 'Agent Executing', variant: 'default' as const, icon: '🤖' }
        case 'agent_executed':
          return { text: 'Agent Executed', variant: 'default' as const, icon: '✨' }
        case 'execution_failed':
          return { text: 'Execution Failed', variant: 'destructive' as const, icon: '❌' }
        case 'voting_failed':
          return { text: 'Voting Failed', variant: 'destructive' as const, icon: '❌' }
        case 'insufficient_votes':
          return { text: 'Insufficient Votes', variant: 'secondary' as const, icon: '⚠️' }
        case 'check_failed':
          return { text: 'Check Failed', variant: 'destructive' as const, icon: '❌' }
        default:
          return { text: proposal.status, variant: 'secondary' as const, icon: '' }
      }
    }
    
    // Default status based on contract state
    if (proposal.status === 'passed') {
      return { text: 'Passed', variant: 'default' as const, icon: '✅' }
    } else if (proposal.status === 'open') {
      return { text: 'Open', variant: 'secondary' as const, icon: '🗳️' }
    } else {
      return { text: 'Failed', variant: 'destructive' as const, icon: '❌' }
    }
  }

  // Function to get status description
  const getStatusDescription = (proposal: Proposal) => {
    const executionStatus = getProposalExecutionStatus(proposal.id)
    
    if (executionStatus) {
      switch (executionStatus.status) {
        case 'voting':
          return 'Vote transaction is being processed...'
        case 'vote_successful':
          return 'Vote recorded successfully, checking proposal status...'
        case 'proposal_passed':
          return `Proposal passed with ${executionStatus.votes} vote(s)! Preparing agent execution...`
        case 'agent_executing':
          return '🤖 Agent is executing this task and posting to Twitter...'
        case 'agent_executed':
          return '✨ Task completed! Agent has posted to Twitter successfully.'
        case 'execution_failed':
          if (executionStatus.errorType === 'network') {
            return `🔌 Connection failed: ${executionStatus.suggestion || 'Backend server may not be running'}`
          }
          return `❌ Agent execution failed: ${executionStatus.error}`
        case 'voting_failed':
          return `❌ Voting failed: ${executionStatus.error}`
        case 'insufficient_votes':
          return `⚠️ Proposal needs more votes to execute`
        case 'check_failed':
          return `❌ Failed to check proposal status: ${executionStatus.error}`
        default:
          return 'Status unknown'
      }
    }
    
    // Default descriptions
    if (proposal.status === 'open') {
      return 'Voting in progress'
    } else if (proposal.status === 'passed') {
      return 'Proposal has been executed'
    } else {
      return 'Proposal failed'
    }
  }

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Connect Wallet</h1>
          <p className="text-muted-foreground mb-4">Connect your wallet to view your DAO</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!daoData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No DAO Found</h1>
          <p className="text-muted-foreground mb-4">Please create a DAO first</p>
          <Button asChild>
            <Link href="/create">Create DAO</Link>
          </Button>
        </div>
      </div>
    )
  }

  const openProposals = proposals.filter(p => p.status === 'open')
  const passedProposals = proposals.filter(p => p.status === 'passed')

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{daoData.name}</h1>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full">
                  <div className="relative">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <span className="text-xs font-medium text-green-700">Active</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{daoData.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contract: <a href={daoData.explorerUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{daoData.contractAddress}</a>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/dashboard/proposal/create">
                  <Plus className="mr-2 h-4 w-4" /> Create Proposal
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="proposals">Proposals</TabsTrigger>
              <TabsTrigger value="treasury">Treasury</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      <div className="text-2xl font-bold">{openProposals.length}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Passed Proposals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      <div className="text-2xl font-bold">{passedProposals.length}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="text-2xl font-bold">{daoData.treasury?.balance || '0'}</div>
                      <span className="text-sm text-muted-foreground ml-2">NEAR</span>
                    </div>
                    {daoData.treasury && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {daoData.treasury.network}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest proposals and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Debug info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
                    <div><strong>Debug Info:</strong></div>
                    <div>Contract: {daoData?.contractAddress || 'Not loaded'}</div>
                    <div>Proposals Count: {proposals.length}</div>
                    <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                    <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
                    <div>Address: {address || 'Not connected'}</div>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-4">Loading proposals...</div>
                  ) : proposals.length === 0 ? (
                    <div className="text-center py-4">
                      <p>No proposals found.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Create your first proposal to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proposals.slice(0, 3).map((proposal) => (
                        <div key={proposal.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                          <div className="rounded-full p-2 bg-primary/10">
                            {proposal.status === "open" ? (
                              <Clock className="h-4 w-4 text-primary" />
                            ) : proposal.status === "passed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{proposal.description}</h4>
                              {(() => {
                                const displayStatus = getDisplayStatus(proposal)
                                return (
                                  <Badge variant={displayStatus.variant}>
                                    {displayStatus.icon} {displayStatus.text}
                                  </Badge>
                                )
                              })()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getStatusDescription(proposal)}
                            </p>
                            {(() => {
                              const executionStatus = getProposalExecutionStatus(proposal.id)
                              const isInProgress = executionStatus && ['voting', 'vote_successful', 'proposal_passed', 'agent_executing'].includes(executionStatus.status)
                              
                              return (
                                <div className="mt-2">
                                  <Progress value={(proposal.votes / 10) * 100} />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>{proposal.votes} Votes</span>
                                    {executionStatus && executionStatus.step && (
                                      <span>Step {executionStatus.step}/{executionStatus.totalSteps}</span>
                                    )}
                                  </div>
                                  {proposal.status === "open" && !isInProgress && (
                                    <div className="flex gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleVote(proposal.id)}
                                        disabled={isVoting === proposal.id || isContractVoting}
                                      >
                                        Vote
                                      </Button>
                                    </div>
                                  )}
                                  {isInProgress && (
                                    <div className="flex gap-2 mt-2">
                                      <Button size="sm" variant="outline" disabled>
                                        Processing...
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            {proposal.status === "passed" && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Total Votes: {proposal.votes}</span>
                                </div>
                                <Progress value={(proposal.votes / 10) * 100} className="mt-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proposals" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All Proposals</h2>
                <Button asChild>
                  <Link href="/dashboard/proposal/create">
                    <Plus className="mr-2 h-4 w-4" /> Create Proposal
                  </Link>
                </Button>
              </div>
              {isLoading ? (
                <div className="text-center py-4">Loading proposals...</div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <Card key={proposal.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{proposal.description}</CardTitle>
                          {(() => {
                            const displayStatus = getDisplayStatus(proposal)
                            return (
                              <Badge variant={displayStatus.variant}>
                                {displayStatus.icon} {displayStatus.text}
                              </Badge>
                            )
                          })()}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>Votes: {proposal.votes}</span>
                          </div>
                          <Progress value={(proposal.votes / 10) * 100} />
                          {proposal.status === "open" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVote(proposal.id)}
                                disabled={isVoting === proposal.id || isContractVoting}
                              >
                                Vote
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="treasury" className="space-y-6">
              <TreasuryCard 
                contractAddress={daoData.contractAddress}
                initialTreasury={daoData.treasury}
              />
            </TabsContent>

            <TabsContent value="members" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>DAO Members</CardTitle>
                  <CardDescription>Members who can vote on proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">👑</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Owner</p>
                          <p className="text-xs text-muted-foreground">{daoData.ownerAddress}</p>
                        </div>
                      </div>
                      <Badge>Owner</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
