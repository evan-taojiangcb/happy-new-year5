import { NextRequest, NextResponse } from "next/server";
import { getWishStore } from "@/lib/wish-store";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const key = request.headers.get("x-release-key");
    const expected = process.env.RELEASE_API_KEY;

    if (expected && key !== expected) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const updated = await getWishStore().releaseAllActive();
    return NextResponse.json({ updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "release failed", detail: String(error) }, { status: 500 });
  }
}
