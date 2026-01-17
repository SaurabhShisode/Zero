import { useEffect, useState } from "react";
import { LogOut, Bell, User } from "lucide-react";
import type { View } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import type { RefObject } from "react";

type Props = {
    view: View;
    scrollRef: RefObject<HTMLDivElement | null>;

};

const VIEW_TITLES: Record<View, string> = {
    daily: "Daily Problems",
    company: "Company Wise",
    topics: "Topic Wise",
    placement: "Placement Mode",
    discussions: "Discussions",
    profile: "Profile",
    settings: "Settings"
};

export default function Topbar({ view, scrollRef }: Props) {
    const logout = useAuthStore((s) => s.logout);

    const [hidden, setHidden] = useState(false);
    const [border, setBorder] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

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

    return (
        <header
            className={`
    fixed top-0 right-0 z-30
    w-full md:w-[calc(100%-16rem)]
    backdrop-blur-xl
    will-change-transform
    ${border ? "border-b border-white/10 bg-white/40" : "bg-white/5"}
  `}
            style={{
                animation: hidden
                    ? "topbarOut 0.45s cubic-bezier(0.22,1,0.36,1) forwards"
                    : "topbarIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards"
            }}
        >






            <div className="flex items-center justify-between px-8 py-5">
                <h1 className="text-lg font-semibold font-geist tracking-tight">
                    {VIEW_TITLES[view]}
                </h1>

                <div className="flex items-center gap-8 font-geist">
                    <button className="text-white/60 hover:text-white transition">
                        <Bell className="h-5 w-5" />
                    </button>

                    <button className="text-white/60 hover:text-white transition">
                        <User className="h-5 w-5" />
                    </button>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
