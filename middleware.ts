import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"]) 
const isPublicAdminRoute = createRouteMatcher(["/admin-landing"])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()

  // Handle protected routes (user dashboard)
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn()
  }

  // Handle admin routes (but not the public admin-landing page)
  if (!userId && isAdminRoute(req) && !isPublicAdminRoute(req)) {
    // Redirect to admin landing page if not authenticated
    return NextResponse.redirect(new URL('/admin-landing', req.url))
  }

  // Admin role check is handled in the admin layout component
  // to avoid complex DB queries in middleware

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)"
  ]
}
