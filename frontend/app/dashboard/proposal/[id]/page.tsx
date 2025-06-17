"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for a single proposal
const proposal = {
  id: "1",
  title: "Fund Community Event",
  description:
    "Allocate 500 ADA for the upcoming community meetup in July. This event will bring together members of our DAO to discuss future initiatives and build stronger connections within our community.\n\nThe funds will be used for:\n- Venue rental: 200 ADA\n- Refreshments: 150 ADA\n- Speaker honorariums: 100 ADA\n- Miscellaneous expenses: 50 ADA",
  requestedAmount: 500,
  status: "open",
  votesYes: 24,
  votesNo: 5,
  quorum: 50,
  totalVotes: 75,
  deadline: "July 1, 2025",
  createdAt: "June 10, 2025",
  creator: "0x1234...5678",
}

// Mock comments
const comments = [
  {
    id: "1",
    author: "0xabcd...1234",
    authorName: "Alice",
    content: "I think this is a great initiative that will help grow our community!",
    timestamp: "2 days ago",
  },
  {
    id: "2",
    author: "0x9876...5432",
    authorName: "Bob",
    content: "Could we get more details about the venue and expected attendance?",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    author: "0x1234...5678",
    authorName: "Carol",
    content: "I support this proposal but suggest we allocate a bit more for refreshments.",
    timestamp: "12 hours ago",
  },
]

export default function ProposalDetail({ params }: { params: { id: string } }) {
  const [userVote, setUserVote] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  const handleVote = (vote: string) => {
    setUserVote(vote)
    // In a real app, this would submit the vote to the blockchain
    console.log(`Voted ${vote} on proposal ${params.id}`)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit the comment to the blockchain or database
    console.log(`New comment on proposal ${params.id}: ${comment}`)
    setComment("")
  }

  // Calculate progress percentages
  const totalVotes = proposal.votesYes + proposal.votesNo
  const yesPercentage = totalVotes > 0 ? (proposal.votesYes / totalVotes) * 100 : 0
  const quorumPercentage = (totalVotes / proposal.totalVotes) * 100

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Link href="/dashboard" className="flex items-center text-sm hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold">{proposal.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={
                    proposal.status === "open" ? "outline" : proposal.status === "passed" ? "success" : "destructive"
                  }
                >
                  {proposal.status === "open" ? "Open for Voting" : proposal.status === "passed" ? "Passed" : "Failed"}
                </Badge>
                <span className="text-sm text-muted-foreground">Proposal #{params.id}</span>
              </div>
            </div>

            {proposal.status === "open" && !userVote && (
              <div className="flex gap-3">
                <Button onClick={() => handleVote("yes")} variant="default">
                  Vote Yes
                </Button>
                <Button onClick={() => handleVote("no")} variant="outline">
                  Vote No
                </Button>
              </div>
            )}

            {userVote && (
              <Badge variant={userVote === "yes" ? "default" : "outline"}>
                You voted: {userVote === "yes" ? "Yes" : "No"}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion ({comments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Proposal Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-line">{proposal.description}</div>
                    </CardContent>
                  </Card>

                  {proposal.requestedAmount > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Requested Funds</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{proposal.requestedAmount} ADA</div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="discussion" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discussion</CardTitle>
                      <CardDescription>Community feedback and questions about this proposal</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                          <Avatar>
                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comment.authorName}</span>
                              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <form onSubmit={handleCommentSubmit} className="w-full space-y-4">
                        <textarea
                          className="w-full min-h-[100px] p-3 border rounded-md"
                          placeholder="Add your comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button type="submit" disabled={!comment.trim()}>
                          Post Comment
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voting Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Yes ({proposal.votesYes})</span>
                      <span>No ({proposal.votesNo})</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="bg-primary" style={{ width: `${yesPercentage}%` }} />
                      <div className="bg-destructive" style={{ width: `${100 - yesPercentage}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quorum Progress</span>
                      <span>
                        {totalVotes} / {proposal.totalVotes} votes
                      </span>
                    </div>
                    <Progress value={quorumPercentage} />
                    <p className="text-xs text-muted-foreground">
                      {proposal.quorum}% quorum required for the proposal to pass
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Deadline</p>
                      <p className="text-sm text-muted-foreground">{proposal.deadline}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{proposal.createdAt}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Creator</p>
                      <p className="text-sm text-muted-foreground">{proposal.creator}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/proposal/${params.id}/vote-history`}>View Vote History</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
