import Link from "next/link"
import { Calendar, Clock, Shield } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ProposalCardProps {
  proposal: {
    id: string
    title: string
    description: string
    requestedAmount: number
    status: string
    votesYes: number
    votesNo: number
    quorum: number
    deadline: string
    creator: string
    category?: string
    agentAssigned?: boolean
  }
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  // Calculate progress percentages
  const totalVotes = proposal.votesYes + proposal.votesNo
  const yesPercentage = totalVotes > 0 ? (proposal.votesYes / totalVotes) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            {proposal.agentAssigned && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" /> Agent
              </Badge>
            )}
          </div>
          <Badge
            variant={proposal.status === "open" ? "outline" : proposal.status === "passed" ? "default" : "destructive"}
          >
            {proposal.status === "open" ? "Open" : proposal.status === "passed" ? "Passed" : "Failed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{proposal.description}</p>

        {proposal.requestedAmount > 0 && (
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="font-medium">Requested:</span>
            <span>{proposal.requestedAmount} ADA</span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Yes: {proposal.votesYes}</span>
            <span>No: {proposal.votesNo}</span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="bg-primary" style={{ width: `${yesPercentage}%` }} />
            <div className="bg-destructive" style={{ width: `${100 - yesPercentage}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          {proposal.status === "open" ? (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Ends: {proposal.deadline}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Closed: {proposal.deadline}</span>
            </div>
          )}
          {proposal.category && (
            <Badge variant="secondary" className="text-xs">
              {proposal.category}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/dashboard/proposal/${proposal.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
