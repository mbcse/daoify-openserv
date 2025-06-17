"use client"

import type React from "react"

import { useState } from "react"
import { MessageSquare, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"

// Mock forum data
const forumTopics = [
  {
    id: "1",
    title: "Welcome to the DAO Forum",
    author: "Alice",
    authorAddress: "0xabcd...1234",
    date: "June 5, 2025",
    replies: 12,
    lastActivity: "2 hours ago",
    pinned: true,
  },
  {
    id: "2",
    title: "Ideas for the next community event",
    author: "Bob",
    authorAddress: "0x9876...5432",
    date: "June 8, 2025",
    replies: 8,
    lastActivity: "5 hours ago",
    pinned: false,
  },
  {
    id: "3",
    title: "Proposal feedback: Fund allocation strategy",
    author: "Carol",
    authorAddress: "0x1234...5678",
    date: "June 10, 2025",
    replies: 15,
    lastActivity: "1 day ago",
    pinned: false,
  },
  {
    id: "4",
    title: "Technical discussion: Blockchain integration",
    author: "Dave",
    authorAddress: "0x5678...1234",
    date: "June 12, 2025",
    replies: 7,
    lastActivity: "2 days ago",
    pinned: false,
  },
]

export function ForumSection() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [newTopicContent, setNewTopicContent] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would create a new forum topic
    console.log(`Creating new topic: ${newTopicTitle}`)
    console.log(`Content: ${newTopicContent}`)
    setNewTopicTitle("")
    setNewTopicContent("")
    setIsDialogOpen(false)
  }

  const filteredTopics = forumTopics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forum topics..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
              <DialogDescription>Start a new discussion in the DAO forum</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topicTitle">Title</Label>
                <Input
                  id="topicTitle"
                  placeholder="Topic title"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topicContent">Content</Label>
                <Textarea
                  id="topicContent"
                  placeholder="Write your post here..."
                  rows={6}
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Topic</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="pinned">Pinned</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">My Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((topic) => (
              <Card key={topic.id} className={topic.pinned ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {topic.pinned && (
                        <span className="mr-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Pinned</span>
                      )}
                      {topic.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">{topic.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{topic.author}</span>
                    <span>•</span>
                    <span>{topic.date}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 text-xs text-muted-foreground flex justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>{topic.replies} replies</span>
                  </div>
                  <span>Last activity: {topic.lastActivity}</span>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No topics found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "Try a different search term" : "Be the first to start a discussion"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pinned" className="space-y-4 mt-6">
          {filteredTopics
            .filter((topic) => topic.pinned)
            .map((topic) => (
              <Card key={topic.id} className="border-primary/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Pinned</span>
                      {topic.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">{topic.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{topic.author}</span>
                    <span>•</span>
                    <span>{topic.date}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 text-xs text-muted-foreground flex justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>{topic.replies} replies</span>
                  </div>
                  <span>Last activity: {topic.lastActivity}</span>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4 mt-6">
          {/* Sort by last activity */}
          {filteredTopics
            .sort((a, b) => {
              if (a.lastActivity < b.lastActivity) return -1
              if (a.lastActivity > b.lastActivity) return 1
              return 0
            })
            .map((topic) => (
              <Card key={topic.id} className={topic.pinned ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {topic.pinned && (
                        <span className="mr-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Pinned</span>
                      )}
                      {topic.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">{topic.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{topic.author}</span>
                    <span>•</span>
                    <span>{topic.date}</span>
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 text-xs text-muted-foreground flex justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>{topic.replies} replies</span>
                  </div>
                  <span>Last activity: {topic.lastActivity}</span>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="my" className="space-y-4 mt-6">
          <div className="text-center py-10">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No topics created yet</h3>
            <p className="text-muted-foreground mt-2">Start a discussion by creating a new topic</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Topic
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
