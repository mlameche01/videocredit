import { Router, Request, Response } from 'express';
import { db } from './db.ts';
import crypto from 'crypto';
import { User } from '../src/types/index.ts';

export const apiRouter = Router();

// In-memory current active session user for seamless demonstration
let currentUserId = 'usr_viewer_1';

const getCurrentUser = (req: Request): User => {
  const customId = req.headers['x-user-id'] as string;
  const user = db.getUserById(customId || currentUserId);
  if (!user) {
    const fallback = db.getUserById('usr_viewer_1')!;
    return fallback;
  }
  return user;
};

// --- AUTH & PERSONA SWITCHING ---

apiRouter.get('/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  res.json({ user });
});

apiRouter.post('/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  currentUserId = user.id;
  res.json({ success: true, user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email obligatoire' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'Aucun compte associé à cet email' });
  }
  currentUserId = user.id;
  res.json({ success: true, user });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, role, channelName, channelDescription } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nom et email requis' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
  }

  const newUser: User = {
    id: 'usr_' + crypto.randomUUID().slice(0, 8),
    email,
    name,
    role: role === 'creator' ? 'creator' : 'viewer',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    credits: 30, // 30 free introductory credits for new users
    channelName: role === 'creator' ? (channelName || `${name} Channel`) : undefined,
    channelDescription: role === 'creator' ? channelDescription : undefined,
    creatorEarnings: { totalEarned: 0, available: 0, pending: 0, totalWithdrawn: 0 },
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.createUser(newUser);
  currentUserId = newUser.id;
  res.json({ success: true, user: newUser });
});

apiRouter.put('/users/profile', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { name, channelName, channelDescription, avatar, channelBanner } = req.body;
  const updated = db.updateUser(user.id, {
    name: name || user.name,
    channelName: channelName !== undefined ? channelName : user.channelName,
    channelDescription: channelDescription !== undefined ? channelDescription : user.channelDescription,
    avatar: avatar || user.avatar,
    channelBanner: channelBanner || user.channelBanner,
  });
  res.json({ user: updated });
});

// --- VIDEOS ---

apiRouter.get('/videos', (req: Request, res: Response) => {
  const { category, q } = req.query;
  const videos = db.getVideos(category as string, q as string);
  res.json({ videos });
});

apiRouter.get('/videos/:id', (req: Request, res: Response) => {
  const video = db.getVideoById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Vidéo introuvable' });
  }
  const comments = db.getComments(video.id);
  const creator = db.getUserById(video.creatorId);
  res.json({ video, comments, creator });
});

apiRouter.post('/videos', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'creator' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Seuls les créateurs peuvent publier des vidéos.' });
  }

  const { title, description, category, videoUrl, thumbnailUrl, durationSeconds } = req.body;
  if (!title || !description || !videoUrl) {
    return res.status(400).json({ error: 'Titre, description et URL de vidéo requis.' });
  }

  const newVideo = db.createVideo({
    id: 'vid_' + crypto.randomUUID().slice(0, 8),
    creatorId: user.id,
    creatorName: user.channelName || user.name,
    creatorAvatar: user.avatar,
    title,
    description,
    category: category || 'Général',
    videoUrl,
    thumbnailUrl:
      thumbnailUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    durationSeconds: Number(durationSeconds) || 600,
    views: 0,
    paidMinutes: 0,
    likes: 0,
    creditCostPerMinute: 1,
    createdAt: new Date().toISOString(),
    isPublished: true,
  });

  res.json({ success: true, video: newVideo });
});

apiRouter.put('/videos/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const video = db.getVideoById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo introuvable' });
  if (video.creatorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  const updated = db.updateVideo(req.params.id, req.body);
  res.json({ video: updated });
});

apiRouter.delete('/videos/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const video = db.getVideoById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Vidéo introuvable' });
  if (video.creatorId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Non autorisé' });
  }

  const deleted = db.deleteVideo(req.params.id);
  res.json({ success: deleted });
});

