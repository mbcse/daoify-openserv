"use client"

import { useState, useEffect } from "react"
import { Bot, Check, Copy, Globe, Lock, Save, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

interface DaoData {
  name: string
  description: string
  quorum: number
  votingPeriod: number
  scriptAddress: string
  txHash: string
  ownerAddress: string
  network: string
  amount: string
  createdAt: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [daoName, setDaoName] = useState("")
  const [daoDescription, setDaoDescription] = useState("")
  const [quorum, setQuorum] = useState(50)
  const [votingPeriod, setVotingPeriod] = useState(3)
  const [minimumVotingPower, setMinimumVotingPower] = useState(5)
  const [agentEnabled, setAgentEnabled] = useState(true)
  const [autonomyLevel, setAutonomyLevel] = useState(70)
  const [maxTransactionSize, setMaxTransactionSize] = useState(500)
  const [requireApprovalThreshold, setRequireApprovalThreshold] = useState(1000)
  const [copiedAddress, setCopiedAddress] = useState("")
  const [daoData, setDaoData] = useState<DaoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress')
    if (storedWalletAddress) {
      const storedDaoData = localStorage.getItem(`daoData_${storedWalletAddress}`)
      if (storedDaoData) {
        const parsedData = JSON.parse(storedDaoData)
        setDaoData(parsedData)
        setDaoName(parsedData.name)
        setDaoDescription(parsedData.description)
        setQuorum(parsedData.quorum)
        setVotingPeriod(parsedData.votingPeriod)
      }
    }
  }, [])

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(""), 2000)
  }

  const handleSaveGeneral = async () => {
    setIsLoading(true)
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Here you would typically make an API call to update settings
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAgent = () => {
    console.log("Saving agent settings:", {
      agentEnabled,
      autonomyLevel,
      maxTransactionSize,
      requireApprovalThreshold,
    })
  }

  if (!daoData) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-[50vh]">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your DAO's settings and preferences</p>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">
                <Globe className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="governance">
                <Shield className="mr-2 h-4 w-4" />
                Governance
              </TabsTrigger>
              <TabsTrigger value="agents">
                <Bot className="mr-2 h-4 w-4" />
                AI Agents
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Lock className="mr-2 h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Basic information about your DAO</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dao-name">DAO Name</Label>
                    <Input id="dao-name" value={daoName} onChange={(e) => setDaoName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dao-description">Description</Label>
                    <Textarea
                      id="dao-description"
                      value={daoDescription}
                      onChange={(e) => setDaoDescription(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">Briefly describe the purpose and goals of your DAO</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveGeneral} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contract Information</CardTitle>
                  <CardDescription>Your DAO's blockchain addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract-address">DAO Contract Address</Label>
                    <div className="flex">
                      <Input
                        id="contract-address"
                        value={daoData.scriptAddress}
                        readOnly
                        className="rounded-r-none"
                      />
                      <Button
                        variant="outline"
                        className="rounded-l-none"
                        onClick={() => handleCopyAddress(daoData.scriptAddress)}
                      >
                        {copiedAddress === daoData.scriptAddress ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treasury-address">Treasury Address</Label>
                    <div className="flex">
                      <Input
                        id="treasury-address"
                        value={daoData.scriptAddress}
                        readOnly
                        className="rounded-r-none"
                      />
                      <Button
                        variant="outline"
                        className="rounded-l-none"
                        onClick={() => handleCopyAddress(daoData.scriptAddress)}
                      >
                        {copiedAddress === daoData.scriptAddress ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="governance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voting Settings</CardTitle>
                  <CardDescription>Configure how voting works in your DAO</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="quorum">Minimum Quorum</Label>
                        <span className="text-sm text-muted-foreground">{quorum}%</span>
                      </div>
                      <Slider
                        id="quorum"
                        min={1}
                        max={100}
                        step={1}
                        value={[quorum]}
                        onValueChange={(value) => setQuorum(value[0])}
                      />
                      <p className="text-xs text-muted-foreground">
                        Percentage of members required to participate for a vote to be valid
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="voting-period">Voting Period (days)</Label>
                        <span className="text-sm text-muted-foreground">{votingPeriod} days</span>
                      </div>
                      <Slider
                        id="voting-period"
                        min={1}
                        max={14}
                        step={1}
                        value={[votingPeriod]}
                        onValueChange={(value) => setVotingPeriod(value[0])}
                      />
                      <p className="text-xs text-muted-foreground">How long proposals will be open for voting</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="min-voting-power">Minimum Voting Power</Label>
                        <span className="text-sm text-muted-foreground">{minimumVotingPower} votes</span>
                      </div>
                      <Slider
                        id="min-voting-power"
                        min={1}
                        max={20}
                        step={1}
                        value={[minimumVotingPower]}
                        onValueChange={(value) => setMinimumVotingPower(value[0])}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum voting power required to create a proposal
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveGeneral} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proposal Types</CardTitle>
                  <CardDescription>Configure different types of proposals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Funding Proposals</Label>
                        <p className="text-xs text-muted-foreground">Proposals requesting treasury funds</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Governance Proposals</Label>
                        <p className="text-xs text-muted-foreground">Proposals to change DAO rules or parameters</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Membership Proposals</Label>
                        <p className="text-xs text-muted-foreground">Proposals to add or remove members</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Text Proposals</Label>
                        <p className="text-xs text-muted-foreground">Simple text-based proposals</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveGeneral} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Settings</CardTitle>
                  <CardDescription>Configure how AI agents operate in your DAO</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable AI Agents</Label>
                      <p className="text-xs text-muted-foreground">Allow AI agents to perform actions in your DAO</p>
                    </div>
                    <Switch checked={agentEnabled} onCheckedChange={setAgentEnabled} />
                  </div>

                  {agentEnabled && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="autonomy-level">Agent Autonomy Level</Label>
                          <span className="text-sm text-muted-foreground">{autonomyLevel}%</span>
                        </div>
                        <Slider
                          id="autonomy-level"
                          min={0}
                          max={100}
                          step={5}
                          value={[autonomyLevel]}
                          onValueChange={(value) => setAutonomyLevel(value[0])}
                        />
                        <p className="text-xs text-muted-foreground">
                          How much freedom agents have to make decisions without human approval
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-transaction">Maximum Transaction Size</Label>
                        <div className="flex gap-4 items-center">
                          <Input
                            id="max-transaction"
                            type="number"
                            value={maxTransactionSize}
                            onChange={(e) => setMaxTransactionSize(Number.parseInt(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm font-medium">ADA</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Maximum amount an agent can transfer in a single transaction without approval
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="approval-threshold">Require Approval Threshold</Label>
                        <div className="flex gap-4 items-center">
                          <Input
                            id="approval-threshold"
                            type="number"
                            value={requireApprovalThreshold}
                            onChange={(e) => setRequireApprovalThreshold(Number.parseInt(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-sm font-medium">ADA</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Transactions above this amount always require human approval
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveAgent}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Agent Settings
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Capabilities</CardTitle>
                  <CardDescription>Configure what actions agents can perform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Treasury Management</Label>
                        <p className="text-xs text-muted-foreground">Allow agents to manage treasury funds</p>
                      </div>
                      <Switch defaultChecked disabled={!agentEnabled} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Proposal Execution</Label>
                        <p className="text-xs text-muted-foreground">Allow agents to execute passed proposals</p>
                      </div>
                      <Switch defaultChecked disabled={!agentEnabled} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Member Communication</Label>
                        <p className="text-xs text-muted-foreground">Allow agents to send messages to members</p>
                      </div>
                      <Switch defaultChecked disabled={!agentEnabled} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Forum Moderation</Label>
                        <p className="text-xs text-muted-foreground">Allow agents to moderate forum discussions</p>
                      </div>
                      <Switch defaultChecked disabled={!agentEnabled} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveAgent}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Capability Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Configure advanced DAO settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockchain">Blockchain</Label>
                    <Select defaultValue="near">
                      <SelectTrigger id="blockchain">
                        <SelectValue placeholder="Select blockchain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="near">Near</SelectItem>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="privacy">Privacy Setting</Label>
                    <Select defaultValue="public">
                      <SelectTrigger id="privacy">
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Anyone can view)</SelectItem>
                        <SelectItem value="members">Members Only</SelectItem>
                        <SelectItem value="private">Private (Invite only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Forum</Label>
                      <p className="text-xs text-muted-foreground">Allow members to discuss in the forum</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Delegation</Label>
                      <p className="text-xs text-muted-foreground">Allow members to delegate their voting power</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveGeneral} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Advanced Settings
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions for your DAO</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-destructive/50 p-4">
                    <h3 className="text-lg font-medium text-destructive">Transfer Ownership</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Transfer ownership of this DAO to another wallet address
                    </p>
                    <div className="mt-4">
                      <Button variant="destructive">Transfer Ownership</Button>
                    </div>
                  </div>

                  <div className="rounded-md border border-destructive/50 p-4">
                    <h3 className="text-lg font-medium text-destructive">Dissolve DAO</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanently dissolve this DAO and distribute remaining funds
                    </p>
                    <div className="mt-4">
                      <Button variant="destructive">Dissolve DAO</Button>
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
