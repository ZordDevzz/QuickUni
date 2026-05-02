import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(req: NextRequest) {
  // 1. Handle i18n routing first
  const response = handleI18nRouting(req);
  
  // 2. Auth logic
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  const isAuth = !!token;
  
  // Extract pathname and normalize it (remove trailing slash except for root)
  let pathname = req.nextUrl.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  
  // Helper to check if pathname matches ignoring locale
  const isPath = (path: string) => {
    // Normalize target path
    const target = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;
    return pathname === target || routing.locales.some(locale => pathname === `/${locale}${target === '/' ? '' : target}`);
  };

  const isAuthPage = isPath("/login");

  if (isAuthPage) {
    if (isAuth) {
      const userType = token.type as string;
      const targetPath = (userType === "dev" || userType === "tech") ? "/admin" : "/";
      
      return NextResponse.redirect(new URL(targetPath, req.url));
    }
    return response;
  }

  if (!isAuth) {
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