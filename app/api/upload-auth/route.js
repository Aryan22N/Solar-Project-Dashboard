import { IK_PUBLIC_KEY, IK_PRIVATE_KEY, IK_URL_ENDPOINT } from "@/lib/imagekit";
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use @imagekit/next/server's official auth param generator
    const authParams = getUploadAuthParams({
      privateKey: IK_PRIVATE_KEY,
      publicKey: IK_PUBLIC_KEY,
    });

    return NextResponse.json({
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
      publicKey: IK_PUBLIC_KEY,
      urlEndpoint: IK_URL_ENDPOINT,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