apiRouter.post('/videos/:id/like', (req: Request, res: Response) => {
  const result = db.toggleLikeVideo(req.params.id);
  res.json(result);
});

apiRouter.post('/videos/:id/comments', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Contenu du commentaire requis' });
  }

  const comment = db.addComment({
    id: 'com_' + crypto.randomUUID().slice(0, 8),
    videoId: req.params.id,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
  });

  res.json({ comment });
});

apiRouter.post('/videos/:id/report', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Motif du signalement requis' });

  db.reportVideo(req.params.id, reason, user.id);
  res.json({ success: true, message: 'Signalement transmis à l’équipe de modération.' });
});

// --- WATCH HEARTBEAT BILLING ENGINE (1 CREDIT = 1 MINUTE) ---

apiRouter.post('/watch/start', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'videoId requis' });

  try {
    const session = db.startWatchSession(user.id, videoId);
    res.json({
      success: true,
      sessionId: session.sessionId,
      token: session.token,
      currentCredits: user.credits,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/watch/heartbeat', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { sessionId, videoId, currentTime, playbackRate, token } = req.body;

  if (!sessionId || !token) {
    return res.status(400).json({ error: 'Paramètres heartbeat manquants' });
  }

  const result = db.processHeartbeat(user.id, {
    sessionId,
    videoId,
    currentTime: Number(currentTime) || 0,
    playbackRate: Number(playbackRate) || 1,
    token,
  });

  res.json(result);
});

apiRouter.post('/watch/end', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId requis' });

  const result = db.endWatchSession(sessionId);
  res.json({ success: true, ...result });
});

// --- PACKS & PURCHASES (CRYPTO & FLEXY) ---

apiRouter.get('/packs', (req: Request, res: Response) => {
  const packs = db.getCreditPacks().filter((p) => p.active);
  res.json({ packs, settings: db.getSettings() });
});

