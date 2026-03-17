import { useEffect, useState } from "react"
import {
  Calendar,
  Building2,
  Layers,
  MessageCircle,
  User,
  Settings,
  Bug,
  RefreshCcw,
  Bookmark,
  X
} from "lucide-react"
import zeroLogo from "/icons/zero.svg"
import { api } from "../api/client"

export type View =
  | "daily"
  | "company"
  | "topics"
  | "community"
  | "revision"
  | "profile"
  | "settings"
  | "bugs"
  | "saved"
  | "notifications"

const SIDEBAR_ITEMS: {
  id: View
  label: string
  icon: React.ElementType
  badge?: boolean
}[] = [
    { id: "daily", label: "Daily Problems", icon: Calendar },
    { id: "revision", label: "Revisions", icon: RefreshCcw, badge: true },
    { id: "saved", label: "Saved", icon: Bookmark },
    { id: "company", label: "Company Wise", icon: Building2 },
    { id: "topics", label: "Topic Wise", icon: Layers },
    { id: "community", label: "Community", icon: MessageCircle },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings }
  ]

type Props = {
  active: View
  onChange: (view: View) => void
  open: boolean
  onClose: () => void
}

export default function Sidebar({ active, onChange, open, onClose }: Props) {
  const [revisionCount, setRevisionCount] = useState(0)

  useEffect(() => {
    api.get("/api/revision/pending").then((res) => {
      const tasks = res.data?.tasks || res.data?.revisions || []
      setRevisionCount(Array.isArray(tasks) ? tasks.length : 0)
    }).catch(() => { })
  }, [])

  return (
    <div
      className={`fixed inset-0 z-40 lg:static lg:z-auto ${open ? "pointer-events-auto" : "pointer-events-none"
        } lg:pointer-events-auto`}
    >

      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden ${open ? "opacity-100" : "opacity-0"
          }`}
      />

      <aside
        className={`fixed left-0 top-0 h-[100dvh] w-64 flex flex-col border-r border-white/15 bg-white/5 backdrop-blur-xl transform transition-transform duration-300 ease-out lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition flex right-0 ml-50 mt-5"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center justify-between p-6 mt-10 lg:mt-0">
          <div className="flex items-center gap-1">
            <img src={zeroLogo} alt="zero" className="w-15 h-15 inline" />
            <h1 className="font-geist text-2xl">zero</h1>
          </div>


        </div>

        <nav className="flex-1 px-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  onChange(item.id)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-geist text-base ${isActive
                  ? "bg-white text-black"
                  : "text-white/70 hover:bg-white/10 font-geist cursor-pointer hover:text-white"
                  }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && revisionCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                      {revisionCount > 9 ? "9+" : revisionCount}
                    </span>
                  )}
                </div>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="px-3 pb-4">
          <div className="border-t border-white/10 mb-3" />

          <button
            onClick={() => {
              onChange("bugs")
              onClose()
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-geist text-base ${active === "bugs"
              ? "bg-white text-black"
              : "text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
              }`}
          >
            <Bug className="w-5 h-5" />
            Report a Bug
          </button>

          <p className="text-xs text-white/40 px-4 mt-2">
            Help improve ZERO by reporting issues
          </p>
        </div>
      </aside>
    </div>
  )
}
