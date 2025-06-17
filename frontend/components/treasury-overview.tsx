"use client"

import type React from "react"

import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, BarChart3, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Mock transaction data
const transactions = [
  {
    id: "tx1",
    type: "deposit",
    amount: 2500,
    date: "June 5, 2025",
    from: "0xabcd...1234",
    description: "Initial treasury funding",
  },
  {
    id: "tx2",
    type: "withdrawal",
    amount: 500,
    date: "June 8, 2025",
    to: "0x9876...5432",
    description: "Website development payment",
  },
  {
    id: "tx3",
    type: "deposit",
    amount: 1000,
    date: "June 10, 2025",
    from: "0x2468...1357",
    description: "Member contribution",
  },
  {
    id: "tx4",
    type: "withdrawal",
    amount: 250,
    date: "June 12, 2025",
    to: "0x1357...2468",
    description: "Community event expenses",
  },
]

interface TreasuryOverviewProps {
  balance: number
}

export function TreasuryOverview({ balance }: TreasuryOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [description, setDescription] = useState("")

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would initiate a blockchain transaction
    console.log(`Depositing ${depositAmount} ADA: ${description}`)
    setDepositAmount("")
    setDescription("")
  }

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would initiate a blockchain transaction
    console.log(`Withdrawing ${withdrawAmount} ADA to ${withdrawAddress}: ${description}`)
    setWithdrawAmount("")
    setWithdrawAddress("")
    setDescription("")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Treasury Balance</CardTitle>
          <CardDescription>Current funds available in the DAO treasury</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-muted-foreground mr-2" />
            <div className="text-3xl font-bold">{balance} ADA</div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent treasury transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`rounded-full p-2 ${tx.type === "deposit" ? "bg-green-500/10" : "bg-red-500/10"}`}>
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
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposit" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Funds</CardTitle>
              <CardDescription>Add funds to the DAO treasury</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="depositAmount">Amount (ADA)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depositDescription">Description</Label>
                  <Input
                    id="depositDescription"
                    placeholder="Purpose of deposit"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Deposit Funds
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>Withdraw funds from the DAO treasury</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawAmount">Amount (ADA)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawAddress">Recipient Address</Label>
                  <Input
                    id="withdrawAddress"
                    placeholder="Wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawDescription">Description</Label>
                  <Input
                    id="withdrawDescription"
                    placeholder="Purpose of withdrawal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Withdraw Funds
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Note: Withdrawals require approval through a passed proposal
                </p>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
