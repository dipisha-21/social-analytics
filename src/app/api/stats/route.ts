import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "dipisha/app/api/auth/[...nextauth]/route";
import { prisma } from "dipisha/lib/prisma";
import { upsertYoutubeStatsForUser } from "dipisha/lib/youtube";

export async function GET(req: NextRequest) {
  const session: any = await getServerSession(authOptions as any);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const accessToken = session.accessToken as string | undefined;

  let youtube;
  if (accessToken) {
    youtube = await upsertYoutubeStatsForUser(user.id, accessToken);
  } else {
    youtube = await prisma.youtubeChannel.findUnique({
      where: { userId: user.id },
      include: { dailyStats: { orderBy: { date: "asc" } } },
    });
  }

  const pinterest = null;
  const instagram = null;

  return NextResponse.json({
    youtube,
    pinterest,
    instagram,
  });
}
