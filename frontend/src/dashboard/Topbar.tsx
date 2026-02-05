import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import type { View } from "./Sidebar";
import { useAuthStore } from "../store/authStore";
import type { RefObject } from "react";

type Props = {
    view: View;
    scrollRef: RefObject<HTMLDivElement | null>;

};



export default function Topbar({ scrollRef }: Props) {
    const logout = useAuthStore((s) => s.logout);
    const user = useAuthStore(s => s.user)
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

                <div className="flex items-center gap-8 font-geist">


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
