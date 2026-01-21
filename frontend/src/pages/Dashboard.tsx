import { useEffect, useState, useRef } from "react"

import Sidebar from "../dashboard/Sidebar"
import Topbar from "../dashboard/Topbar"
import type { View } from "../dashboard/Sidebar"

import DailyView from "../dashboard/DailyView"
import CompanyView from "../dashboard/CompanyView"
import TopicsView from "../dashboard/TopicsView"
import PlacementView from "../dashboard/PlacementView"
import DiscussionsView from "../dashboard/CommunityView"
import ProfileView from "../dashboard/ProfileView"
import SettingsView from "../dashboard/SettingsView"
import BugsView from "../dashboard/BugsView"
import RevisionView from "../dashboard/RevisionView"

import { Menu } from "lucide-react"

export default function Dashboard() {
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem("dashboard-view")
    return (saved as View) || "daily"
  })

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem("dashboard-view", view)
  }, [view])

  const renderView = () => {
    switch (view) {
      case "company":
        return <CompanyView />
      case "topics":
        return <TopicsView />
      // case "placement":
      //   return <PlacementView />
      case "community":
        return <DiscussionsView />
      case "revision":
        return <RevisionView />
      case "profile":
        return <ProfileView />
      case "settings":
        return <SettingsView />
      case "bugs":
        return <BugsView />
      default:
        return <DailyView />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex relative">
      <Sidebar
        active={view}
        onChange={setView}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <div className="flex-1 flex flex-col ml-0 lg:ml-64 h-screen w-full">

        <Topbar view={view} scrollRef={scrollRef} />

        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide pt-16"
        >
          {renderView()}
        </main>
      </div>
    </div>
  )
}
