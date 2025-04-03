import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/session-middleware";
import { varifyToken } from "@/utils/supabase/auth-middleware";

export async function middleware(request: NextRequest) {
  let response = await updateSession(request);
  if (response.status !== 200) return response;
  response = await varifyToken(request);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/api/:path*",
  ],
};
