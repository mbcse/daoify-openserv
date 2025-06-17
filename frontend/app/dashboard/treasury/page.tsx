"use client"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, BarChart3, DollarSign, Download, PieChart, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

// Mock treasury data
const treasuryData = {
  balance: 10000,
  totalInflow: 15000,
  totalOutflow: 5000,
  pendingProposals: 3500,
  availableFunds: 6500,
  agentManaged: 8000,
  humanManaged: 2000,
}

// Mock transaction data
const transactions = [
  {
    id: "tx1",
    type: "deposit",
    amount: 2500,
    date: "June 5, 2025",
    from: "0xabcd...1234",
    description: "Initial treasury funding",
    category: "funding",
    executedBy: "agent",
  },
  {
    id: "tx2",
    type: "withdrawal",
    amount: 500,
    date: "June 8, 2025",
    to: "0x9876...5432",
    description: "Website development payment",
    category: "development",
    executedBy: "human",
  },
  {
    id: "tx3",
    type: "deposit",
    amount: 1000,
    date: "June 10, 2025",
    from: "0x2468...1357",
    description: "Member contribution",
    category: "contribution",
    executedBy: "agent",
  },
  {
    id: "tx4",
    type: "withdrawal",
    amount: 250,
    date: "June 12, 2025",
    to: "0x1357...2468",
    description: "Community event expenses",
    category: "event",
    executedBy: "agent",
  },
  {
    id: "tx5",
    type: "deposit",
    amount: 5000,
    date: "June 15, 2025",
    from: "0x8765...4321",
    description: "Partnership investment",
    category: "investment",
    executedBy: "human",
  },
  {
    id: "tx6",
    type: "withdrawal",
    amount: 1200,
    date: "June 18, 2025",
    to: "0x5432...8765",
    description: "Marketing campaign",
    category: "marketing",
    executedBy: "agent",
  },
]

// Mock allocation data
const allocations = [
  { category: "Development", amount: 4000, percentage: 40 },
  { category: "Marketing", amount: 2500, percentage: 25 },
  { category: "Operations", amount: 2000, percentage: 20 },
  { category: "Community", amount: 1000, percentage: 10 },
  { category: "Reserve", amount: 500, percentage: 5 },
]

