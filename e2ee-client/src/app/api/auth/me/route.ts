import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");

  const backendRes = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/me`,
    {
      headers: {
        cookie: cookie || "",
      },
    }
  );

  const data = await backendRes.json();

  return NextResponse.json(data, {
    status: backendRes.status,
  });
}
