'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  regenerativeActions,
  tokenWallet,
  rewards,
  redemptions,
} from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Token rewards by action type
const TOKEN_REWARDS: Record<string, number> = {
  cleanup: 30,
  planting: 50,
  guide: 40,
  trail: 25,
}

// Regenerative Actions
export async function createRegenerativeAction(data: {
  type: string
  title: string
  description?: string
  photoUrl: string
  latitude: number
  longitude: number
  locationName?: string
}) {
  const userId = await getUserId()
  const tokensEarned = TOKEN_REWARDS[data.type] || 20

  const [action] = await db
    .insert(regenerativeActions)
    .values({
      userId,
      ...data,
      tokensEarned,
      status: 'approved', // Auto-approve for MVP
      syncedAt: new Date(),
    })
    .returning()

  // Update wallet
  await db
    .insert(tokenWallet)
    .values({
      userId,
      balance: tokensEarned,
      totalEarned: tokensEarned,
    })
    .onConflictDoUpdate({
      target: tokenWallet.userId,
      set: {
        balance: db.raw(`token_wallet.balance + ${tokensEarned}`),
        totalEarned: db.raw(`token_wallet."totalEarned" + ${tokensEarned}`),
        updatedAt: new Date(),
      },
    })

  revalidatePath('/')
  revalidatePath('/carteira')
  return action
}

export async function getMyActions() {
  const userId = await getUserId()
  return db
    .select()
    .from(regenerativeActions)
    .where(eq(regenerativeActions.userId, userId))
    .orderBy(desc(regenerativeActions.createdAt))
}

export async function getAllApprovedActions() {
  return db
    .select()
    .from(regenerativeActions)
    .where(eq(regenerativeActions.status, 'approved'))
    .orderBy(desc(regenerativeActions.createdAt))
    .limit(50)
}

// Wallet
export async function getWallet() {
  const userId = await getUserId()
  const [wallet] = await db
    .select()
    .from(tokenWallet)
    .where(eq(tokenWallet.userId, userId))

  if (!wallet) {
    const [newWallet] = await db
      .insert(tokenWallet)
      .values({ userId })
      .returning()
    return newWallet
  }

  return wallet
}

// Rewards
export async function getRewards() {
  return db
    .select()
    .from(rewards)
    .where(eq(rewards.active, true))
    .orderBy(rewards.tokenCost)
}

export async function redeemReward(rewardId: number) {
  const userId = await getUserId()

  const [reward] = await db
    .select()
    .from(rewards)
    .where(and(eq(rewards.id, rewardId), eq(rewards.active, true)))

  if (!reward) throw new Error('Recompensa não encontrada')

  const [wallet] = await db
    .select()
    .from(tokenWallet)
    .where(eq(tokenWallet.userId, userId))

  if (!wallet || wallet.balance < reward.tokenCost) {
    throw new Error('Saldo insuficiente de tokens Raiz')
  }

  // Check stock
  if (reward.stock !== null && reward.stock <= 0) {
    throw new Error('Recompensa esgotada')
  }

  // Create redemption
  const redemptionCode = `RAIZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  await db.insert(redemptions).values({
    userId,
    rewardId,
    tokensSpent: reward.tokenCost,
    status: 'completed',
    redemptionCode,
  })

  // Update wallet
  await db
    .update(tokenWallet)
    .set({
      balance: wallet.balance - reward.tokenCost,
      totalSpent: wallet.totalSpent + reward.tokenCost,
      updatedAt: new Date(),
    })
    .where(eq(tokenWallet.userId, userId))

  // Update stock if applicable
  if (reward.stock !== null) {
    await db
      .update(rewards)
      .set({ stock: reward.stock - 1 })
      .where(eq(rewards.id, rewardId))
  }

  revalidatePath('/loja')
  revalidatePath('/carteira')

  return { redemptionCode }
}

export async function getMyRedemptions() {
  const userId = await getUserId()
  return db
    .select({
      redemption: redemptions,
      reward: rewards,
    })
    .from(redemptions)
    .innerJoin(rewards, eq(redemptions.rewardId, rewards.id))
    .where(eq(redemptions.userId, userId))
    .orderBy(desc(redemptions.createdAt))
}
