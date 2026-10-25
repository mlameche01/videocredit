import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Video,
  Comment,
  LedgerEntry,
  CreditPack,
  PaymentOrder,
  PayoutRequest,
  PayoutMethod,
  PlatformSettings,
  WatchSession,
  AuditSecurityLog,
  HeartbeatRequest,
  HeartbeatResponse,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  videos: Video[];
  comments: Comment[];
  ledger: LedgerEntry[];
  creditPacks: CreditPack[];
  orders: PaymentOrder[];
  payoutRequests: PayoutRequest[];
  settings: PlatformSettings;
  auditLogs: AuditSecurityLog[];
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'VideoCredit',
  creditFiatValue: 0.1, // $0.10 per credit ($6.00 / hour of video)
  creatorSharePercentage: 50,
  platformSharePercentage: 50,
  currency: 'USD',
  minWithdrawalThreshold: 20.0,
  flexyTargetMobilis: '0666496676',
  flexyTargetDjezzy: '0784145118',
  flexyTargetOoredoo: '0558953440',
  cryptoUsdtAddress: '0xCD150992C7db67571fe90211509B659826544Bf6 (EVM / ERC20)',
  cryptoBtcAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  cryptoEthAddress: '0xCD150992C7db67571fe90211509B659826544Bf6',
  cryptoEvmAddress: '0xCD150992C7db67571fe90211509B659826544Bf6',
  adminEmail: 'lamechemounir@gmail.com',
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr_viewer_1',
    email: 'spectateur@videocredit.io',
    name: 'Karim Mansour',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    credits: 65,
    creatorEarnings: { totalEarned: 0, available: 0, pending: 0, totalWithdrawn: 0 },
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'usr_creator_1',
    email: 'createur@videocredit.io',
    name: 'Amine DevLab',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    channelName: 'Amine DevLab • Tech & IA',
    channelDescription: 'Tutoriels avancés de programmation, intelligence artificielle, et architecture logicielle pour développeurs ambitieux.',
    channelBanner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    credits: 120,
    creatorEarnings: {
      totalEarned: 245.8,
      available: 185.8,
      pending: 60.0,
      totalWithdrawn: 100.0,
    },
    status: 'active',
    createdAt: '2024-11-01T08:30:00Z',
    subscribersCount: 1420,
  },
  {
    id: 'usr_creator_2',
    email: 'sarah.cinema@videocredit.io',
    name: 'Sarah Benali',
    role: 'creator',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    channelName: 'Studio Documentaire 4K',
    channelDescription: 'Exploration cinématographique, découvertes culturelles et reportages immersifs à travers le monde.',
    channelBanner: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
    credits: 80,
    creatorEarnings: {
      totalEarned: 410.5,
      available: 310.5,
      pending: 100.0,
      totalWithdrawn: 200.0,
    },
    status: 'active',
    createdAt: '2024-09-12T12:00:00Z',
    subscribersCount: 3890,
  },
  {
    id: 'usr_admin_1',
    email: 'lamechemounir@gmail.com',
    name: 'Mounir Lamèche (Admin)',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    credits: 9999,
    creatorEarnings: { totalEarned: 0, available: 0, pending: 0, totalWithdrawn: 0 },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const INITIAL_VIDEOS: Video[] = [
  {
    id: 'vid_1',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Masterclass : Architecture Microservices & Scaling Haute Fréquence',
    description: 'Plongez dans les patterns de scalabilité, idempotence financière et gestion de files de messages Redis/Kafka pour architectures critiques.',
    category: 'Tech & Dév',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 734,
    views: 1845,
    paidMinutes: 2450,
    likes: 312,
    creditCostPerMinute: 1,
    createdAt: '2025-02-10T14:20:00Z',
    isPublished: true,
  },
  {
    id: 'vid_2',
    creatorId: 'usr_creator_2',
    creatorName: 'Studio Documentaire 4K',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Expédition Sahara : L’Oasis Secrète du Tassili n’Ajjer',
    description: 'Une immersion sonore et visuelle à couper le souffle au cœur des canyons préhistoriques et des dunes dorées du Grand Sud.',
    category: 'Documentaire',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 653,
    views: 4120,
    paidMinutes: 5890,
    likes: 890,
    creditCostPerMinute: 1,
    createdAt: '2025-02-14T09:15:00Z',
    isPublished: true,
  },
  {
    id: 'vid_3',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Cybersécurité 2026 : Protéger ses APIs contre le credential stuffing et la fraude',
    description: 'Cas d’étude réels sur les vulnérabilités de monétisation, validation cryptographique des webhooks et détection des auto-vues de bots.',
    category: 'Cybersécurité',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 596,
    views: 1290,
    paidMinutes: 1820,
    likes: 244,
    creditCostPerMinute: 1,
    createdAt: '2025-02-18T18:00:00Z',
    isPublished: true,
  },
  {
    id: 'vid_4',
    creatorId: 'usr_creator_2',
    creatorName: 'Studio Documentaire 4K',
    creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Cinéma & Étalonnage Couleur : Sublimer la lumière en DaVinci Resolve',
    description: 'Guide pratique pas à pas pour donner un look cinématographique organique à vos vidéos de voyage et courts-métrages.',
    category: 'Cinéma & Art',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 900,
    views: 3100,
    paidMinutes: 4200,
    likes: 670,
    creditCostPerMinute: 1,
    createdAt: '2025-02-01T11:45:00Z',
    isPublished: true,
  },
  {
    id: 'vid_5',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Paiements Web3 & Cryptomonnaies : Guide d’implémentation Smart Contracts & Webhooks',
    description: 'Comment intégrer des paiements USDT multi-chaînes (TRC20, ERC20) sans faille de confirmation ni double dépense.',
    category: 'Finance & Crypto',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
    durationSeconds: 780,
    views: 2210,
    paidMinutes: 2980,
    likes: 415,
    creditCostPerMinute: 1,
    createdAt: '2025-01-28T16:10:00Z',
    isPublished: true,
  },
];

const INITIAL_PACKS: CreditPack[] = [
  {
    id: 'pack_discovery',
    name: 'Pack Découverte',
    tagline: 'Idéal pour découvrir les créateurs',
    credits: 50,
    priceFiat: 5.0,
    currency: 'USD',
    badge: 'Essai',
    active: true,
  },
  {
    id: 'pack_standard',
    name: 'Pack Standard',
    tagline: '3h20 de visionnage en immersion totale',
    credits: 200,
    priceFiat: 18.0,
    currency: 'USD',
    badge: 'Recommandé',
    popular: true,
    active: true,
  },
  {
    id: 'pack_premium',
    name: 'Pack Premium',
    tagline: 'Plus de 8h de contenu exclusif',
    credits: 500,
    priceFiat: 40.0,
    currency: 'USD',
    badge: 'Économique -20%',
    active: true,
  },
  {
    id: 'pack_pro',
    name: 'Pack Pro / Passionné',
    tagline: 'Pour les spectateurs assidus et curieux',
    credits: 1000,
    priceFiat: 75.0,
    currency: 'USD',
    badge: 'Max Avantage',
    active: true,
  },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'ledg_init_1',
    timestamp: '2025-02-15T09:30:00Z',
    type: 'CREDIT_PURCHASE',
    userId: 'usr_viewer_1',
    userName: 'Karim Mansour',
    creditDelta: 100,
    amountFiat: 10.0,
    currency: 'USD',
    description: 'Achat Pack 100 crédits via Crypto USDT',
  },
  {
    id: 'ledg_init_2',
    timestamp: '2025-02-16T14:15:00Z',
    type: 'MINUTE_DEBIT',
    userId: 'usr_viewer_1',
    userName: 'Karim Mansour',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    videoId: 'vid_1',
    videoTitle: 'Masterclass : Architecture Microservices',
    creditDelta: -1,
    amountFiat: 0.1,
    currency: 'USD',
    description: 'Visionnage facturé : 1 minute',
  },
  {
    id: 'ledg_init_3',
    timestamp: '2025-02-16T14:15:00Z',
    type: 'CREATOR_CREDIT',
    userId: 'usr_viewer_1',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    videoId: 'vid_1',
    videoTitle: 'Masterclass : Architecture Microservices',
    creditDelta: 0,
    amountFiat: 0.05,
    currency: 'USD',
    description: 'Part créateur 50% sur minute visionnée',
  },
  {
    id: 'ledg_init_4',
    timestamp: '2025-02-16T14:15:00Z',
    type: 'PLATFORM_CREDIT',
    userId: 'usr_viewer_1',
    videoId: 'vid_1',
    creditDelta: 0,
    amountFiat: 0.05,
    currency: 'USD',
    description: 'Part plateforme 50% sur minute visionnée',
  },
];

