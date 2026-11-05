import { NextResponse, type NextRequest } from "next/server";
import { roleFromAuthHeader } from "@/lib/auth-core";

/**
 * /admin үшін Basic Auth, екі рөл:
 *  - ADMIN_USER / ADMIN_PASSWORD     → бәрі
 *  - CASHIER_USER / CASHIER_PASSWORD → тапсырыстар + «Бітті/Бар»
 * Рөл тексерісі server action-дардың ішінде де қайталанады (src/lib/auth.ts).
 */
export function middleware(req: NextRequest) {
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD) {
    return new NextResponse("ADMIN_USER / ADMIN_PASSWORD орнатылмаған", { status: 503 });
  }

  const role = roleFromAuthHeader(req.headers.get("authorization"));
  if (!role) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="admin", charset="UTF-8"' },
    });
  }

  // Кассирге статистика беті жабық
  if (role === "cashier" && req.nextUrl.pathname.startsWith("/admin/stats")) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
