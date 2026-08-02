import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { userHasActiveCabinetAccess } from '@/lib/subscription'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: user.subscription
        ? {
            status: user.subscription.status,
            paidUntil: user.subscription.paidUntil,
          }
        : null,
      hasCabinetAccess: userHasActiveCabinetAccess(user),
    },
  })
}