const INITIAL_ORDERS: PaymentOrder[] = [
  {
    id: 'ORD_CRYPTO_771',
    userId: 'usr_viewer_1',
    userName: 'Karim Mansour',
    packId: 'pack_standard',
    packName: 'Pack Standard (200 crédits)',
    credits: 200,
    amountFiat: 18.0,
    currency: 'USD',
    paymentMethod: 'CRYPTO',
    status: 'CONFIRMED',
    cryptoDetails: {
      cryptoCurrency: 'USDT',
      network: 'TRC20',
      depositAddress: 'TXy8fBq9Z2wKpLMNrT1oP7vJ4kLmNv87Qw',
      amountCrypto: '18.00 USDT',
      txHash: '0x8f2d59...3a81',
      expiresAt: '2025-02-18T10:30:00Z',
    },
    createdAt: '2025-02-18T10:15:00Z',
    confirmedAt: '2025-02-18T10:22:10Z',
  },
  {
    id: 'ORD_FLEXY_104',
    userId: 'usr_viewer_1',
    userName: 'Karim Mansour',
    packId: 'pack_discovery',
    packName: 'Pack Découverte (50 crédits)',
    credits: 50,
    amountFiat: 5.0,
    currency: 'USD',
    paymentMethod: 'FLEXY',
    status: 'PENDING',
    flexyDetails: {
      operator: 'Mobilis',
      senderPhoneNumber: '0665123456',
      flexyTargetNumber: '0661234567',
      transactionReference: 'MOB-TX-984210',
      receiptNote: 'Transfert de 750 DZD effectué à 14h10 via application Mobilis',
    },
    createdAt: '2025-02-20T14:12:00Z',
  },
];

