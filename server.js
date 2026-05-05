// src/server.js
// Point d'entrée principal — TL Elect Services Backend

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',  // En prod: mets l'URL de ton frontend
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sert le frontend (fichier HTML) depuis le dossier public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== ROUTES API =====
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TL Elect Services API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// ===== FALLBACK → Frontend SPA =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ===== DÉMARRAGE =====
app.listen(PORT, () => {
  console.log('');
  console.log('⚡ ─────────────────────────────────────────');
  console.log('   TL ELECT SERVICES — Backend API');
  console.log(`   Serveur démarré sur http://localhost:${PORT}`);
  console.log('');
  console.log('   Routes disponibles :');
  console.log('   POST   /api/requests             → Soumettre une demande');
  console.log('   POST   /api/admin/login           → Connexion admin');
  console.log('   GET    /api/admin/requests        → Voir toutes les demandes');
  console.log('   GET    /api/admin/stats           → Statistiques');
  console.log('   PATCH  /api/admin/requests/:id/status → Changer status');
  console.log('   DELETE /api/admin/requests/:id    → Supprimer');
  console.log('   POST   /api/admin/change-password → Changer mot de passe');
  console.log('⚡ ─────────────────────────────────────────');
  console.log('');
});
