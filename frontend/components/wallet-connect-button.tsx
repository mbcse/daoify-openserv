"use client"

import { useState } from "react"
import { Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi'
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface WalletConnectButtonProps {
  onConnect: (address: string) => void
  redirectTo?: string
}

export function WalletConnectButton({ onConnect, redirectTo }: WalletConnectButtonProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = async (connector: Connector) => {
    try {
      await connect({ connector })
      if (address) {
        setIsDialogOpen(false)
        onConnect(address)
        if (redirectTo) {
          router.push(redirectTo)
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        <Wallet className="mr-2 h-4 w-4" />
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
            <DialogDescription>Choose a wallet to connect to the DAO platform</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {connectors.map((connector) => {
              const isMetaMask = connector.name.toLowerCase().includes('metamask')
              const isInstalled = typeof window !== 'undefined' && window.ethereum?.isMetaMask

              return (
                <Button
                  key={connector.uid}
                  variant="outline"
                  className="flex justify-between items-center"
                  onClick={() => handleConnect(connector)}
                  disabled={isMetaMask && !isInstalled || isPending}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-4 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {connector.name[0]}
                    </div>
                    <div className="flex flex-col items-start">
                      <span>{connector.name}</span>
                      {isMetaMask && !isInstalled && (
                        <span className="text-xs text-red-500">Not installed</span>
                      )}
                    </div>
                  </div>
                  {isPending && connector.uid === connectors[0]?.uid && (
                    <span className="text-xs">Connecting...</span>
                  )}
                </Button>
              )
            })}
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">
              {error.message}
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
