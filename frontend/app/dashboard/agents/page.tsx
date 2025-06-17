"use client"

import { useState } from "react"
import { Twitter, Mail, Bot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected'
  lastUsed?: string
}

const agents: Agent[] = [
  {
    id: 'twitter',
    name: 'Twitter Agent',
    description: 'Post tweets and manage your Twitter presence',
    icon: <Twitter className="h-6 w-6" />,
    status: 'connected',
    lastUsed: '2024-03-14T12:00:00Z'
  },
  {
    id: 'gmail',
    name: 'Gmail Agent',
    description: 'Send emails and manage your inbox',
    icon: <Mail className="h-6 w-6" />,
    status: 'disconnected'
  },
  {
    id: 'dex',
    name: 'DEX Bridge',
    description: 'Execute trades and manage liquidity',
    icon: <Bot className="h-6 w-6" />,
    status: 'disconnected'
  }
]

export default function AgentsPage() {
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAgents, setConnectedAgents] = useState<Agent[]>(agents)

  const handleConnect = async (agent: Agent) => {
    setSelectedAgent(agent)
    setShowConnectModal(true)
  }

  const handleConfirmConnect = async () => {
    if (!selectedAgent) return

    setIsConnecting(true)
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update agent status
      const updatedAgents = connectedAgents.map(a => {
        if (a.id === selectedAgent.id) {
          return {
            ...a,
            status: 'connected' as const,
            lastUsed: new Date().toISOString()
          }
        }
        return a
      })

      setConnectedAgents(updatedAgents)

      // Close modal after success
      setTimeout(() => {
        setShowConnectModal(false)
        setIsConnecting(false)
        setSelectedAgent(null)
      }, 1000)
    } catch (error) {
      console.error('Error connecting agent:', error)
      setIsConnecting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Integrate Agents</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {connectedAgents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {agent.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={agent.status === 'connected' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agent.status === 'connected' ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last used:</span>
                    <span>{new Date(agent.lastUsed!).toLocaleString()}</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleConnect(agent)}
                  >
                    Connect Agent
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedAgent?.name}</DialogTitle>
            <DialogDescription>
              {isConnecting ? (
                <div className="py-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground text-center">
                      Connecting to {selectedAgent?.name}...<br />
                      Setting up permissions...<br />
                      Initializing agent...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <p>You are about to connect the {selectedAgent?.name} to your DAO. This will allow the agent to:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Execute actions on behalf of your DAO</li>
                    <li>Access necessary permissions</li>
                    <li>Manage automated tasks</li>
                  </ul>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowConnectModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmConnect}>
                      Connect Agent
                    </Button>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
} 