const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: 'PAY_902',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    creatorEmail: 'createur@videocredit.io',
    amount: 100.0,
    amountDzd: 15000,
    currency: 'USD',
    method: 'FLEXY_MOBILIS',
    operator: 'Mobilis',
    phoneNumber: '0665123456',
    accountDetails: 'Flexy Mobilis vers 0665123456 (15 000 DZD)',
    status: 'PAID',
    txId: 'MOB-TX-889214',
    createdAt: '2025-02-05T12:00:00Z',
    processedAt: '2025-02-05T15:30:00Z',
  },
  {
    id: 'PAY_905',
    creatorId: 'usr_creator_2',
    creatorName: 'Studio Documentaire 4K',
    creatorEmail: 'sarah.cinema@videocredit.io',
    amount: 200.0,
    amountDzd: 30000,
    currency: 'USD',
    method: 'FLEXY_DJEZZY',
    operator: 'Djezzy',
    phoneNumber: '0770987654',
    accountDetails: 'Flexy Djezzy vers 0770987654 (30 000 DZD)',
    status: 'PAID',
    txId: 'DJZ-TX-99812',
    createdAt: '2025-02-10T11:00:00Z',
    processedAt: '2025-02-10T16:45:00Z',
  },
  {
    id: 'PAY_909',
    creatorId: 'usr_creator_1',
    creatorName: 'Amine DevLab • Tech & IA',
    creatorEmail: 'createur@videocredit.io',
    amount: 50.0,
    amountDzd: 7500,
    currency: 'USD',
    method: 'FLEXY_MOBILIS',
    operator: 'Mobilis',
    phoneNumber: '0665123456',
    accountDetails: 'Flexy Mobilis vers 0665123456 (7 500 DZD)',
    status: 'PENDING',
    createdAt: '2025-02-21T09:40:00Z',
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com_1',
    videoId: 'vid_1',
    userId: 'usr_viewer_1',
    userName: 'Karim Mansour',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Excellente masterclass ! Le système de crédit à la minute est super équitable pour ce niveau d’expertise.',
    createdAt: '2025-02-16T15:00:00Z',
    likes: 12,
  },
  {
    id: 'com_2',
    videoId: 'vid_2',
    userId: 'usr_creator_1',
    userName: 'Amine DevLab',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content: 'Les plans aériens et le sound design sont époustouflants Sarah ! Un vrai travail de pro.',
    createdAt: '2025-02-17T11:30:00Z',
    likes: 8,
  },
];

const INITIAL_LOGS: AuditSecurityLog[] = [
  {
    id: 'log_1',
    timestamp: '2025-02-21T08:00:00Z',
    action: 'SYSTEM_BOOT',
    severity: 'INFO',
    details: 'Moteur VideoCredit initialisé avec validation cryptographique de sessions.',
  },
  {
    id: 'log_2',
    timestamp: '2025-02-21T09:12:00Z',
    action: 'HEARTBEAT_VERIFY',
    severity: 'INFO',
    userId: 'usr_viewer_1',
    details: 'Session heartbeat vérifiée avec intégrité de temps de lecture (drift < 1.2s).',
  },
];

class DatabaseStore {
  private data: DatabaseSchema;
  private activeSessions: Map<string, WatchSession> = new Map();

