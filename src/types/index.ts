export type UserRole = 'viewer' | 'creator' | 'admin';

export interface CreatorEarnings {
  totalEarned: number; // in fiat currency (e.g. USD)
  available: number;
  pending: number;
  totalWithdrawn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  channelName?: string;
  channelDescription?: string;
  channelBanner?: string;
  credits: number;
  creatorEarnings: CreatorEarnings;
  status: 'active' | 'suspended';
  createdAt: string;
  subscribersCount?: number;
}

export interface Video {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  views: number;
  paidMinutes: number;
  likes: number;
  creditCostPerMinute: number; // Default 1
  createdAt: string;
  isPublished: boolean;
  isFlagged?: boolean;
  flagReason?: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export type LedgerEntryType =
  | 'CREDIT_PURCHASE'
  | 'MINUTE_DEBIT'
  | 'CREATOR_CREDIT'
  | 'PLATFORM_CREDIT'
  | 'PAYOUT_WITHDRAWAL'
  | 'REFUND';

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: LedgerEntryType;
  userId: string;
  userName?: string;
  creatorId?: string;
  creatorName?: string;
  videoId?: string;
  videoTitle?: string;
  creditDelta: number;
  amountFiat: number;
  currency: string;
  description: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface CreditPack {
  id: string;
  name: string;
  tagline: string;
  credits: number;
  priceFiat: number;
  currency: string;
  badge?: string;
  popular?: boolean;
  active: boolean;
}

export type PaymentMethod = 'CRYPTO' | 'FLEXY';
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REJECTED';

export interface CryptoDetails {
  cryptoCurrency: 'USDT' | 'BTC' | 'ETH';
  network: 'TRC20' | 'ERC20' | 'Bitcoin' | 'EVM';
  depositAddress: string;
  amountCrypto: string;
  txHash?: string;
  expiresAt: string;
}

export interface FlexyDetails {
  operator: 'Mobilis' | 'Djezzy' | 'Ooredoo';
  senderPhoneNumber: string;
  flexyTargetNumber: string;
  transactionReference: string;
  receiptNote?: string;
  adminReviewNote?: string;
  reviewedAt?: string;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  userName: string;
  packId: string;
  packName: string;
  credits: number;
  amountFiat: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  cryptoDetails?: CryptoDetails;
  flexyDetails?: FlexyDetails;
  createdAt: string;
  confirmedAt?: string;
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
export type PayoutMethod =
  | 'FLEXY'
  | 'FLEXY_MOBILIS'
  | 'FLEXY_DJEZZY'
  | 'FLEXY_OOREDOO'
  | 'USDT_TRC20'
  | 'BARIDIMOB_CCP'
  | 'BANK_WIRE';

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  amount: number;
  amountDzd?: number;
  currency: string;
  method: PayoutMethod;
  operator?: 'Mobilis' | 'Djezzy' | 'Ooredoo';
  phoneNumber?: string;
  accountDetails: string;
  status: PayoutStatus;
  rejectionReason?: string;
  txId?: string;
  createdAt: string;
  processedAt?: string;
}

export interface WatchSession {
  sessionId: string;
  userId: string;
  videoId: string;
  creatorId: string;
  startedAt: number;
  lastHeartbeatAt: number;
  currentPlaybackTime: number;
  accumulatedWatchedSeconds: number;
  billedMinutes: number;
  token: string;
  active: boolean;
}

export interface PlatformSettings {
  platformName: string;
  creditFiatValue: number; // e.g. 0.10 $ per credit
  creatorSharePercentage: number; // e.g. 50
  platformSharePercentage: number; // e.g. 50
  currency: string; // 'USD'
  minWithdrawalThreshold: number; // 20.00
  flexyTargetMobilis: string;
  flexyTargetDjezzy: string;
  flexyTargetOoredoo: string;
  cryptoUsdtAddress: string;
  cryptoBtcAddress: string;
  cryptoEthAddress: string;
  cryptoEvmAddress?: string;
  adminEmail?: string;
}

export interface HeartbeatRequest {
  sessionId: string;
  videoId: string;
  currentTime: number;
  playbackRate: number;
  token: string;
  idempotencyKey?: string;
}

export interface HeartbeatResponse {
  success: boolean;
  sessionId: string;
  remainingCredits: number;
  accumulatedSecondsInCurrentMinute: number;
  totalBilledMinutesThisSession: number;
  justBilled: boolean;
  stopPlayback: boolean;
  stopReason?: string;
  warning?: string;
}

export interface AuditSecurityLog {
  id: string;
  timestamp: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'ALERT';
  userId?: string;
  details: string;
  ipAddress?: string;
}
