import { Calendar, MessageCircle, User, RefreshCcw, Settings } from "lucide-react"
import type { View } from "./Sidebar"

const NAV_ITEMS: { id: View; icon: React.ElementType }[] = [
    { id: "daily", icon: Calendar },
    { id: "revision", icon: RefreshCcw },
    { id: "community", icon: MessageCircle },
    { id: "profile", icon: User },
    { id: "settings", icon: Settings }
]

type Props = {
    active: View
    onChange: (view: View) => void
}

export default function BottomNav({ active, onChange }: Props) {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/15 safe-area-pb">
            <div className="flex justify-around items-center h-16 px-2">
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon
                    const isActive = active === item.id

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition ${isActive
                                    ? "bg-white/15 text-white"
                                    : "text-white/50 hover:text-white/80"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
