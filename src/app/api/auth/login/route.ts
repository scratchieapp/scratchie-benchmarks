import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Get passwords from environment variables
    const fullPassword = process.env.AUTH_PASSWORD_FULL || 'sync2025'
    const simplePassword = process.env.AUTH_PASSWORD_SIMPLE || 'simple2025'

    // Check password and return appropriate access level
    if (password === fullPassword) {
      return NextResponse.json({
        success: true,
        level: 'full',
        redirect: '/'
      })
    } else if (password === simplePassword) {
      return NextResponse.json({
        success: true,
        level: 'simple',
        redirect: '/simple'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid password'
      }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 })
  }
}