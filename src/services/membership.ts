// 会員・ポイント・紹介システム サービス層

import type { D1Database } from '@cloudflare/workers-types'

// 型定義
export interface Member {
  id: number
  email: string
  name: string | null
  phone: string | null
  referral_code: string
  referred_by: string | null
  total_points: number
  current_points: number
  total_bookings: number
  membership_tier: string
  created_at: string
  updated_at: string
}

export interface PointHistory {
  id: number
  member_id: number
  points: number
  balance_after: number
  type: 'booking' | 'referral' | 'coupon_use' | 'admin' | 'expire' | 'welcome' | 'milestone'
  description: string | null
  related_booking_id: number | null
  related_coupon_id: number | null
  created_at: string
}

export interface Coupon {
  id: number
  code: string
  member_id: number | null
  type: 'percentage' | 'fixed' | 'points'
  value: number
  min_amount: number
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: number
  created_at: string
}

export interface MembershipTier {
  tier_name: string
  min_bookings: number
  points_multiplier: number
  discount_rate: number
  description: string
}

export interface RewardSettings {
  points_per_booking: number
  points_per_yen: number
  referral_bonus_referrer: number
  referral_bonus_referred: number
  points_to_yen: number
  welcome_bonus: number
  milestone_5_bookings: number
  milestone_10_bookings: number
}

// ユニークな紹介コードを生成
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 紛らわしい文字を除外
  let code = 'MC' // mirAIcafeの略
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// 設定値を取得
async function getRewardSettings(db: D1Database): Promise<RewardSettings> {
  const results = await db.prepare(`
    SELECT setting_key, setting_value FROM reward_settings
  `).all()
  
  const settings: Record<string, string> = {}
  for (const row of (results.results || []) as { setting_key: string; setting_value: string }[]) {
    settings[row.setting_key] = row.setting_value
  }
  
  return {
    points_per_booking: parseInt(settings.points_per_booking || '100'),
    points_per_yen: parseFloat(settings.points_per_yen || '0.01'),
    referral_bonus_referrer: parseInt(settings.referral_bonus_referrer || '500'),
    referral_bonus_referred: parseInt(settings.referral_bonus_referred || '300'),
    points_to_yen: parseFloat(settings.points_to_yen || '1'),
    welcome_bonus: parseInt(settings.welcome_bonus || '100'),
    milestone_5_bookings: parseInt(settings.milestone_5_bookings || '500'),
    milestone_10_bookings: parseInt(settings.milestone_10_bookings || '1000'),
  }
}

// 会員ランク情報を取得
async function getMembershipTiers(db: D1Database): Promise<MembershipTier[]> {
  const results = await db.prepare(`
    SELECT * FROM membership_tiers ORDER BY min_bookings ASC
  `).all()
  return (results.results || []) as MembershipTier[]
}

// 適切な会員ランクを判定
async function calculateTier(db: D1Database, totalBookings: number): Promise<string> {
  const tiers = await getMembershipTiers(db)
  let currentTier = 'standard'
  
  for (const tier of tiers) {
    if (totalBookings >= tier.min_bookings) {
      currentTier = tier.tier_name
    }
  }
  
  return currentTier
}

// ===== 会員登録・取得 =====

