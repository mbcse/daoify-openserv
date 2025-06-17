"use client"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ForumSection } from "@/components/forum-section"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function ForumPage() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold">Forum</h1>
              <p className="text-sm text-muted-foreground">Community discussions and announcements</p>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <ForumSection />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
