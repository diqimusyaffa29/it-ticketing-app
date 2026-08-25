import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Jika belum login tapi ingin mengakses halaman dashboard, maka akan dialihkan ke halaman login
    if (!token && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // sebaliknya, jika sudah login tapi ingin mengakses halaman login atau register maka akan dialihkan ke halaman dashboard
    if (token && (pathname === '/login' || pathname === '/regiter')) {
        return NextResponse.redirect(new URL('/dasboard', request.url))
    }

    return NextResponse.next()
}


export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
}