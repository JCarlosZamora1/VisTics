// passport-config.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
//USO DE STRATEGY para definir multiples formas de autenticacion sin cambiar codigo de cliente
module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: '703054638779-sdfhkvkv4ei28pr47198lcvr6p0kgf7d.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const nombre = profile.displayName;
        const googleId = profile.id;
        const usuario = `google_${googleId.substring(0, 8)}`;

        // Verifica si ya existe por correo
        db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
          if (err) return done(err);

          if (user) return done(null, user); // Ya existe

          // Insertar nuevo usuario (sin password, con esadmin = 0)
          db.run(
            `INSERT INTO usuarios (nombre, usuario, email, password, esadmin)
             VALUES (?, ?, ?, NULL, 0)`,
            [nombre, usuario, email],
            function (err) {
              if (err) return done(err);

              db.get('SELECT * FROM usuarios WHERE id = ?', [this.lastID], (err, newUser) => {
                if (err) return done(err);
                return done(null, newUser);
              });
            }
          );
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM usuarios WHERE id = ?', [id], (err, user) => {
      done(err, user);
    });
  });
};
