import {
    Calendar,
    Building2,
    Layers,
    Briefcase,
    MessageCircle,
    User,
    Settings,
    Bug
} from "lucide-react";
import zeroLogo from "/icons/zero.svg"
import type { SVGProps } from "react";
export type View =
  | "daily"
  | "company"
  | "topics"
  | "placement"
  | "community"
  | "profile"
  | "settings"
  | "bugs"


const SIDEBAR_ITEMS: {
    id: View;
    label: string;
    icon: React.ElementType;
}[] = [
        { id: "daily", label: "Daily Problems", icon: Calendar },
        { id: "company", label: "Company Wise", icon: Building2 },
        { id: "topics", label: "Topic Wise", icon: Layers },
        { id: "placement", label: "Placement Mode", icon: Briefcase },
        { id: "community", label: "Community", icon: MessageCircle },
        { id: "profile", label: "Profile", icon: User },
        { id: "settings", label: "Settings", icon: Settings }
    ];

type Props = {
    active: View;
    onChange: (view: View) => void;
};

export default function Sidebar({ active, onChange }: Props) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 hidden md:flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">


            <div className="flex items-center gap-1 p-6">
                <img src={zeroLogo} alt="zero" className="w-15 h-15 inline " />
                
                    <h1 className=" font-geist text-2xl ">zero</h1>
                    
                
            </div>
            
           



            <nav className="flex-1 px-3 space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-geist text-base ${isActive
                                ? "bg-white text-black"
                                : "text-white/70 hover:bg-white/10 font-geist cursor-pointer hover:text-white"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
            <div className="px-3 pb-4">
  <div className="border-t border-white/10 mb-3" />

  <button
    onClick={() => onChange("bugs")}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-geist text-base ${
      active === "bugs"
        ? "bg-red-500 text-white"
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
    );
}