  constructor() {
    this.ensureDir();
    this.data = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data dir', err);
      }
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);

        // Ensure operational admin contact, Flexy numbers, and EVM address are up to date
        parsed.settings.flexyTargetMobilis = '0666496676';
        parsed.settings.flexyTargetDjezzy = '0784145118';
        parsed.settings.flexyTargetOoredoo = '0558953440';
        parsed.settings.cryptoEthAddress = '0xCD150992C7db67571fe90211509B659826544Bf6';
        parsed.settings.cryptoEvmAddress = '0xCD150992C7db67571fe90211509B659826544Bf6';
        parsed.settings.adminEmail = 'lamechemounir@gmail.com';

        // Update admin user
        const adminUser = parsed.users.find((u) => u.role === 'admin' || u.id === 'usr_admin_1');
        if (adminUser) {
          adminUser.email = 'lamechemounir@gmail.com';
          adminUser.name = 'Mounir Lamèche (Admin)';
        }

        this.persist(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing db.json, initializing default data', e);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      videos: INITIAL_VIDEOS,
      comments: INITIAL_COMMENTS,
      ledger: INITIAL_LEDGER,
      creditPacks: INITIAL_PACKS,
      orders: INITIAL_ORDERS,
      payoutRequests: INITIAL_PAYOUTS,
      settings: DEFAULT_SETTINGS,
      auditLogs: INITIAL_LOGS,
    };
    this.persist(defaultData);
    return defaultData;
  }

  private persist(data: DatabaseSchema) {
    try {
      this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  private save() {
    this.persist(this.data);
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // --- Videos ---
  public getVideos(category?: string, query?: string): Video[] {
    let list = this.data.videos.filter((v) => v.isPublished);
    if (category && category !== 'Tous') {
      list = list.filter((v) => v.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.creatorName.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getAllVideosAdmin(): Video[] {
    return this.data.videos;
  }

  public getVideoById(id: string): Video | undefined {
    return this.data.videos.find((v) => v.id === id);
  }

  public createVideo(video: Video): Video {
    this.data.videos.unshift(video);
    this.save();
    return video;
  }

  public updateVideo(id: string, updates: Partial<Video>): Video | null {
    const video = this.data.videos.find((v) => v.id === id);
    if (!video) return null;
    Object.assign(video, updates);
    this.save();
    return video;
  }

  public deleteVideo(id: string): boolean {
    const index = this.data.videos.findIndex((v) => v.id === id);
    if (index === -1) return false;
    this.data.videos.splice(index, 1);
    this.save();
    return true;
  }

  public toggleLikeVideo(videoId: string): { likes: number } {
    const video = this.data.videos.find((v) => v.id === videoId);
    if (video) {
      video.likes += 1;
      this.save();
      return { likes: video.likes };
    }
    return { likes: 0 };
  }

  public reportVideo(videoId: string, reason: string, reporterId: string) {
    const video = this.data.videos.find((v) => v.id === videoId);
    if (video) {
      video.isFlagged = true;
      video.flagReason = reason;
      this.data.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'VIDEO_REPORTED',
        severity: 'ALERT',
        userId: reporterId,
        details: `Vidéo "${video.title}" (${video.id}) signalée. Raison : ${reason}`,
      });
      this.save();
    }
  }

  // --- Comments ---
  public getComments(videoId: string): Comment[] {
    return this.data.comments
      .filter((c) => c.videoId === videoId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addComment(comment: Comment): Comment {
    this.data.comments.unshift(comment);
    this.save();
    return comment;
  }

  // --- Credit Packs ---
  public getCreditPacks(): CreditPack[] {
    return this.data.creditPacks;
  }

  public updateCreditPack(packId: string, updates: Partial<CreditPack>): CreditPack | null {
    const pack = this.data.creditPacks.find((p) => p.id === packId);
    if (!pack) return null;
    Object.assign(pack, updates);
    this.save();
    return pack;
  }

  // --- Settings ---
  public getSettings(): PlatformSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    Object.assign(this.data.settings, updates);
    this.save();
    return this.data.settings;
  }

  // --- Financial Ledger ---
  public getLedger(userId?: string): LedgerEntry[] {
    if (userId) {
      return this.data.ledger
        .filter((l) => l.userId === userId || l.creatorId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [...this.data.ledger].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // --- WATCH HEARTBEAT & REAL-TIME REVENUE SPLIT ENGINE (50/50) ---

  public startWatchSession(userId: string, videoId: string): { sessionId: string; token: string } {
    const video = this.getVideoById(videoId);
    if (!video) throw new Error('Vidéo introuvable');

    const sessionId = 'ses_' + crypto.randomUUID();
    const token = crypto.randomBytes(16).toString('hex');
    const now = Date.now();

    const session: WatchSession = {
      sessionId,
      userId,
      videoId,
      creatorId: video.creatorId,
      startedAt: now,
      lastHeartbeatAt: now,
      currentPlaybackTime: 0,
      accumulatedWatchedSeconds: 0,
      billedMinutes: 0,
      token,
      active: true,
    };

    this.activeSessions.set(sessionId, session);

    // Increment video views
    video.views += 1;
    this.save();

    return { sessionId, token };
  }

  public processHeartbeat(userId: string, req: HeartbeatRequest): HeartbeatResponse {
    const session = this.activeSessions.get(req.sessionId);
    if (!session || !session.active) {
      return {
        success: false,
        sessionId: req.sessionId,
        remainingCredits: 0,
        accumulatedSecondsInCurrentMinute: 0,
        totalBilledMinutesThisSession: 0,
        justBilled: false,
        stopPlayback: true,
        stopReason: 'session_expired',
      };
    }

    if (session.userId !== userId || session.token !== req.token) {
      return {
        success: false,
        sessionId: req.sessionId,
        remainingCredits: 0,
        accumulatedSecondsInCurrentMinute: 0,
        totalBilledMinutesThisSession: 0,
        justBilled: false,
        stopPlayback: true,
        stopReason: 'token_mismatch',
      };
    }

    const user = this.getUserById(userId);
    if (!user) {
      return {
        success: false,
        sessionId: req.sessionId,
        remainingCredits: 0,
        accumulatedSecondsInCurrentMinute: 0,
        totalBilledMinutesThisSession: 0,
        justBilled: false,
        stopPlayback: true,
        stopReason: 'user_not_found',
      };
    }

    const video = this.getVideoById(session.videoId);
    if (!video) {
      return {
        success: false,
        sessionId: req.sessionId,
        remainingCredits: user.credits,
        accumulatedSecondsInCurrentMinute: 0,
        totalBilledMinutesThisSession: 0,
        justBilled: false,
        stopPlayback: true,
        stopReason: 'video_not_found',
      };
    }

    const now = Date.now();
    const realTimeDeltaSec = Math.max(0, (now - session.lastHeartbeatAt) / 1000);
    const playbackRate = req.playbackRate || 1.0;

    // Security check: playback drift detection.
    // Client should send heartbeat every ~10s. If realTimeDeltaSec is e.g. 10s, playback delta should be at most 10s * playbackRate + 4s jitter.
    const maxAllowedPlaybackSec = realTimeDeltaSec * playbackRate + 5.0;
    const playbackTimeDelta = Math.max(0, req.currentTime - session.currentPlaybackTime);

    let validElapsedSec = Math.min(playbackTimeDelta, maxAllowedPlaybackSec);
    if (playbackTimeDelta > maxAllowedPlaybackSec * 3 && realTimeDeltaSec < 30) {
      // Possible seek forward or spoofing: only credit actual playback within reasonable bounds
      this.data.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'POTENTIAL_DRIFT_OR_SEEK',
        severity: 'INFO',
        userId,
        details: `Saut détecté sur vidéo ${video.id} (delta playback: ${playbackTimeDelta.toFixed(1)}s, réel: ${realTimeDeltaSec.toFixed(1)}s)`,
      });
      validElapsedSec = Math.min(validElapsedSec, 15);
    }

    session.lastHeartbeatAt = now;
    session.currentPlaybackTime = req.currentTime;
    session.accumulatedWatchedSeconds += validElapsedSec;

    // Check anti-self-viewing: If creator is watching their own video, don't debit or credit.
    const isSelfWatch = user.id === video.creatorId;

    let justBilled = false;
    let stopPlayback = false;
    let stopReason: string | undefined = undefined;

    // Calculate how many full minutes have been accumulated
    const minutesCompleted = Math.floor(session.accumulatedWatchedSeconds / 60);

    if (minutesCompleted > session.billedMinutes) {
      const minutesToBill = minutesCompleted - session.billedMinutes;

      for (let i = 0; i < minutesToBill; i++) {
        if (isSelfWatch) {
          // Free creator preview
          session.billedMinutes += 1;
        } else {
          // User pays 1 credit
          if (user.credits < 1) {
            stopPlayback = true;
            stopReason = 'insufficient_credits';
            break;
          }

          // ATOMIC DEBIT & 50/50 REVENUE CALCULATION
          user.credits -= 1;
          session.billedMinutes += 1;
          video.paidMinutes += 1;
          justBilled = true;

          const creditValue = this.data.settings.creditFiatValue; // e.g. $0.10
          const creatorShareRate = this.data.settings.creatorSharePercentage / 100; // 0.50
          const platformShareRate = this.data.settings.platformSharePercentage / 100; // 0.50

          const creatorAmount = Number((creditValue * creatorShareRate).toFixed(4));
          const platformAmount = Number((creditValue * platformShareRate).toFixed(4));

          // Credit creator
          const creator = this.getUserById(video.creatorId);
          if (creator) {
            creator.creatorEarnings.totalEarned = Number(
              (creator.creatorEarnings.totalEarned + creatorAmount).toFixed(4)
            );
            creator.creatorEarnings.available = Number(
              (creator.creatorEarnings.available + creatorAmount).toFixed(4)
            );
          }

          // Record immutable ledger entries
          const nowIso = new Date().toISOString();
          const minuteIndex = session.billedMinutes;

          // 1. Viewer debit
          this.data.ledger.unshift({
            id: 'ledg_' + crypto.randomUUID(),
            timestamp: nowIso,
            type: 'MINUTE_DEBIT',
            userId: user.id,
            userName: user.name,
            creatorId: video.creatorId,
            creatorName: video.creatorName,
            videoId: video.id,
            videoTitle: video.title,
            creditDelta: -1,
            amountFiat: creditValue,
            currency: this.data.settings.currency,
            description: `Minute #${minuteIndex} de visionnage facturée (1 crédit)`,
            idempotencyKey: `${session.sessionId}_min_${minuteIndex}`,
          });

          // 2. Creator revenue credit (50%)
          this.data.ledger.unshift({
            id: 'ledg_' + crypto.randomUUID(),
            timestamp: nowIso,
            type: 'CREATOR_CREDIT',
            userId: user.id,
            creatorId: video.creatorId,
            creatorName: video.creatorName,
            videoId: video.id,
            videoTitle: video.title,
            creditDelta: 0,
            amountFiat: creatorAmount,
            currency: this.data.settings.currency,
            description: `Part créateur (50%) - Minute #${minuteIndex}`,
            idempotencyKey: `${session.sessionId}_creator_min_${minuteIndex}`,
          });

          // 3. Platform revenue credit (50%)
          this.data.ledger.unshift({
            id: 'ledg_' + crypto.randomUUID(),
            timestamp: nowIso,
            type: 'PLATFORM_CREDIT',
            userId: user.id,
            videoId: video.id,
            videoTitle: video.title,
            creditDelta: 0,
            amountFiat: platformAmount,
            currency: this.data.settings.currency,
            description: `Part plateforme (50%) - Minute #${minuteIndex}`,
            idempotencyKey: `${session.sessionId}_platform_min_${minuteIndex}`,
          });
        }
      }

      this.save();
    }

    if (user.credits <= 0 && !isSelfWatch) {
      stopPlayback = true;
      stopReason = 'insufficient_credits';
    }

    const accumulatedSecondsInCurrentMinute = Math.floor(session.accumulatedWatchedSeconds % 60);

    let warning: string | undefined = undefined;
    if (user.credits <= 3 && !stopPlayback && !isSelfWatch) {
      warning = `Attention : solde faible (${user.credits} crédit${user.credits > 1 ? 's' : ''} restant${user.credits > 1 ? 's' : ''}). Recharger votre portefeuille pour ne pas interrompre la lecture.`;
    }

    return {
      success: true,
      sessionId: session.sessionId,
      remainingCredits: user.credits,
      accumulatedSecondsInCurrentMinute,
      totalBilledMinutesThisSession: session.billedMinutes,
      justBilled,
      stopPlayback,
      stopReason,
      warning,
    };
  }

  public endWatchSession(sessionId: string): { billedMinutes: number } {
    const session = this.activeSessions.get(sessionId);
    if (!session) return { billedMinutes: 0 };
    session.active = false;
    this.activeSessions.delete(sessionId);
    return { billedMinutes: session.billedMinutes };
  }

  // --- ORDERS & PAYMENTS (CRYPTO & FLEXY) ---

  public getOrders(userId?: string): PaymentOrder[] {
    if (userId) {
      return this.data.orders
        .filter((o) => o.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createCryptoOrder(
    userId: string,
    packId: string,
    cryptoCurrency: 'USDT' | 'BTC' | 'ETH',
    network: 'TRC20' | 'ERC20' | 'Bitcoin' | 'EVM'
  ): PaymentOrder {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    const pack = this.data.creditPacks.find((p) => p.id === packId);
    if (!pack) throw new Error('Pack non trouvé');

    const orderId = 'ORD_CRYPTO_' + Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let depositAddress = this.data.settings.cryptoEvmAddress || this.data.settings.cryptoEthAddress || '0xCD150992C7db67571fe90211509B659826544Bf6';
    let amountCrypto = `${pack.priceFiat.toFixed(2)} USDT`;

    if (cryptoCurrency === 'BTC') {
      depositAddress = this.data.settings.cryptoBtcAddress;
      // Mock rate ~95,000 USD/BTC for realistic display
      const btcAmount = (pack.priceFiat / 95000).toFixed(6);
      amountCrypto = `${btcAmount} BTC`;
    } else if (cryptoCurrency === 'ETH' || network === 'ERC20' || network === 'EVM') {
      depositAddress = this.data.settings.cryptoEvmAddress || this.data.settings.cryptoEthAddress || '0xCD150992C7db67571fe90211509B659826544Bf6';
      if (cryptoCurrency === 'ETH') {
        const ethAmount = (pack.priceFiat / 2800).toFixed(5);
        amountCrypto = `${ethAmount} ETH`;
      }
    }

    const order: PaymentOrder = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      packId: pack.id,
      packName: `${pack.name} (${pack.credits} crédits)`,
      credits: pack.credits,
      amountFiat: pack.priceFiat,
      currency: pack.currency,
      paymentMethod: 'CRYPTO',
      status: 'PENDING',
      cryptoDetails: {
        cryptoCurrency,
        network,
        depositAddress,
        amountCrypto,
        expiresAt,
      },
      createdAt: new Date().toISOString(),
    };

    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public createFlexyOrder(
    userId: string,
    packId: string,
    operator: 'Mobilis' | 'Djezzy' | 'Ooredoo',
    senderPhoneNumber: string,
    transactionReference: string,
    receiptNote?: string
  ): PaymentOrder {
    const user = this.getUserById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    const pack = this.data.creditPacks.find((p) => p.id === packId);
    if (!pack) throw new Error('Pack non trouvé');

    const orderId = 'ORD_FLEXY_' + Math.floor(100000 + Math.random() * 900000);

    let flexyTarget = this.data.settings.flexyTargetMobilis;
    if (operator === 'Djezzy') flexyTarget = this.data.settings.flexyTargetDjezzy;
    if (operator === 'Ooredoo') flexyTarget = this.data.settings.flexyTargetOoredoo;

    const order: PaymentOrder = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      packId: pack.id,
      packName: `${pack.name} (${pack.credits} crédits)`,
      credits: pack.credits,
      amountFiat: pack.priceFiat,
      currency: pack.currency,
      paymentMethod: 'FLEXY',
      status: 'PENDING',
      flexyDetails: {
        operator,
        senderPhoneNumber,
        flexyTargetNumber: flexyTarget,
        transactionReference,
        receiptNote,
      },
      createdAt: new Date().toISOString(),
    };

    this.data.orders.unshift(order);

    this.data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'FLEXY_ORDER_SUBMITTED',
      severity: 'INFO',
      userId: user.id,
      details: `Commande Flexy ${order.id} soumise (${pack.credits} crédits, opérateur ${operator}, tél ${senderPhoneNumber}). En attente de validation admin.`,
    });

    this.save();
    return order;
  }

  public confirmOrder(orderId: string, txHash?: string, adminNote?: string): PaymentOrder {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Commande non trouvée');
    if (order.status === 'CONFIRMED') return order;

    const user = this.getUserById(order.userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    order.status = 'CONFIRMED';
    order.confirmedAt = new Date().toISOString();

    if (order.cryptoDetails && txHash) {
      order.cryptoDetails.txHash = txHash;
    }
    if (order.flexyDetails && adminNote) {
      order.flexyDetails.adminReviewNote = adminNote;
      order.flexyDetails.reviewedAt = new Date().toISOString();
    }

    // Allocate credits
    user.credits += order.credits;

    // Double-entry record
    this.data.ledger.unshift({
      id: 'ledg_' + crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'CREDIT_PURCHASE',
      userId: user.id,
      userName: user.name,
      creditDelta: order.credits,
      amountFiat: order.amountFiat,
      currency: order.currency,
      description: `Achat confirmé : ${order.packName} via ${order.paymentMethod}`,
      idempotencyKey: `order_confirm_${order.id}`,
      metadata: { orderId: order.id, method: order.paymentMethod },
    });

    this.data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'PAYMENT_CONFIRMED',
      severity: 'INFO',
      userId: user.id,
      details: `Paiement ${order.id} validé (${order.credits} crédits attribués à ${user.name}).`,
    });

    this.save();
    return order;
  }

  public rejectOrder(orderId: string, reason: string): PaymentOrder {
    const order = this.data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Commande introuvable');
    order.status = 'REJECTED';
    if (order.flexyDetails) {
      order.flexyDetails.adminReviewNote = reason;
      order.flexyDetails.reviewedAt = new Date().toISOString();
    }

    this.data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'ORDER_REJECTED',
      severity: 'WARNING',
      userId: order.userId,
      details: `Commande ${order.id} rejetée. Motif : ${reason}`,
    });

    this.save();
    return order;
  }

  // --- CREATOR PAYOUTS & WITHDRAWALS ---

  public getPayoutRequests(creatorId?: string): PayoutRequest[] {
    if (creatorId) {
      return this.data.payoutRequests
        .filter((p) => p.creatorId === creatorId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [...this.data.payoutRequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createPayoutRequest(
    creatorId: string,
    amount: number,
    method: PayoutMethod = 'FLEXY',
    accountDetails: string,
    operator: 'Mobilis' | 'Djezzy' | 'Ooredoo' = 'Mobilis',
    phoneNumber?: string
  ): PayoutRequest {
    const creator = this.getUserById(creatorId);
    if (!creator) throw new Error('Créateur non trouvé');

    const min = this.data.settings.minWithdrawalThreshold || 5.0;
    if (amount < min) {
      throw new Error(`Le montant minimum de retrait Flexy est de ${min} ${this.data.settings.currency}`);
    }

    if (amount > creator.creatorEarnings.available) {
      throw new Error('Fonds disponibles insuffisants pour ce retrait.');
    }

    // Hold funds in pending
    creator.creatorEarnings.available = Number(
      (creator.creatorEarnings.available - amount).toFixed(2)
    );
    creator.creatorEarnings.pending = Number(
      (creator.creatorEarnings.pending + amount).toFixed(2)
    );

    const amountDzd = Math.round(amount * 150);
    const finalPhone = phoneNumber || accountDetails;
    const finalDetails = `Flexy ${operator} vers ${finalPhone} (~${amountDzd} DZD)`;

    const payout: PayoutRequest = {
      id: 'PAY_' + Math.floor(1000 + Math.random() * 9000),
      creatorId: creator.id,
      creatorName: creator.name,
      creatorEmail: creator.email,
      amount,
      amountDzd,
      currency: this.data.settings.currency,
      method: `FLEXY_${operator.toUpperCase()}` as PayoutMethod,
      operator,
      phoneNumber: finalPhone,
      accountDetails: finalDetails,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.data.payoutRequests.unshift(payout);

    this.data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action: 'PAYOUT_REQUESTED_FLEXY',
      severity: 'INFO',
      userId: creator.id,
      details: `Demande de retrait Flexy ${payout.id} soumise : ${amount} USD (~${amountDzd} DZD) vers ${finalPhone} (${operator}).`,
    });

    this.save();
    return payout;
  }

  public processPayout(
    payoutId: string,
    action: 'APPROVE' | 'REJECT',
    txId?: string,
    rejectionReason?: string
  ): PayoutRequest {
    const payout = this.data.payoutRequests.find((p) => p.id === payoutId);
    if (!payout) throw new Error('Demande de retrait introuvable');
    if (payout.status !== 'PENDING') throw new Error('Demande déjà traitée');

    const creator = this.getUserById(payout.creatorId);
    if (!creator) throw new Error('Créateur introuvable');

    if (action === 'APPROVE') {
      payout.status = 'PAID';
      payout.processedAt = new Date().toISOString();
      payout.txId = txId || 'TX_' + crypto.randomBytes(8).toString('hex');

      creator.creatorEarnings.pending = Number(
        Math.max(0, creator.creatorEarnings.pending - payout.amount).toFixed(2)
      );
      creator.creatorEarnings.totalWithdrawn = Number(
        (creator.creatorEarnings.totalWithdrawn + payout.amount).toFixed(2)
      );

      // Ledger entry for withdrawal
      this.data.ledger.unshift({
        id: 'ledg_' + crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: 'PAYOUT_WITHDRAWAL',
        userId: creator.id,
        creatorId: creator.id,
        creatorName: creator.name,
        creditDelta: 0,
        amountFiat: payout.amount,
        currency: payout.currency,
        description: `Paiement retrait créateur approuvé (${payout.method} - TX: ${payout.txId})`,
      });

      this.data.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'PAYOUT_PAID',
        severity: 'INFO',
        userId: creator.id,
        details: `Retrait ${payout.id} payé : ${payout.amount} ${payout.currency}. TX: ${payout.txId}`,
      });
    } else {
      payout.status = 'REJECTED';
      payout.processedAt = new Date().toISOString();
      payout.rejectionReason = rejectionReason || 'Information bancaire invalide';

      // Refund pending balance back to available
      creator.creatorEarnings.pending = Number(
        Math.max(0, creator.creatorEarnings.pending - payout.amount).toFixed(2)
      );
      creator.creatorEarnings.available = Number(
        (creator.creatorEarnings.available + payout.amount).toFixed(2)
      );

      this.data.auditLogs.unshift({
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'PAYOUT_REJECTED',
        severity: 'WARNING',
        userId: creator.id,
        details: `Retrait ${payout.id} rejeté. Motif : ${payout.rejectionReason}. Montant restitué au solde disponible.`,
      });
    }

    this.save();
    return payout;
  }

  // --- ADMIN FINANCIAL AGGREGATIONS (50/50 REVENUE REPORT) ---

  public getFinancialReport() {
    let totalCreditsSold = 0;
    let totalGrossRevenueFiat = 0;
    let totalMinutesWatched = 0;
    let totalPlatformRevenue = 0;
    let totalCreatorRevenueEarned = 0;

    for (const order of this.data.orders) {
      if (order.status === 'CONFIRMED') {
        totalCreditsSold += order.credits;
        totalGrossRevenueFiat += order.amountFiat;
      }
    }

    for (const item of this.data.ledger) {
      if (item.type === 'MINUTE_DEBIT') {
        totalMinutesWatched += 1;
      } else if (item.type === 'PLATFORM_CREDIT') {
        totalPlatformRevenue += item.amountFiat;
      } else if (item.type === 'CREATOR_CREDIT') {
        totalCreatorRevenueEarned += item.amountFiat;
      }
    }

    // Unconsumed user credits liability
    let totalActiveUserCredits = 0;
    for (const u of this.data.users) {
      if (u.role !== 'admin') {
        totalActiveUserCredits += u.credits;
      }
    }

    const unearnedCreditLiabilityFiat = Number(
      (totalActiveUserCredits * this.data.settings.creditFiatValue).toFixed(2)
    );

    return {
      totalCreditsSold,
      totalGrossRevenueFiat: Number(totalGrossRevenueFiat.toFixed(2)),
      totalMinutesWatched,
      totalPlatformRevenue: Number(totalPlatformRevenue.toFixed(2)),
      totalCreatorRevenueEarned: Number(totalCreatorRevenueEarned.toFixed(2)),
      totalActiveUserCredits,
      unearnedCreditLiabilityFiat,
      splitRatio: {
        creator: this.data.settings.creatorSharePercentage,
        platform: this.data.settings.platformSharePercentage,
      },
      currency: this.data.settings.currency,
      creditFiatValue: this.data.settings.creditFiatValue,
    };
  }

  public getAuditLogs(): AuditSecurityLog[] {
    return this.data.auditLogs.slice(0, 50);
  }
}

export const db = new DatabaseStore();
