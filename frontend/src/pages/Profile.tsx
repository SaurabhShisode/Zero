import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { api } from "../api/client";

export default function Profile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get(`/profile/${slug}`).then((res) => setProfile(res.data));
  }, [slug]);

  if (!profile) {
    return <div className="p-6 text-white">Loading</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">{profile.user.name}</h1>
        <p className="text-gray-400">Streak: {profile.user.streak.current}</p>

        <div>
          <h2 className="font-medium mb-2">Recent Activity</h2>
          <ul className="text-sm text-gray-400">
            {profile.recent.map((r: any, i: number) => (
              <li key={i}>{new Date(r.date).toDateString()}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
