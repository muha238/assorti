import { NextResponse, type NextRequest } from "next/server";

/** /admin үшін қарапайым Basic Auth. Продакшнда Supabase Auth-қа ауыстыруға болады. */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse("ADMIN_USER / ADMIN_PASSWORD орнатылмаған", { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const [u, p] = atob(header.slice(6)).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="admin"' },
  });
}

export const config = { matcher: ["/admin/:path*"] };
