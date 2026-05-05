// src/routes/requests.js
// Routes publiques — soumission de demandes de service

const express = require('express');
const router = express.Router();
const { queries } = require('../database');

// ─── Validation simple ───────────────────────────────────────────────────────
function validateRequest(body) {
  const { name, phone, address, service } = body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Le nom doit contenir au moins 2 caractères');

  if (!phone || !/^[0-9+\s\-().]{6,20}$/.test(phone.trim()))
    errors.push('Numéro de téléphone invalide');

  if (!address || address.trim().length < 3)
    errors.push('Adresse trop courte');

  if (!service || service.trim().length < 3)
    errors.push('Veuillez choisir un service');

  return errors;
}

// ─── POST /api/requests — Soumettre une demande ──────────────────────────────
router.post('/', (req, res) => {
  const errors = validateRequest(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const { name, phone, address, service, message = '' } = req.body;

  try {
    const result = queries.insertRequest.run({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      service: service.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Demande envoyée avec succès ! Nous vous contacterons bientôt.',
      id: result.lastInsertRowid,
    });
  } catch (err) {
    console.error('Erreur insertion:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
