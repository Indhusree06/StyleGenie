"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testAuthConnection, supabase } from "@/lib/supabase"

export function DebugAuth() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const runConnectionTest = async () => {
    setLoading(true)
    setTestResult("Testing connection...")

    try {
      // Test 1: Basic auth connection
      const authTest = await testAuthConnection()
      let result = `Auth Connection Test: ${authTest.success ? "✅ Success" : "❌ Failed"}\n`
      if (authTest.error) {
        result += `Error: ${authTest.error}\n`
      }

      // Test 2: Try to get session
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      result += `Session Test: ${sessionError ? "❌ Failed" : "✅ Success"}\n`
      if (sessionError) {
        result += `Session Error: ${sessionError.message}\n`
      }

      // Test 3: Try a simple sign in with demo credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: "demo@stylegenie.com",
        password: "demo123"
      })
      result += `Demo Sign In Test: ${signInError ? "❌ Failed" : "✅ Success"}\n`
      if (signInError) {
        result += `Sign In Error: ${signInError.message}\n`
      }

      setTestResult(result)
    } catch (err) {
      setTestResult(`Network Error: ${err}`)
    }
    
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Auth Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runConnectionTest} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Run Connection Test"}
        </Button>
        
        {testResult && (
          <div className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap">
            {testResult}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
