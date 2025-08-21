const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

passport.use(new GoogleStrategy({
  clientID: '703054638779-sdfhkvkv4ei28pr47198lcvr6p0kgf7d.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:5000/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Aquí podrías guardar en la base de datos si quieres
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        email: user.email,
        esadmin: !!user.esadmin,
      },
      'secreto',
      { expiresIn: '1h' }
    );

    // Redirige al frontend con el token
    res.redirect(`http://localhost:3000?token=${token}`);
  }
);


router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user;
    const nombre = user.displayName;

    // Crear token JWT
    const token = jwt.sign({ nombre }, 'secreto123', { expiresIn: '1h' });

    // Redirigir al frontend con el token
    res.redirect(`http://10.0.2.2:5173/?token=${token}`);
  }
);

module.exports = router;

