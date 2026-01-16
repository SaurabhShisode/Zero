import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../dashboard/Sidebar";
import type { View } from "../dashboard/Sidebar";


import DailyView from "../dashboard/DailyView";
import CompanyView from "../dashboard/CompanyView";
import TopicsView from "../dashboard/TopicsView";
import PlacementView from "../dashboard/PlacementView";
import DiscussionsView from "../dashboard/DiscussionsView";
import ProfileView from "../dashboard/ProfileView";
import SettingsView from "../dashboard/SettingsView";

export default function Dashboard() {
  const [view, setView] = useState<View>("daily");

  const renderView = () => {
    switch (view) {
      case "company":
        return <CompanyView />;
      case "topics":
        return <TopicsView />;
      case "placement":
        return <PlacementView />;
      case "discussions":
        return <DiscussionsView />;
      case "profile":
        return <ProfileView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DailyView />;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-[#020617] text-white flex">
     
      <Sidebar active={view} onChange={setView} />

      <main className="ml-0 md:ml-64 h-screen w-full overflow-y-auto">
        {renderView()}
      </main>
    </div>
    </>
  );
}
