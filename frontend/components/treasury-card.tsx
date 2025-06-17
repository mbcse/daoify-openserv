"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Wallet, RefreshCw, Copy, CheckCircle } from "lucide-react"
import { getApiUrl, API_ENDPOINTS } from "@/lib/config"

interface TreasuryInfo {
  accountId: string
  balance: string
  explorerUrl: string
  network: string
  publicKey?: string
  created?: string
}

interface FundingInstructions {
  message: string
  steps: string[]
  faucetUrl: string
  treasuryAddress: string
  explorerUrl: string
}

interface TreasuryCardProps {
  contractAddress: string
  initialTreasury?: TreasuryInfo | null
}

export function TreasuryCard({ contractAddress, initialTreasury }: TreasuryCardProps) {
  const [treasury, setTreasury] = useState<TreasuryInfo | null>(initialTreasury || null)
  const [fundingInstructions, setFundingInstructions] = useState<FundingInstructions | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch treasury information
  const fetchTreasuryInfo = async () => {
    if (!contractAddress) return

    setIsRefreshing(true)
    try {
      const response = await fetch(`${getApiUrl(API_ENDPOINTS.TREASURY)}/${contractAddress}`)
      
      if (response.ok) {
        const data = await response.json()
        setTreasury(data.treasury)
        setFundingInstructions(data.fundingInstructions)
      } else {
        console.error('Failed to fetch treasury info')
      }
    } catch (error) {
      console.error('Error fetching treasury info:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fund treasury (simulation for testnet)
  const fundTreasury = async (amount: string = '10') => {
    if (!contractAddress) return

    setIsLoading(true)
    try {
      const response = await fetch(`${getApiUrl(API_ENDPOINTS.TREASURY)}/${contractAddress}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Funding result:', data)
        // Refresh treasury info after funding
        await fetchTreasuryInfo()
      } else {
        console.error('Failed to fund treasury')
      }
    } catch (error) {
      console.error('Error funding treasury:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Copy address to clipboard
  const copyAddress = async () => {
    if (treasury?.accountId) {
      await navigator.clipboard.writeText(treasury.accountId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Load treasury info on mount
  useEffect(() => {
    if (!initialTreasury) {
      fetchTreasuryInfo()
    }
  }, [contractAddress])

  if (!treasury) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Treasury
          </CardTitle>
          <CardDescription>NEAR testnet treasury for this DAO</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No treasury found</p>
            <Button 
              variant="outline" 
              onClick={fetchTreasuryInfo}
              disabled={isRefreshing}
              className="mt-2"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Treasury
            </CardTitle>
            <CardDescription>NEAR testnet treasury for this DAO</CardDescription>
          </div>
          <Badge variant="secondary">NEAR Testnet</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Treasury Address */}
        <div>
          <label className="text-sm font-medium">Treasury Address</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
              {treasury.accountId}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={copyAddress}
              className="shrink-0"
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Balance */}
        <div>
          <label className="text-sm font-medium">Balance</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold">{treasury.balance || '0'}</span>
            <span className="text-muted-foreground">NEAR</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchTreasuryInfo}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(treasury.explorerUrl, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
          <Button
            onClick={() => fundTreasury('10')}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wallet className="h-4 w-4 mr-2" />
            )}
            Fund (10 NEAR)
          </Button>
        </div>

        {/* Funding Instructions */}
        {fundingInstructions && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">💡 How to Fund Treasury</h4>
            <ol className="text-xs space-y-1 text-muted-foreground">
              {fundingInstructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            <Button
              variant="link"
              size="sm"
              onClick={() => window.open(fundingInstructions.faucetUrl, '_blank')}
              className="mt-2 p-0 h-auto text-xs"
            >
              Open NEAR Testnet Wallet →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 