export default function TreasuryPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [transactionType, setTransactionType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [executorFilter, setExecutorFilter] = useState("all")

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter((tx) => {
    if (transactionType !== "all" && tx.type !== transactionType) return false
    if (executorFilter !== "all" && tx.executedBy !== executorFilter) return false
    return true
  })

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold">Treasury</h1>
              <p className="text-sm text-muted-foreground">Manage and monitor your DAO's financial resources</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button>
                <Upload className="mr-2 h-4 w-4" /> Add Funds
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{treasuryData.balance} ADA</div>
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <Badge variant="outline" className="mr-2">
                    <span className="text-xs">{treasuryData.agentManaged} ADA agent-managed</span>
                  </Badge>
                  <span>{treasuryData.humanManaged} ADA human-managed</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{treasuryData.availableFunds} ADA</div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {treasuryData.pendingProposals} ADA allocated to pending proposals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm">In: {treasuryData.totalInflow} ADA</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowUpIcon className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm">Out: {treasuryData.totalOutflow} ADA</span>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-primary h-full"
                    style={{
                      width: `${(treasuryData.totalInflow / (treasuryData.totalInflow + treasuryData.totalOutflow)) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="allocations">Allocations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Treasury Overview</CardTitle>
                    <CardDescription>Current financial status of your DAO</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Balance</span>
                        <span className="font-medium">{treasuryData.balance} ADA</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Available Funds</span>
                        <span className="font-medium">{treasuryData.availableFunds} ADA</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pending Allocations</span>
                        <span className="font-medium">{treasuryData.pendingProposals} ADA</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Agent-Managed Funds</span>
                        <span className="font-medium">{treasuryData.agentManaged} ADA</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Human-Managed Funds</span>
                        <span className="font-medium">{treasuryData.humanManaged} ADA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest treasury transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 4).map((tx) => (
                        <div key={tx.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                          <div
                            className={`rounded-full p-2 ${tx.type === "deposit" ? "bg-green-500/10" : "bg-red-500/10"}`}
                          >
                            {tx.type === "deposit" ? (
                              <ArrowDownIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowUpIcon className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium">{tx.description}</h4>
                              <span
                                className={`text-sm font-medium ${tx.type === "deposit" ? "text-green-500" : "text-red-500"}`}
                              >
                                {tx.type === "deposit" ? "+" : "-"}
                                {tx.amount} ADA
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-muted-foreground">
                                {tx.type === "deposit" ? `From: ${tx.from}` : `To: ${tx.to}`}
                              </p>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  {tx.executedBy === "agent" ? "Agent" : "Human"}
                                </Badge>
                                <p className="text-xs text-muted-foreground">{tx.date}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("transactions")}>
                      View All Transactions
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Fund Allocations</CardTitle>
                  <CardDescription>How your treasury funds are currently allocated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="relative h-48 w-48 rounded-full border-8 border-primary flex items-center justify-center">
                        <PieChart className="h-12 w-12 text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{treasuryData.balance}</div>
                            <div className="text-xs text-muted-foreground">Total ADA</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-4">
                        {allocations.map((allocation) => (
                          <div key={allocation.category}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{allocation.category}</span>
                              <span className="text-sm font-medium">{allocation.amount} ADA</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                              <div className="bg-primary h-full" style={{ width: `${allocation.percentage}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground text-right mt-1">{allocation.percentage}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("allocations")}>
                    Manage Allocations
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Complete record of treasury transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="transaction-type" className="mb-2 block">
                        Transaction Type
                      </Label>
                      <Select value={transactionType} onValueChange={setTransactionType}>
                        <SelectTrigger id="transaction-type">
                          <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Transactions</SelectItem>
                          <SelectItem value="deposit">Deposits</SelectItem>
                          <SelectItem value="withdrawal">Withdrawals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="date-range" className="mb-2 block">
                        Date Range
                      </Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger id="date-range">
                          <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">Last 7 Days</SelectItem>
                          <SelectItem value="month">Last 30 Days</SelectItem>
                          <SelectItem value="quarter">Last 90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="executor" className="mb-2 block">
                        Executed By
                      </Label>
                      <Select value={executorFilter} onValueChange={setExecutorFilter}>
                        <SelectTrigger id="executor">
                          <SelectValue placeholder="All Executors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Executors</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                          <SelectItem value="human">Human</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div
                          className={`rounded-full p-2 ${tx.type === "deposit" ? "bg-green-500/10" : "bg-red-500/10"}`}
                        >
                          {tx.type === "deposit" ? (
                            <ArrowDownIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUpIcon className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium">{tx.description}</h4>
                            <span
                              className={`text-sm font-medium ${tx.type === "deposit" ? "text-green-500" : "text-red-500"}`}
                            >
                              {tx.type === "deposit" ? "+" : "-"}
                              {tx.amount} ADA
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {tx.type === "deposit" ? `From: ${tx.from}` : `To: ${tx.to}`}
                            </p>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {tx.executedBy === "agent" ? "Agent" : "Human"}
                              </Badge>
                              <p className="text-xs text-muted-foreground">{tx.date}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="allocations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fund Allocations</CardTitle>
                  <CardDescription>Manage how your treasury funds are allocated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {allocations.map((allocation, index) => (
                      <div key={allocation.category}>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor={`allocation-${index}`}>{allocation.category}</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{allocation.amount} ADA</span>
                            <span className="text-xs text-muted-foreground">({allocation.percentage}%)</span>
                          </div>
                        </div>
                        <div className="flex gap-4 items-center">
                          <Input
                            id={`allocation-${index}`}
                            type="range"
                            min="0"
                            max="100"
                            value={allocation.percentage}
                            className="w-full"
                          />
                          <Input type="number" value={allocation.percentage} className="w-20" min="0" max="100" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Allocations</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent-Managed Allocations</CardTitle>
                  <CardDescription>Configure how AI agents manage treasury funds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium">Enable Agent Treasury Management</h3>
                        <p className="text-xs text-muted-foreground">
                          Allow AI agents to automatically manage fund allocations
                        </p>
                      </div>
                      <div className="flex h-6 w-11 items-center rounded-full bg-primary p-1">
                        <div className="h-4 w-4 rounded-full bg-white transition-transform translate-x-5" />
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Agent Management Threshold</Label>
                      <div className="flex gap-4 items-center">
                        <Input type="range" min="0" max="100" value="80" className="w-full" />
                        <span className="text-sm font-medium">80%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Percentage of treasury funds that can be managed by AI agents
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Maximum Transaction Size</Label>
                      <div className="flex gap-4 items-center">
                        <Input type="number" value="500" className="w-full" />
                        <span className="text-sm font-medium">ADA</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Maximum amount an agent can transfer in a single transaction without approval
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Save Agent Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
