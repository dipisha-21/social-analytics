import axios from "axios";
import { prisma } from "dipisha/lib/prisma";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function fetchYoutubeChannelStats(accessToken: string) {
  const res = await axios.get(`${YT_API_BASE}/channels`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      part: "snippet,statistics",
      mine: true,
    },
  });

  const item = res.data.items?.[0];
  if (!item) return null;

  return {
    channelId: item.id as string,
    title: item.snippet.title as string,
    subscribers: parseInt(item.statistics.subscriberCount || "0", 10),
    views: parseInt(item.statistics.viewCount || "0", 10),
    videoCount: parseInt(item.statistics.videoCount || "0", 10),
  };
}

export async function upsertYoutubeStatsForUser(
  userId: string,
  accessToken: string
) {
  const stats = await fetchYoutubeChannelStats(accessToken);
  if (!stats) return null;

  const now = new Date();
  const today = new Date(now.toISOString().slice(0, 10));

  const channel = await prisma.youtubeChannel.upsert({
    where: { userId },
    update: {
      channelId: stats.channelId,
      title: stats.title,
      subscribers: stats.subscribers,
      views: stats.views,
      videoCount: stats.videoCount,
      lastFetchedAt: now,
    },
    create: {
      userId,
      channelId: stats.channelId,
      title: stats.title,
      subscribers: stats.subscribers,
      views: stats.views,
      videoCount: stats.videoCount,
      lastFetchedAt: now,
    },
  });

  await prisma.youtubeDailyStat.upsert({
    where: {
      youtubeId_date: {
        youtubeId: channel.id,
        date: today,
      },
    },
    update: {
      views: stats.views,
      subscribers: stats.subscribers,
      videos: stats.videoCount,
    },
    create: {
      youtubeId: channel.id,
      date: today,
      views: stats.views,
      subscribers: stats.subscribers,
      videos: stats.videoCount,
    },
  });

  return channel;
}
