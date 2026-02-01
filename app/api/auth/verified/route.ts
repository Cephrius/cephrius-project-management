import { NextResponse } from "next/server";



export async function POST() {
    const res = NextResponse.json({ ok: true });

    res.cookies.set("bf_verified", "1", {
        path: "/",
        httpOnly: false,  // client can read it to show the banner
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 120 // 2 minutes
    })

    return res;
}