"use client";

import { useSession, signIn } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type YoutubeDailyStat = {
  id: string;
  date: string;
  views: number;
  subscribers: number;
  videos: number;
};

type YoutubeChannel = {
  id: string;
  title: string;
  subscribers: number;
  views: number;
  videoCount: number;
  lastFetchedAt: string;
  dailyStats: YoutubeDailyStat[];
};

type StatsResponse = {
  youtube: YoutubeChannel | null;
  pinterest: any;
  instagram: any;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const { data, isLoading, error } = useQuery<StatsResponse>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await axios.get("/api/stats");
      return res.data;
    },
    enabled: status === "authenticated",
  });

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <h2 className="text-2xl font-semibold">
          Sign in to see your unified analytics
        </h2>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-sm font-medium"
        >
          Sign in with Google (YouTube)
        </button>
        <p className="text-xs text-slate-400 max-w-md text-center">
          You’ll grant read‑only access to your YouTube analytics. Pinterest
          and Instagram connections will be added using their official APIs.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <p>Loading stats...</p>;
  }

  if (error) {
    return <p className="text-red-400">Failed to load stats.</p>;
  }

  const youtube = data?.youtube;

  const chartData =
    youtube?.dailyStats?.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      views: d.views,
      subscribers: d.subscribers,
    })) ?? [];

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="YouTube subscribers"
          value={youtube?.subscribers ?? 0}
          sublabel={youtube?.title ?? "Not linked yet"}
        />
        <MetricCard
          label="YouTube total views"
          value={youtube?.views ?? 0}
          sublabel="Lifetime channel views"
        />
        <MetricCard
          label="YouTube videos"
          value={youtube?.videoCount ?? 0}
          sublabel="Uploaded videos"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Pinterest impressions"
          value={0}
          sublabel="Connect Pinterest API"
        />
        <MetricCard
          label="Pinterest outbound clicks"
          value={0}
          sublabel="Connect Pinterest API"
        />
        <MetricCard
          label="Instagram reach"
          value={0}
          sublabel="Connect Instagram API"
        />
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">
          YouTube growth (last days)
        </h3>
        {chartData.length === 0 ? (
          <p className="text-xs text-slate-400">
            No historical data yet. Keep the app running daily or deploy to
            collect stats over time.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="subscribers"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number;
  sublabel?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold">
        {value.toLocaleString("en-IN")}
      </p>
      {sublabel && (
        <p className="text-[11px] text-slate-500 mt-1">{sublabel}</p>
      )}
    </div>
  );
}
