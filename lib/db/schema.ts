import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  doublePrecision,
} from 'drizzle-orm/pg-core'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// App-specific tables

export const regenerativeActions = pgTable('regenerative_actions', {
  id: serial('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'cleanup', 'planting', 'guide', 'trail'
  title: text('title').notNull(),
  description: text('description'),
  photoUrl: text('photoUrl').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  locationName: text('locationName'),
  tokensEarned: integer('tokensEarned').notNull().default(0),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  syncedAt: timestamp('syncedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const tokenWallet = pgTable('token_wallet', {
  id: serial('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
  totalEarned: integer('totalEarned').notNull().default(0),
  totalSpent: integer('totalSpent').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'hospedagem', 'artesanato', 'passeio', 'parceiro'
  tokenCost: integer('tokenCost').notNull(),
  imageUrl: text('imageUrl'),
  partnerName: text('partnerName'),
  partnerLogo: text('partnerLogo'),
  stock: integer('stock'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const redemptions = pgTable('redemptions', {
  id: serial('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rewardId: integer('rewardId')
    .notNull()
    .references(() => rewards.id),
  tokensSpent: integer('tokensSpent').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'cancelled'
  redemptionCode: text('redemptionCode'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Types
export type User = typeof user.$inferSelect
export type RegenerativeAction = typeof regenerativeActions.$inferSelect
export type NewRegenerativeAction = typeof regenerativeActions.$inferInsert
export type TokenWallet = typeof tokenWallet.$inferSelect
export type Reward = typeof rewards.$inferSelect
export type Redemption = typeof redemptions.$inferSelect
