// Configuration de l'application Express
const path = require('path');
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json()); // lit le JSON envoyé par le client

// Page d'accueil du site : on commence par la connexion
app.get('/', (req, res) => res.redirect('/login.html'));

// Pages HTML de démonstration (dossier public/)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes de l'API
app.use('/api/auth', authRoutes);

// Route API inconnue
app.use('/api', (req, res) => res.status(404).json({ message: 'Route introuvable.' }));

// Toujours en dernier : gestion des erreurs
app.use(errorHandler);

module.exports = app;
