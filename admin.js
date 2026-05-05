// src/routes/admin.js
// Routes admin protégées par JWT

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { queries, hashPassword } = require('../database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username et mot de passe requis' });
  }

  const admin = queries.getAdmin.get(username.trim());
  if (!admin) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const hash = hashPassword(password);
  if (hash !== admin.password_hash) {
    return res.status(401).json({ error: 'Identifiants incorrects' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token,
    username: admin.username,
    expiresIn: '8h',
  });
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', requireAuth, (req, res) => {
  const stats = queries.getStats.get();
  res.json({ success: true, stats });
});

// ─── GET /api/admin/requests ──────────────────────────────────────────────────
router.get('/requests', requireAuth, (req, res) => {
  const { status, search } = req.query;
  let list = queries.getAllRequests.all();

  // Filtre par status
  if (status && ['new', 'done'].includes(status)) {
    list = list.filter(r => r.status === status);
  }

  // Recherche par nom, téléphone ou adresse
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.service.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, total: list.length, requests: list });
});

// ─── GET /api/admin/requests/:id ─────────────────────────────────────────────
router.get('/requests/:id', requireAuth, (req, res) => {
  const req_data = queries.getRequestById.get(req.params.id);
  if (!req_data) return res.status(404).json({ error: 'Demande introuvable' });
  res.json({ success: true, request: req_data });
});

// ─── PATCH /api/admin/requests/:id/status ────────────────────────────────────
router.patch('/requests/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;

  if (!['new', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Status invalide (new | done)' });
  }

  const existing = queries.getRequestById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Demande introuvable' });

  queries.updateStatus.run(status, req.params.id);
  res.json({ success: true, message: `Status mis à jour : ${status}` });
});

// ─── DELETE /api/admin/requests/:id ──────────────────────────────────────────
router.delete('/requests/:id', requireAuth, (req, res) => {
  const existing = queries.getRequestById.get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Demande introuvable' });

  queries.deleteRequest.run(req.params.id);
  res.json({ success: true, message: 'Demande supprimée' });
});

// ─── POST /api/admin/change-password ─────────────────────────────────────────
router.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit avoir au moins 8 caractères' });
  }

  const admin = queries.getAdmin.get(req.admin.username);
  if (hashPassword(currentPassword) !== admin.password_hash) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
  }

  queries.updateAdminPassword.run(hashPassword(newPassword));
  res.json({ success: true, message: 'Mot de passe mis à jour avec succès' });
});

module.exports = router;
