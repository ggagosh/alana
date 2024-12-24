'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showOtpInput, setShowOtpInput] = useState(false)

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) {
        throw error
      }

      setShowOtpInput(true)
      setMessage('Check your email for the OTP code!')
    } catch (error) {
      setMessage('Error sending OTP code. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) {
        throw error
      }

      // Redirect to home page after successful verification
      window.location.href = '/'
    } catch (error) {
      setMessage('Invalid OTP code. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {!showOtpInput ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter the code sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowOtpInput(false)
                setOtp('')
                setMessage(null)
              }}
            >
              Back to Email
            </Button>
          </form>
        )}

        {message && (
          <p className={`mt-4 text-center ${
            message.includes('Error') ? 'text-red-500' : 'text-green-500'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
