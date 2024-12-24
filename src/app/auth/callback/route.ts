import { NextResponse } from 'next/server'

// This route is now just a fallback for any old magic links
// New authentication is handled directly in the login page
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/', new URL(request.url).origin))
}
