"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, ThumbsUp, ThumbsDown, CheckCircle2, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Proposal {
  id: string
  title: string
  description: string
  data: string
  requestedAmount: number
  status: 'open' | 'passed' | 'failed'
  votesYes: number
  votesNo: number
  createdAt: string
  voters: string[]
  agentExecuted?: boolean
  agentExecutionTime?: string
}

export default function ProposalsPage() {
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [voteType, setVoteType] = useState<'yes' | 'no' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [isAgentExecuting, setIsAgentExecuting] = useState(false)

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress')
    if (!storedWalletAddress) {
      router.push('/')
      return
    }

    setWalletAddress(storedWalletAddress)
    const storedProposals = localStorage.getItem(`proposals_${storedWalletAddress}`)
    if (storedProposals) {
      const parsedProposals = JSON.parse(storedProposals) as Proposal[]
      setProposals(parsedProposals)
    }
  }, [router])

  const executeAgentAction = async (proposal: Proposal) => {
    if (!walletAddress) return

    setIsAgentExecuting(true)
    try {
      const response = await fetch('http://localhost:3001/agents/66312d1b-78a6-0e2e-9336-a661c7f798d7/twitter/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: proposal.data,
          mediaUrls: []
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update proposal with execution status
        const updatedProposals = proposals.map(p => {
          if (p.id === proposal.id) {
            return {
              ...p,
              agentExecuted: true,
              agentExecutionTime: data.timestamp || new Date().toISOString()
            }
          }
          return p
        })

        // Save updated proposals to localStorage
        localStorage.setItem(`proposals_${walletAddress}`, JSON.stringify(updatedProposals))
        setProposals(updatedProposals)
      } else {
        throw new Error(data.message || 'Failed to execute agent')
      }
    } catch (error) {
      console.error('Error executing agent:', error)
      alert('Failed to execute agent action. Please try again.')
    } finally {
      setIsAgentExecuting(false)
    }
  }

  const handleVote = async (proposal: Proposal, vote: 'yes' | 'no') => {
    if (!walletAddress) return

    setIsVoting(true)
    setVoteType(vote)
    setShowVoteModal(true)

    try {
      // Simulate voting process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update proposal votes
      const updatedProposals = proposals.map(p => {
        if (p.id === proposal.id) {
          const updatedProposal = {
            ...p,
            votesYes: vote === 'yes' ? p.votesYes + 1 : p.votesYes,
            votesNo: vote === 'no' ? p.votesNo + 1 : p.votesNo,
            voters: [...p.voters, walletAddress],
            status: vote === 'yes' ? 'passed' as const : 'open' as const
          }

          // If this is a Yes vote, execute the agent after 5 seconds
          if (vote === 'yes') {
            setTimeout(() => {
              executeAgentAction(updatedProposal)
            }, 5000)
          }

          return updatedProposal
        }
        return p
      })

      // Save updated proposals to localStorage
      localStorage.setItem(`proposals_${walletAddress}`, JSON.stringify(updatedProposals))
      setProposals(updatedProposals)

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowVoteModal(false)
        setIsVoting(false)
        setVoteType(null)
      }, 2000)
    } catch (error) {
      console.error('Error voting:', error)
      setIsVoting(false)
      setShowVoteModal(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <Link href="/dashboard/proposal/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{proposal.title}</CardTitle>
                  <CardDescription>{proposal.description}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={proposal.status === 'passed' ? 'default' : 'secondary'}>
                    {proposal.status}
                  </Badge>
                  {proposal.agentExecuted && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      Agent Executed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Requested Amount: {proposal.requestedAmount} ADA</span>
                  <span>Created: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Votes: {proposal.votesYes + proposal.votesNo}</span>
                    {proposal.status === 'passed' && (
                      <span className="text-green-500">Passed with {proposal.votesYes} Yes votes</span>
                    )}
                  </div>
                  <Progress value={(proposal.votesYes / (proposal.votesYes + proposal.votesNo || 1)) * 100} />
                  <div className="flex justify-between text-sm">
                    <span className="text-green-500">
                      {proposal.votesYes} Yes ({Math.round((proposal.votesYes / (proposal.votesYes + proposal.votesNo || 1)) * 100)}%)
                    </span>
                    <span className="text-red-500">
                      {proposal.votesNo} No ({Math.round((proposal.votesNo / (proposal.votesYes + proposal.votesNo || 1)) * 100)}%)
                    </span>
                  </div>
                </div>

                {proposal.status === 'open' && !proposal.voters.includes(walletAddress || '') && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleVote(proposal, 'yes')}
                      disabled={isVoting}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" /> Vote Yes
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleVote(proposal, 'no')}
                      disabled={isVoting}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" /> Vote No
                    </Button>
                  </div>
                )}

                {isAgentExecuting && proposal.status === 'passed' && !proposal.agentExecuted && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Executing agent action...</span>
                  </div>
                )}

                {proposal.agentExecuted && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Agent executed on {new Date(proposal.agentExecutionTime!).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showVoteModal} onOpenChange={setShowVoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voting in Progress</DialogTitle>
            <DialogDescription>
              Please wait while we process your {voteType === 'yes' ? 'Yes' : 'No'} vote...
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground text-center">
                Submitting vote to Near network...<br />
                Updating proposal status...<br />
                Recording vote in smart contract...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
