"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDAOContract } from "@/lib/contract"

export default function CreateProposal() {
  const router = useRouter()
  const { address } = useAccount()
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get DAO data from localStorage
  const daoData = address ? JSON.parse(localStorage.getItem(`daoData_${address}`) || '{}') : null

  const { createProposal, isCreatingProposal } = useDAOContract(daoData?.contractAddress)

  // Redirect when transaction is complete
  useEffect(() => {
    if (isSubmitting && !isCreatingProposal) {
      // Transaction completed, redirect to dashboard
      router.replace('/dashboard')
    }
  }, [isCreatingProposal, isSubmitting, router])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !daoData?.contractAddress || !description.trim()) return

    setIsSubmitting(true)
    try {
      // Create proposal on the contract
      await createProposal(description)
      // The useEffect will handle the redirect when isCreatingProposal becomes false
    } catch (error) {
      console.error('Error creating proposal:', error)
      alert('Failed to create proposal. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!daoData?.contractAddress) {
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

  return (
    <div className="container max-w-4xl py-10">
      <Link href="/dashboard" className="flex items-center text-sm mb-6 hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Create Proposal</h1>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
          <CardDescription>Fill out the form below to create a new proposal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your proposal"
                value={description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isCreatingProposal}>
              {isSubmitting || isCreatingProposal ? 'Creating Proposal...' : 'Create Proposal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