// メールアドレスで会員を取得（なければ作成）
export async function getOrCreateMember(
  db: D1Database,
  email: string,
  name?: string,
  phone?: string,
  referredByCode?: string
): Promise<{ member: Member; isNew: boolean; welcomePoints: number }> {
  // 既存会員を検索
  let member = await db.prepare(`
    SELECT * FROM members WHERE email = ?
  `).bind(email).first() as Member | null
  
  if (member) {
    // 既存会員の場合、名前や電話番号を更新（空でない場合のみ）
    if (name || phone) {
      await db.prepare(`
        UPDATE members SET 
          name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(name || null, phone || null, member.id).run()
      
      // 更新後のデータを再取得
      member = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(member.id).first() as Member
    }
    return { member, isNew: false, welcomePoints: 0 }
  }
  
  // 新規会員を作成
  const settings = await getRewardSettings(db)
  let referralCode = generateReferralCode()
  
  // 紹介コードの重複チェック
  let attempts = 0
  while (attempts < 10) {
    const existing = await db.prepare(`
      SELECT id FROM members WHERE referral_code = ?
    `).bind(referralCode).first()
    if (!existing) break
    referralCode = generateReferralCode()
    attempts++
  }
  
  // 紹介者の検証
  let validReferredBy: string | null = null
  if (referredByCode) {
    const referrer = await db.prepare(`
      SELECT id FROM members WHERE referral_code = ?
    `).bind(referredByCode.toUpperCase()).first()
    if (referrer) {
      validReferredBy = referredByCode.toUpperCase()
    }
  }
  
  // 会員作成
  const result = await db.prepare(`
    INSERT INTO members (email, name, phone, referral_code, referred_by, current_points, total_points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    email,
    name || null,
    phone || null,
    referralCode,
    validReferredBy,
    settings.welcome_bonus,
    settings.welcome_bonus
  ).run()
  
  const newMemberId = result.meta?.last_row_id
  
  // ウェルカムポイントの履歴を記録
  if (settings.welcome_bonus > 0) {
    await db.prepare(`
      INSERT INTO point_history (member_id, points, balance_after, type, description)
      VALUES (?, ?, ?, 'welcome', '新規会員登録ボーナス')
    `).bind(newMemberId, settings.welcome_bonus, settings.welcome_bonus).run()
  }
  
  // 紹介者との関係を記録
  if (validReferredBy) {
    const referrer = await db.prepare(`
      SELECT id FROM members WHERE referral_code = ?
    `).bind(validReferredBy).first() as { id: number } | null
    
    if (referrer) {
      await db.prepare(`
        INSERT INTO referrals (referrer_id, referred_id, status)
        VALUES (?, ?, 'pending')
      `).bind(referrer.id, newMemberId).run()
    }
  }
  
  member = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(newMemberId).first() as Member
  
  return { member, isNew: true, welcomePoints: settings.welcome_bonus }
}

// メールアドレスで会員を取得
export async function getMemberByEmail(db: D1Database, email: string): Promise<Member | null> {
  return await db.prepare(`
    SELECT * FROM members WHERE email = ?
  `).bind(email).first() as Member | null
}

// 紹介コードで会員を取得
export async function getMemberByReferralCode(db: D1Database, code: string): Promise<Member | null> {
  return await db.prepare(`
    SELECT * FROM members WHERE referral_code = ?
  `).bind(code.toUpperCase()).first() as Member | null
}

// ===== ポイント処理 =====

// 予約完了時にポイントを付与
export async function awardPointsForBooking(
  db: D1Database,
  memberId: number,
  bookingId: number,
  paymentAmount: number
): Promise<{ pointsAwarded: number; milestoneBonus: number; tierUpdated: boolean; newTier: string }> {
  const settings = await getRewardSettings(db)
  const member = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(memberId).first() as Member
  
  if (!member) {
    throw new Error('会員が見つかりません')
  }
  
  // ランク情報を取得
  const tiers = await getMembershipTiers(db)
  const currentTierInfo = tiers.find(t => t.tier_name === member.membership_tier)
  const multiplier = currentTierInfo?.points_multiplier || 1.0
  
  // 基本ポイント + 金額ベースポイント
  const basePoints = settings.points_per_booking
  const amountPoints = Math.floor(paymentAmount * settings.points_per_yen)
  let totalPoints = Math.floor((basePoints + amountPoints) * multiplier)
  
  // マイルストーンボーナスのチェック
  const newTotalBookings = member.total_bookings + 1
  let milestoneBonus = 0
  
  if (newTotalBookings === 5) {
    milestoneBonus = settings.milestone_5_bookings
  } else if (newTotalBookings === 10) {
    milestoneBonus = settings.milestone_10_bookings
  }
  
  // ポイントを更新
  const newCurrentPoints = member.current_points + totalPoints + milestoneBonus
  const newTotalPoints = member.total_points + totalPoints + milestoneBonus
  
  // 新しいランクを計算
  const newTier = await calculateTier(db, newTotalBookings)
  const tierUpdated = newTier !== member.membership_tier
  
  // 会員情報を更新
  await db.prepare(`
    UPDATE members SET
      current_points = ?,
      total_points = ?,
      total_bookings = ?,
      membership_tier = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).bind(newCurrentPoints, newTotalPoints, newTotalBookings, newTier, memberId).run()
  
  // ポイント履歴を記録
  await db.prepare(`
    INSERT INTO point_history (member_id, points, balance_after, type, description, related_booking_id)
    VALUES (?, ?, ?, 'booking', ?, ?)
  `).bind(
    memberId,
    totalPoints,
    member.current_points + totalPoints,
    `講座受講ポイント（${multiplier}倍）`,
    bookingId
  ).run()
  
  // マイルストーンボーナスがある場合は別途記録
  if (milestoneBonus > 0) {
    await db.prepare(`
      INSERT INTO point_history (member_id, points, balance_after, type, description, related_booking_id)
      VALUES (?, ?, ?, 'milestone', ?, ?)
    `).bind(
      memberId,
      milestoneBonus,
      newCurrentPoints,
      `${newTotalBookings}回受講達成ボーナス`,
      bookingId
    ).run()
  }
  
  // 紹介者への報酬処理（最初の予約の場合）
  if (newTotalBookings === 1 && member.referred_by) {
    await processReferralReward(db, memberId, bookingId)
  }
  
  return {
    pointsAwarded: totalPoints,
    milestoneBonus,
    tierUpdated,
    newTier
  }
}

// 紹介報酬を処理
async function processReferralReward(db: D1Database, referredMemberId: number, bookingId: number): Promise<void> {
  const settings = await getRewardSettings(db)
  
  // 紹介レコードを取得
  const referral = await db.prepare(`
    SELECT r.*, m.id as referrer_member_id, m.current_points as referrer_points
    FROM referrals r
    JOIN members m ON r.referrer_id = m.id
    WHERE r.referred_id = ? AND r.status = 'pending'
  `).bind(referredMemberId).first() as any
  
  if (!referral) return
  
  // 紹介者にポイントを付与
  const referrerNewPoints = referral.referrer_points + settings.referral_bonus_referrer
  await db.prepare(`
    UPDATE members SET current_points = ?, total_points = total_points + ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(referrerNewPoints, settings.referral_bonus_referrer, referral.referrer_member_id).run()
  
  // 紹介者のポイント履歴
  await db.prepare(`
    INSERT INTO point_history (member_id, points, balance_after, type, description)
    VALUES (?, ?, ?, 'referral', '紹介ボーナス（お友達が初回予約）')
  `).bind(referral.referrer_member_id, settings.referral_bonus_referrer, referrerNewPoints).run()
  
  // 被紹介者にもボーナスポイント
  const referred = await db.prepare(`SELECT current_points FROM members WHERE id = ?`).bind(referredMemberId).first() as { current_points: number }
  const referredNewPoints = referred.current_points + settings.referral_bonus_referred
  
  await db.prepare(`
    UPDATE members SET current_points = ?, total_points = total_points + ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(referredNewPoints, settings.referral_bonus_referred, referredMemberId).run()
  
  await db.prepare(`
    INSERT INTO point_history (member_id, points, balance_after, type, description)
    VALUES (?, ?, ?, 'referral', '紹介特典ボーナス')
  `).bind(referredMemberId, settings.referral_bonus_referred, referredNewPoints).run()
  
  // 紹介レコードを更新
  await db.prepare(`
    UPDATE referrals SET
      status = 'rewarded',
      referrer_reward_points = ?,
      referred_reward_points = ?,
      first_booking_id = ?,
      rewarded_at = datetime('now')
    WHERE id = ?
  `).bind(settings.referral_bonus_referrer, settings.referral_bonus_referred, bookingId, referral.id).run()
}

// ===== クーポン処理 =====

// クーポンを検証
export async function validateCoupon(
  db: D1Database,
  code: string,
  memberId: number | null,
  orderAmount: number
): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; error?: string }> {
  const coupon = await db.prepare(`
    SELECT * FROM coupons WHERE code = ? AND is_active = 1
  `).bind(code.toUpperCase()).first() as Coupon | null
  
  if (!coupon) {
    return { valid: false, error: 'クーポンが見つかりません' }
  }
  
  // 有効期限チェック
  const now = new Date()
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { valid: false, error: 'このクーポンはまだ有効期限前です' }
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { valid: false, error: 'このクーポンは有効期限切れです' }
  }
  
  // 使用回数チェック
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: 'このクーポンは使用上限に達しています' }
  }
  
  // 会員専用クーポンのチェック
  if (coupon.member_id && coupon.member_id !== memberId) {
    return { valid: false, error: 'このクーポンはご利用いただけません' }
  }
  
  // 最低金額チェック
  if (orderAmount < coupon.min_amount) {
    return { valid: false, error: `このクーポンは${coupon.min_amount}円以上のご注文で利用できます` }
  }
  
  // 割引額を計算
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.floor(orderAmount * (coupon.value / 100))
  } else if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, orderAmount)
  } else if (coupon.type === 'points') {
    // ポイント変換の場合は別処理
    discount = 0
  }
  
  return { valid: true, coupon, discount }
}

// クーポンを使用
export async function useCoupon(
  db: D1Database,
  couponId: number,
  memberId: number,
  bookingId: number,
  discountAmount: number
): Promise<void> {
  // クーポン使用回数を更新
  await db.prepare(`
    UPDATE coupons SET used_count = used_count + 1 WHERE id = ?
  `).bind(couponId).run()
  
  // 使用履歴を記録
  await db.prepare(`
    INSERT INTO coupon_usage (coupon_id, member_id, booking_id, discount_amount)
    VALUES (?, ?, ?, ?)
  `).bind(couponId, memberId, bookingId, discountAmount).run()
}

// 会員専用クーポンを発行
export async function createMemberCoupon(
  db: D1Database,
  memberId: number,
  type: 'percentage' | 'fixed',
  value: number,
  validDays: number = 30,
  description?: string
): Promise<Coupon> {
  // ユニークなクーポンコードを生成
  const code = `MC${memberId}-${Date.now().toString(36).toUpperCase()}`
  
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + validDays)
  
  const result = await db.prepare(`
    INSERT INTO coupons (code, member_id, type, value, max_uses, valid_until)
    VALUES (?, ?, ?, ?, 1, ?)
  `).bind(code, memberId, type, value, validUntil.toISOString()).run()
  
  return await db.prepare(`SELECT * FROM coupons WHERE id = ?`).bind(result.meta?.last_row_id).first() as Coupon
}

// ===== ポイント使用 =====

// ポイントを使用
export async function usePoints(
  db: D1Database,
  memberId: number,
  points: number,
  bookingId?: number,
  description?: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  const member = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(memberId).first() as Member
  
  if (!member) {
    return { success: false, error: '会員が見つかりません' }
  }
  
  if (member.current_points < points) {
    return { success: false, error: 'ポイントが不足しています' }
  }
  
  const newBalance = member.current_points - points
  
  await db.prepare(`
    UPDATE members SET current_points = ?, updated_at = datetime('now') WHERE id = ?
  `).bind(newBalance, memberId).run()
  
  await db.prepare(`
    INSERT INTO point_history (member_id, points, balance_after, type, description, related_booking_id)
    VALUES (?, ?, ?, 'coupon_use', ?, ?)
  `).bind(memberId, -points, newBalance, description || 'ポイント利用', bookingId || null).run()
  
  return { success: true, newBalance }
}

// ===== 会員情報取得 =====

// 会員のポイント履歴を取得
export async function getPointHistory(db: D1Database, memberId: number, limit: number = 20): Promise<PointHistory[]> {
  const results = await db.prepare(`
    SELECT * FROM point_history WHERE member_id = ? ORDER BY created_at DESC LIMIT ?
  `).bind(memberId, limit).all()
  return (results.results || []) as PointHistory[]
}

// 会員の紹介実績を取得
export async function getReferralStats(db: D1Database, memberId: number): Promise<{
  totalReferrals: number
  completedReferrals: number
  totalEarnedPoints: number
}> {
  const stats = await db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'rewarded' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'rewarded' THEN referrer_reward_points ELSE 0 END) as earned
    FROM referrals WHERE referrer_id = ?
  `).bind(memberId).first() as { total: number; completed: number; earned: number }
  
  return {
    totalReferrals: stats.total || 0,
    completedReferrals: stats.completed || 0,
    totalEarnedPoints: stats.earned || 0
  }
}

// 会員ダッシュボード用データを取得
export async function getMemberDashboard(db: D1Database, memberId: number): Promise<{
  member: Member
  tier: MembershipTier | null
  pointHistory: PointHistory[]
  referralStats: { totalReferrals: number; completedReferrals: number; totalEarnedPoints: number }
  availableCoupons: Coupon[]
}> {
  const member = await db.prepare(`SELECT * FROM members WHERE id = ?`).bind(memberId).first() as Member
  
  if (!member) {
    throw new Error('会員が見つかりません')
  }
  
  const tiers = await getMembershipTiers(db)
  const tier = tiers.find(t => t.tier_name === member.membership_tier) || null
  
  const pointHistory = await getPointHistory(db, memberId, 10)
  const referralStats = await getReferralStats(db, memberId)
  
  const couponsResult = await db.prepare(`
    SELECT * FROM coupons 
    WHERE (member_id = ? OR member_id IS NULL)
      AND is_active = 1
      AND (valid_until IS NULL OR valid_until > datetime('now'))
      AND (max_uses IS NULL OR used_count < max_uses)
    ORDER BY valid_until ASC
  `).bind(memberId).all()
  
  return {
    member,
    tier,
    pointHistory,
    referralStats,
    availableCoupons: (couponsResult.results || []) as Coupon[]
  }
}