apiRouter.post('/orders/crypto', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { packId, cryptoCurrency, network } = req.body;
  if (!packId) return res.status(400).json({ error: 'packId requis' });

  try {
    const order = db.createCryptoOrder(
      user.id,
      packId,
      cryptoCurrency || 'USDT',
      network || 'TRC20'
    );
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/orders/flexy', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { packId, operator, senderPhoneNumber, transactionReference, receiptNote } = req.body;

  if (!packId || !operator || !senderPhoneNumber || !transactionReference) {
    return res.status(400).json({
      error: 'Pack, opérateur, numéro de téléphone et référence de transfert sont obligatoires.',
    });
  }

  try {
    const order = db.createFlexyOrder(
      user.id,
      packId,
      operator,
      senderPhoneNumber,
      transactionReference,
      receiptNote
    );
    res.json({
      success: true,
      order,
      message:
        'Votre paiement Flexy a été soumis avec succès. Les crédits seront crédités dès validation par notre service comptabilité.',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Instant simulation endpoint for Crypto sandbox testing
apiRouter.post('/orders/:id/simulate-crypto-confirm', (req: Request, res: Response) => {
  try {
    const mockTxHash = '0x' + crypto.randomBytes(32).toString('hex');
    const confirmed = db.confirmOrder(req.params.id, mockTxHash);
    res.json({ success: true, order: confirmed, txHash: mockTxHash });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Real webhook endpoint structure for Crypto Gateway (NowPayments, CoinGate, BTCPay, etc.)
apiRouter.post('/webhooks/crypto', (req: Request, res: Response) => {
  const signature = req.headers['x-webhook-signature'] || req.headers['hmac'];
  const { orderId, status, txHash } = req.body;

  // In production: verify HMAC with secret key:
  // const calculated = crypto.createHmac('sha256', SECRET).update(JSON.stringify(req.body)).digest('hex');
  // if (signature !== calculated) return res.status(401).send('Invalid signature');

  if (orderId && (status === 'confirmed' || status === 'finished')) {
    try {
      db.confirmOrder(orderId, txHash);
      return res.status(200).json({ received: true });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  res.status(200).json({ status: 'ignored' });
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const orders = user.role === 'admin' ? db.getOrders() : db.getOrders(user.id);
  res.json({ orders });
});

// --- LEDGER & TRANSACTIONS ---

apiRouter.get('/ledger', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const ledger = user.role === 'admin' ? db.getLedger() : db.getLedger(user.id);
  res.json({ ledger });
});

// --- CREATOR STUDIO & PAYOUTS ---

apiRouter.get('/creator/analytics', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const creatorVideos = db.getAllVideosAdmin().filter((v) => v.creatorId === user.id);
  const payouts = db.getPayoutRequests(user.id);
  const ledger = db.getLedger(user.id).filter((l) => l.creatorId === user.id);

  const totalViews = creatorVideos.reduce((acc, v) => acc + v.views, 0);
  const totalPaidMinutes = creatorVideos.reduce((acc, v) => acc + v.paidMinutes, 0);

  res.json({
    earnings: user.creatorEarnings,
    totalViews,
    totalPaidMinutes,
    videos: creatorVideos,
    payouts,
    ledger: ledger.slice(0, 20),
    minWithdrawalThreshold: db.getSettings().minWithdrawalThreshold,
  });
});

apiRouter.get('/creator/payouts', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const payouts = db.getPayoutRequests(user.id);
  res.json({ payouts });
});

apiRouter.post('/creator/payouts', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const { amount, method, operator, phoneNumber, accountDetails } = req.body;

  if (!amount || (!phoneNumber && !accountDetails)) {
    return res.status(400).json({ error: 'Montant et numéro de téléphone Flexy requis.' });
  }

  const chosenOperator = operator || 'Mobilis';
  const targetPhone = phoneNumber || accountDetails;
  const details = accountDetails || `Flexy ${chosenOperator} vers ${targetPhone}`;

  try {
    const payout = db.createPayoutRequest(
      user.id,
      Number(amount),
      method || 'FLEXY',
      details,
      chosenOperator,
      targetPhone
    );
    res.json({ success: true, payout });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN DASHBOARD & CONTROLS ---

apiRouter.get('/admin/financial-report', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  const report = db.getFinancialReport();
  res.json({ report });
});

apiRouter.get('/admin/users', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  res.json({ users: db.getUsers() });
});

apiRouter.post('/admin/users/:id/toggle-status', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  const target = db.getUserById(req.params.id);
  if (!target) return res.status(404).json({ error: 'Utilisateur introuvable' });

  const newStatus = target.status === 'active' ? 'suspended' : 'active';
  const updated = db.updateUser(target.id, { status: newStatus });
  res.json({ user: updated });
});

apiRouter.get('/admin/videos', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  res.json({ videos: db.getAllVideosAdmin() });
});

apiRouter.post('/admin/orders/:id/confirm', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  const { adminNote, txHash } = req.body;
  try {
    const confirmed = db.confirmOrder(req.params.id, txHash, adminNote || 'Validé manuellement par admin');
    res.json({ success: true, order: confirmed });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/orders/:id/reject', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  const { reason } = req.body;
  try {
    const rejected = db.rejectOrder(req.params.id, reason || 'Rejeté par administrateur');
    res.json({ success: true, order: rejected });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/payouts', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  res.json({ payouts: db.getPayoutRequests() });
});

apiRouter.post('/admin/payouts/:id/process', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  const { action, txId, reason } = req.body;
  try {
    const processed = db.processPayout(req.params.id, action, txId, reason);
    res.json({ success: true, payout: processed });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/settings', (req: Request, res: Response) => {
  res.json({ settings: db.getSettings() });
});

apiRouter.put('/admin/settings', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  const updated = db.updateSettings(req.body);
  res.json({ settings: updated });
});

apiRouter.put('/admin/packs/:id', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });

  const pack = db.updateCreditPack(req.params.id, req.body);
  if (!pack) return res.status(404).json({ error: 'Pack introuvable' });
  res.json({ pack });
});

apiRouter.get('/admin/logs', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
  res.json({ logs: db.getAuditLogs() });
});
