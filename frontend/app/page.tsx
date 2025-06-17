import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DAOify</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
            <Link href="/explore" className="text-sm font-medium hover:underline">
              Explore DAOs
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The first <span className="text-primary">agentic DAO platform</span>
          </h1>
          <p className="mt-6 max-w-[42rem] text-lg text-muted-foreground">
            Revolutionizing decentralized governance with AI agents that automate operations, execute decisions, and
            manage resources autonomously.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/create">
                Create Your DAO <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/explore">Explore DAOs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-20 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Agents</CardTitle>
                <CardDescription>Autonomous agents execute DAO operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 flex items-center justify-center">
                  <Shield className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Agents handle routine tasks, execute proposals, and manage resources automatically.
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Autonomous Treasury</CardTitle>
                <CardDescription>Smart fund management by AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Agents optimize treasury allocations and execute approved transactions automatically.
                </p>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Agent-Driven Governance</CardTitle>
                <CardDescription>Automated decision execution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-20 flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Agents implement community decisions without manual intervention.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">Connect your wallet to get started</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Create DAO</h3>
              <p className="text-muted-foreground">Set up your DAO with a few simple steps</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Invite Members</h3>
              <p className="text-muted-foreground">Grow your community by inviting members</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Start Governing</h3>
              <p className="text-muted-foreground">Create proposals and vote as a community</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience agent-powered governance?</h2>
          <p className="max-w-[42rem] mb-10 text-primary-foreground/90">
            Join the revolution of autonomous DAOs where AI agents handle operations while humans focus on strategy
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/create">Create Your DAO</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold">DAOify</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
