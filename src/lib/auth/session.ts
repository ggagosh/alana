import { createClient } from '@/lib/supabase/server'

export async function getUserOrThrow() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error('Unauthorized')
  }

  return {
    user: data.user,
  }
}
