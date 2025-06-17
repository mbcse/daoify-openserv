"use client"

import type React from "react"

import { useState } from "react"
import { Check, Copy, Search, Shield, Star, UserPlus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

// Mock members data
const members = [
  {
    id: "1",
    name: "Alice Johnson",
    address: "0xabcd...1234",
    role: "admin",
    joinDate: "May 15, 2025",
    votingPower: 15,
    contributions: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    address: "0x9876...5432",
    role: "member",
    joinDate: "May 20, 2025",
    votingPower: 8,
    contributions: 5,
    status: "active",
  },
  {
    id: "3",
    name: "Carol Williams",
    address: "0x1234...5678",
    role: "moderator",
    joinDate: "May 22, 2025",
    votingPower: 12,
    contributions: 8,
    status: "active",
  },
  {
    id: "4",
    name: "Dave Brown",
    address: "0x5678...1234",
    role: "member",
    joinDate: "May 25, 2025",
    votingPower: 5,
    contributions: 3,
    status: "active",
  },
  {
    id: "5",
    name: "Eve Davis",
    address: "0x2468...1357",
    role: "member",
    joinDate: "May 28, 2025",
    votingPower: 7,
    contributions: 4,
    status: "inactive",
  },
  {
    id: "6",
    name: "Frank Miller",
    address: "0x1357...2468",
    role: "member",
    joinDate: "June 1, 2025",
    votingPower: 6,
    contributions: 2,
    status: "active",
  },
  {
    id: "7",
    name: "Grace Lee",
    address: "0x8642...9753",
    role: "member",
    joinDate: "June 5, 2025",
    votingPower: 4,
    contributions: 1,
    status: "pending",
  },
]

// Mock roles data
const roles = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access to all DAO settings and functions",
    permissions: ["manage_members", "manage_treasury", "manage_proposals", "manage_settings"],
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Can moderate discussions and review proposals",
    permissions: ["moderate_forum", "review_proposals"],
  },
  {
    id: "member",
    name: "Member",
    description: "Standard member with voting rights",
    permissions: ["vote", "create_proposals", "participate_forum"],
  },
]

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<(typeof members)[0] | null>(null)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [copiedAddress, setCopiedAddress] = useState("")

  // Filter members based on search and tab
  const filteredMembers = members.filter((member) => {
    // Search filter
    if (
      searchQuery &&
      !member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Tab filter
    if (activeTab === "active" && member.status !== "active") return false
    if (activeTab === "inactive" && member.status !== "inactive") return false
    if (activeTab === "pending" && member.status !== "pending") return false
    if (activeTab === "admins" && member.role !== "admin") return false

    return true
  })

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(""), 2000)
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send an invitation
    console.log(`Inviting ${inviteEmail} with role ${inviteRole}`)
    setInviteEmail("")
    setInviteRole("member")
    setIsInviteDialogOpen(false)
  }

  const handleOpenRoleDialog = (member: (typeof members)[0]) => {
    setSelectedMember(member)
    setIsRoleDialogOpen(true)
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold">Members</h1>
              <p className="text-sm text-muted-foreground">Manage your DAO's membership</p>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Member</DialogTitle>
                  <DialogDescription>Send an invitation to join your DAO</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email or Wallet Address</Label>
                    <Input
                      id="email"
                      placeholder="Enter email or wallet address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {roles.find((r) => r.id === inviteRole)?.description}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Send Invitation</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Member List</CardTitle>
                  <CardDescription>
                    {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b bg-muted/50">
                      <div className="col-span-4">Member</div>
                      <div className="col-span-2">Role</div>
                      <div className="col-span-2">Voting Power</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Actions</div>
                    </div>
                    <div className="divide-y">
                      {filteredMembers.map((member) => (
                        <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span className="truncate">{member.address}</span>
                                  <button
                                    onClick={() => handleCopyAddress(member.address)}
                                    className="ml-1 hover:text-foreground"
                                  >
                                    {copiedAddress === member.address ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              {member.role === "admin" && <Shield className="h-3 w-3 text-primary" />}
                              {member.role === "moderator" && <Star className="h-3 w-3 text-amber-500" />}
                              <span className="capitalize">{member.role}</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center gap-1">
                              <span>{member.votingPower}</span>
                              <span className="text-xs text-muted-foreground">votes</span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : member.status === "inactive"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {member.status === "active"
                                ? "Active"
                                : member.status === "inactive"
                                  ? "Inactive"
                                  : "Pending"}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleOpenRoleDialog(member)}>
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Member Role</DialogTitle>
                <DialogDescription>
                  {selectedMember ? `Update role and permissions for ${selectedMember.name}` : "Update member role"}
                </DialogDescription>
              </DialogHeader>
              {selectedMember && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{selectedMember.name}</div>
                      <div className="text-xs text-muted-foreground">{selectedMember.address}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select defaultValue={selectedMember.role}>
                      <SelectTrigger id="edit-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      {roles
                        .find((r) => r.id === selectedMember.role)
                        ?.permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox id={permission} defaultChecked />
                            <label
                              htmlFor={permission}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission
                                .split("_")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voting-power">Voting Power</Label>
                    <div className="flex gap-4 items-center">
                      <Input
                        id="voting-power"
                        type="range"
                        min="1"
                        max="20"
                        defaultValue={selectedMember.votingPower}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        defaultValue={selectedMember.votingPower}
                        className="w-20"
                        min="1"
                        max="20"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Determines the weight of this member's vote in proposals
                    </p>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsRoleDialogOpen(false)}>Save Changes</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
