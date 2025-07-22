import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const authHeader = req.headers.get('authorization')
    
    console.log('Auth test - Headers:', Object.fromEntries(req.headers.entries()))
    console.log('Auth test - Body:', body)
    console.log('Auth test - Auth header:', authHeader)

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      console.log('Auth test - Token (first 20 chars):', token.substring(0, 20))
      
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      return NextResponse.json({
        success: true,
        hasAuthHeader: !!authHeader,
        tokenLength: token.length,
        authError: error?.message || null,
        user: user ? {
          id: user.id,
          email: user.email
        } : null,
        bodyUserId: body.userId
      })
    } else {
      return NextResponse.json({
        success: false,
        hasAuthHeader: false,
        error: "No authorization header"
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
