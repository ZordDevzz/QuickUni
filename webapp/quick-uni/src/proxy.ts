import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(req: NextRequest) {
  // 1. Handle i18n routing first
  const response = handleI18nRouting(req);
  
  // 2. Auth logic
  const token = await getToken({ req });
  const isAuth = !!token;
  
  // Extract pathname without locale for easier checking
  // req.nextUrl.pathname might be "/vi/admin" or "/admin"
  const pathname = req.nextUrl.pathname;
  
  // Helper to check if pathname matches ignoring locale
  const isPath = (path: string) => {
    return pathname === path || routing.locales.some(locale => pathname === `/${locale}${path === '/' ? '' : path}`);
  };

  const isAuthPage = isPath("/login");

  if (isAuthPage) {
    if (isAuth) {
      const userType = token.type as string;
      const targetPath = (userType === "dev" || userType === "tech") ? "/admin" : "/";
      
      // We should redirect to the locale-prefixed version if necessary
      // But usually NextResponse.redirect to a relative path works fine with middleware
      return NextResponse.redirect(new URL(targetPath, req.url));
    }
    return response;
  }

  if (!isAuth) {
    // If it's a public asset or something we don't want to protect, let it pass
    // The matcher already handles most of this, but just in case
    
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  // If user is dev/tech and at root, redirect to admin
  if (isPath("/")) {
    const userType = token.type as string;
    if (userType === "dev" || userType === "tech") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return response;
}

export const config = {
  // Matcher updated to work with locales
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};