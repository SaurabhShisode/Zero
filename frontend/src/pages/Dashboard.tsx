import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../api/client";

type DailyProblem = {
  _id: string;
  skill: string;
  problem: {
    title: string;
    link: string;
  };
};

export default function Dashboard() {
  const [daily, setDaily] = useState<DailyProblem[]>([]);

  useEffect(() => {
    api.get("/api/daily").then((res) => setDaily(res.data.daily));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="p-6 space-y-6">
        <h1 className="text-xl font-semibold">Today</h1>

        {daily.length === 0 && (
          <p className="text-gray-400">No daily problems yet</p>
        )}

        {daily.map((item) => (
          <div
            key={item._id}
            className="border border-gray-800 rounded p-4 space-y-2"
          >
            <div className="text-sm text-gray-400">{item.skill}</div>
            <div className="font-medium">{item.problem.title}</div>
            <a
              href={item.problem.link}
              target="_blank"
              className="text-blue-400 underline text-sm"
            >
              Open problem
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
