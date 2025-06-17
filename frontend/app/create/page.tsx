"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount } from 'wagmi'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getApiUrl, API_ENDPOINTS } from "@/lib/config"

export default function CreateDAO() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    // Check if user already has a DAO
    if (address) {
      const userDaoData = localStorage.getItem(`daoData_${address}`)
      if (userDaoData) {
        router.replace('/dashboard')
      }
    }
  }, [address, router])

  const handleWalletConnect = (address: string) => {
    localStorage.setItem('walletAddress', address)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    setIsLoading(true)
    setShowDeployModal(true)
    
    try {
      // Make API call to deploy contract
      const response = await fetch(getApiUrl(API_ENDPOINTS.DEPLOY_DAO), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store DAO data in localStorage
        const daoData = {
          name: formData.name,
          description: formData.description,
          contractAddress: data.contractAddress,
          chainId: data.chainId,
          explorerUrl: data.explorerUrl,
          ownerAddress: address,
          createdAt: new Date().toISOString(),
          treasury: data.treasury || null
        };
        
        localStorage.setItem(`daoData_${address}`, JSON.stringify(daoData));
        
        // Wait for 3 seconds to show the deployment message
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Use replace instead of push to prevent back navigation
        router.replace('/dashboard');
      } else {
        throw new Error('Failed to deploy contract');
      }
    } catch (error) {
      console.error('Error creating DAO:', error);
      alert('Failed to create DAO. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeployModal(false);
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <Link href="/" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold mb-6">Create Your DAO</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>You need to connect your wallet before creating a DAO</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-6">
              <WalletConnectButton onConnect={handleWalletConnect} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>DAO Details</CardTitle>
            <CardDescription>Fill out the form below to create your DAO</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">DAO Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter DAO name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of your DAO"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating DAO...' : 'Create DAO'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deploying DAO Contract</DialogTitle>
            <DialogDescription>
              Please wait while we deploy your DAO contract on Aurora...
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground text-center">
                Creating smart contract...<br />
                Deploying to Aurora network...<br />
                Initializing DAO parameters...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
