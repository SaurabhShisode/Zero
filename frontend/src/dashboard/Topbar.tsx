import { useEffect, useState } from "react";
import { LogOut, Bell } from "lucide-react";
import type { View } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";
import type { RefObject } from "react";

type Props = {
    view: View;
    scrollRef: RefObject<HTMLDivElement | null>;
    onViewChange?: (view: View) => void;
};

export default function Topbar({ scrollRef, onViewChange }: Props) {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore(s => s.user)
    const [hidden, setHidden] = useState(false);
    const [border, setBorder] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [dailyTotal, setDailyTotal] = useState(0)
    const [dailySolved, setDailySolved] = useState(0)
    const [notifCount, setNotifCount] = useState(0)

    useEffect(() => {
        api.get("/api/daily").then(async (res) => {
            const problems = res.data?.daily || []
            setDailyTotal(problems.length)

            let solved = 0
            await Promise.all(
                problems.map(async (p: any) => {
                    try {
                        const r = await api.get(`/api/solve/${p.problem._id}`)
                        if (r.data?.solved) solved++
                    } catch { }
                })
            )
            setDailySolved(solved)
        }).catch(() => { })

        api.get("/api/notifications/unread-count").then((res) => {
            setNotifCount(res.data?.count || 0)
        }).catch(() => { })
    }, [])

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const currentScrollY = container.scrollTop;

            if (currentScrollY > container.clientHeight) {
                setBorder(true);
            } else {
                setBorder(false);
            }

            if (currentScrollY > 180 && currentScrollY > lastScrollY) {
                setHidden(true);
            } else {
                setHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [scrollRef]);

    const pct = dailyTotal > 0 ? dailySolved / dailyTotal : 0
    const radius = 14
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - pct)

    return (
        <header
            className={`
    fixed top-0 right-0 z-30
    w-full lg:w-[calc(100%-16rem)]
    backdrop-blur-xl
    will-change-transform
    ${border ? "border-b border-white/15 bg-white/40" : "bg-white/5"}
  `}
            style={{
                animation: hidden
                    ? "topbarOut 0.45s cubic-bezier(0.22,1,0.36,1) forwards"
                    : "topbarIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards"
            }}
        >
            <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                <h1 className="text-sm md:text-lg mx-14 md:mx-10 lg:mx-0  font-geist tracking-tight">
                    <span className="text-gray-400">Welcome</span>{user?.name ? ` , ${user.name}` : ""}
                </h1>

                <div className="flex items-center gap-4 font-geist">

                    <div className="hidden sm:flex items-center gap-2" title={`${dailySolved}/${dailyTotal} solved today`}>
                        <svg width="36" height="36" viewBox="0 0 36 36" className="transform -rotate-90">
                            <circle
                                cx="18" cy="18" r={radius}
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="3"
                            />
                            <circle
                                cx="18" cy="18" r={radius}
                                fill="none"
                                stroke={pct >= 1 ? "rgb(34,197,94)" : "rgb(99,102,241)"}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                className="transition-all duration-700"
                            />
                        </svg>
                        <span className="text-xs text-white/50">{dailySolved}/{dailyTotal}</span>
                    </div>

                    <button
                        onClick={() => onViewChange?.("notifications" as View)}
                        className="relative p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
                        title="Notifications"
                    >
                        <Bell className="h-4 w-4 text-white/70" />
                        {notifCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                                {notifCount > 9 ? "9+" : notifCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-xs sm:text-sm text-black bg-white p-2 rounded-lg hover:text-white transition cursor-pointer hover:bg-red-500  "
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
