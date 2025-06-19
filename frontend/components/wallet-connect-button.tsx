"use client"

import { useState, useEffect, useCallback } from "react"
import { Wallet, AlertTriangle } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useSwitchChain, type Connector } from 'wagmi'
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { daifyChain } from "@/lib/wagmi"

interface WalletConnectButtonProps {
  onConnect: (address: string) => void
  redirectTo?: string
}

export function WalletConnectButton({ onConnect, redirectTo }: WalletConnectButtonProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const checkAndSwitchNetwork = useCallback(async () => {
    if (!isConnected || !chain) return false

    console.log('Current chain:', chain.id, 'Required chain:', daifyChain.id)
    
    if (chain.id !== daifyChain.id) {
      setIsWrongNetwork(true)
      return false
    } else {
      setIsWrongNetwork(false)
      return true
    }
  }, [isConnected, chain])

  // Check network whenever connection status or chain changes
  useEffect(() => {
    checkAndSwitchNetwork()
  }, [checkAndSwitchNetwork])

  // Auto-switch network after connection
  useEffect(() => {
    const autoSwitchNetwork = async () => {
      if (isConnected && chain && chain.id !== daifyChain.id) {
        console.log('Auto-switching to Daify network...')
        await switchToDaifyChain()
      }
    }

    // Delay to ensure connection is fully established
    const timer = setTimeout(autoSwitchNetwork, 1000)
    return () => clearTimeout(timer)
  }, [isConnected, chain])

  const addDaifyChain = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!')
      return false
    }

    try {
      setIsSwitchingNetwork(true)
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${daifyChain.id.toString(16)}`,
            chainName: daifyChain.name,
            nativeCurrency: daifyChain.nativeCurrency,
            rpcUrls: [daifyChain.rpcUrls.default.http[0]],
            blockExplorerUrls: [daifyChain.blockExplorers.default.url],
          },
        ],
      })
      
      // Wait a bit for the network to be added and switched
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsWrongNetwork(false)
      return true
    } catch (error) {
      console.error('Error adding Daify chain:', error)
      return false
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  const switchToDaifyChain = async () => {
    if (!window.ethereum) {
      alert('MetaMask is not installed!')
      return false
    }

    try {
      setIsSwitchingNetwork(true)
      console.log('Attempting to switch to chain ID:', daifyChain.id)
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${daifyChain.id.toString(16)}` }],
      })
      
      // Wait a bit for the switch to complete
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsWrongNetwork(false)
      return true
    } catch (error: any) {
      console.error('Error switching to Daify chain:', error)
      
      // If the chain is not added to MetaMask, add it
      if (error.code === 4902) {
        console.log('Chain not found, adding it...')
        return await addDaifyChain()
      } else if (error.code === 4001) {
        // User rejected the request
        console.log('User rejected network switch')
        return false
      } else {
        console.error('Unexpected error:', error)
        return false
      }
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  const handleConnect = async (connector: Connector) => {
    try {
      console.log('Connecting to wallet...')
      await connect({ connector })
      
      // Wait for connection to be established
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Wallet connected, checking network...')
      
      // Close the dialog immediately
      setIsDialogOpen(false)
      
      // Check and switch network if needed
      const isCorrectNetwork = await checkAndSwitchNetwork()
      
      if (!isCorrectNetwork) {
        console.log('Wrong network detected, switching...')
        await switchToDaifyChain()
      }
      
      // Call onConnect with the address
      if (address) {
        onConnect(address)
        if (redirectTo) {
          router.push(redirectTo)
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    }
  }

  // Create a network status component for better UX
  const NetworkStatus = () => {
    if (!isConnected) return null
    
    if (isSwitchingNetwork) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-sm text-yellow-700">Switching to Daify Network...</span>
        </div>
      )
    }
    
    if (isWrongNetwork) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">Wrong Network: Please switch to Daify Network</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-green-700">Connected to Daify Network</span>
      </div>
    )
  }

  if (isConnected && address) {
    // Show network switching interface if on wrong network
    if (isWrongNetwork || isSwitchingNetwork) {
      return (
        <div className="flex flex-col gap-2">
          <NetworkStatus />
          <div className="flex items-center gap-2">
            <Button 
              variant="destructive" 
              onClick={switchToDaifyChain}
              disabled={isSwitchingNetwork}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isSwitchingNetwork ? 'Switching...' : 'Switch to Daify Network'}
            </Button>
            <Button variant="outline" onClick={() => disconnect()}>
              Disconnect
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        <NetworkStatus />
        <Button variant="outline" onClick={() => disconnect()}>
          <Wallet className="mr-2 h-4 w-4" />
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </Button>
      </div>
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
                  {isPending && (
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
          
          <div className="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded">
            <strong>Important:</strong> This app requires the Daify Network. You'll be automatically prompted to add/switch networks after connecting.
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


