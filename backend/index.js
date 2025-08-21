require('dotenv').config();
console.log(process.env.GOOGLE_CLIENT_ID);

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const multer = require('multer');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'clave_maestra'; 
const nodemailer = require('nodemailer');

// OBSERVER PATTERN notificacio en consola

// Sujeto (Subject)
class Observable {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

// Observador base
class Observer {
  update(data) {
 
  }
}

// Observadores concretos
class ConsoleLogger extends Observer {
  update(data) {
    console.log('🔔Notificación de Observer:', data);
  }
}

// Instanciar sujeto y observadores
const observerSubject = new Observable();
const loggerObserver = new ConsoleLogger();
observerSubject.subscribe(loggerObserver);

// Uso de notificaciones en eventos relevantes
function notificarEvento(evento, usuario) {
  observerSubject.notify(`Evento: ${evento} - Usuario: ${usuario}`);
}
//OBSERVER

//OAUTH

const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const configurePassport = require('./passport-config');
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});


app.use(session({ secret: 'secreto123', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
  origin: 'http://localhost:3000', // tu frontend
  credentials: true,
}));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesión temporal para Passport (necesario)
app.use(
  session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
configurePassport(passport);

// Rutas
app.use('/api/auth', authRoutes);
// Ruta para iniciar la autenticación con Google
app.get('/login', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/login/callback',
  passport.authenticate('google', {
    failureRedirect: '/login-failure',
    successRedirect: '/dashboard', 
  })
);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//OAUTH

// --Base de datos 

//USO DE SINGLETON PATTERN, pues solo hay una instancia de la bdd en todo el back
const db = new sqlite3.Database('./usuarios.db', (err) => {
  if (err) {
    console.error('Error al abrir la base de datos', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');

    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          usuario TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          esAdmin INTEGER DEFAULT 0
        );
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS graficas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          archivo TEXT NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
      `);
    });
  }
});

//DEMO DESCARGA CSV


// Express.js (ejemplo)
app.get('/api/graficas/descargar/:nombreArchivo', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.nombreArchivo);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Archivo no encontrado:', filePath);
      return res.status(404).send('Archivo no encontrado');
    }

    res.download(filePath, (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
        res.status(500).send('Error al descargar el archivo');
      }
    });
  });


 
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tucorreo@gmail.com',
    pass: 'tu_contraseña_de_aplicación_o_real',
  },
});

const mailOptions = {
  from: 'tucorreo@gmail.com',
  to: 'destinatario@ejemplo.com',
  subject: 'Asunto del correo',
  text: 'Cuerpo del mensaje',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error enviando correo:", error);
  } else {
    console.log("Correo enviado:", info.response);
  }
});

//

// Directorio para gráficas
const grafDir = path.join(__dirname, 'graficas');
if (!fs.existsSync(grafDir)) fs.mkdirSync(grafDir);

// Multer: para subir archivos
const upload = multer({ storage: multer.memoryStorage() });
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT Middleware o bueno ignorar este


//USO DE PROXY PATTERN pues valida si un usaurio tiene acceso antes de ejecturar rutas
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = authHeader; // Por si solo envían el token sin "Bearer "
  }

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}


// Rutas
app.use('/api', uploadRoutes);

// Ruta para subir archivo CSV vía formulario con multer)
app.post('/api/graficas/upload', authenticateToken, upload.single('archivo'), (req, res) => {
  const nombre = req.body.nombre;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió archivo' });
  }

  // Seguridad para nombre de archivo
  const safeNombre = nombre.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();

  // Definir nuevo nombre para archivo final
  const filename = `${Date.now()}_${req.user.id}_${safeNombre}.csv`;
  const targetPath = path.join(grafDir, filename);

  // Mover archivo desde carpeta temporal 'uploads' a 'graficas'
  fs.rename(req.file.path, targetPath, (err) => {
    if (err) {
      console.error('Error al mover archivo:', err);
      return res.status(500).json({ error: 'Error guardando archivo' });
    }

    // Insertar registro en base de datos
    db.run(
      'INSERT INTO graficas (usuario_id, nombre, archivo) VALUES (?, ?, ?)',
      [req.user.id, nombre, filename],
      function (err) {
        if (err) {
          console.error('Error al insertar gráfica en BD:', err);
          return res.status(500).json({ error: 'Error al registrar gráfica' });
        }

        res.status(201).json({
          message: 'Gráfica guardada exitosamente',
          id: this.lastID,
          nombre,
          archivo: filename,
        });
      }
    );
  });
});


// Registro
app.post('/api/register', async (req, res) => {
  const { nombre, usuario, email, password } = req.body;
  if (!nombre || !usuario || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    db.get('SELECT COUNT(*) AS count FROM usuarios', (err, row) => {
      if (err) return res.status(500).json({ error: 'Error al verificar usuarios existentes' });

      const esAdmin = row.count === 0 ? 1 : 0;

      db.run(
        'INSERT INTO usuarios (nombre, usuario, email, password, esAdmin) VALUES (?, ?, ?, ?, ?)',
        [nombre, usuario, email, hashedPassword, esAdmin],
        function (err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'El usuario o email ya existe' });
            }
            return res.status(500).json({ error: 'Error al registrar usuario' });
          }

          res.status(201).json({ message: 'Usuario registrado con éxito', id: this.lastID });
        }
      );
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al encriptar la contraseña' });
  }
});

// Login
app.post('/api/login', (req, res) => {

  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Error en base de datos' });
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    try {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      
      //OBSERVER PATTERN AQUI
      notificarEvento('Inicio de sesión', user.usuario);

      const token = jwt.sign(
        { id: user.id, usuario: user.usuario, esAdmin: user.esAdmin },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.json({
        token,
        usuario: {
          id: user.id,
          usuario: user.usuario,
          nombre: user.nombre,
          esAdmin: user.esAdmin,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error al comparar contraseña' });
    }
  });
});

// Obtener lista de usuarios (solo admin)
app.get('/api/users', authenticateToken, (req, res) => {
  if (!req.user.esAdmin) {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }

  db.all('SELECT id, nombre, usuario, email FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(rows);
  });
});

//nose
app.post('/api/graficas/test', (req, res) => {
  res.json({ message: 'Ruta /api/graficas/test OK' });
});


// Guardar gráfica CSV con contenido desde frontend
app.post('/api/graficas', authenticateToken, upload.single('archivo'), (req, res) => {
  const { nombre } = req.body;
  const contenidoCSV = req.file?.buffer?.toString(); 

  if (!nombre || !contenidoCSV) {
    return res.status(400).json({ error: 'Nombre y archivo CSV son requeridos' });
  }

  const safeNombre = nombre.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
  const filename = `${Date.now()}_${req.user.id}_${safeNombre}.csv`;
  const filepath = path.join(grafDir, filename);

  fs.writeFile(filepath, contenidoCSV, (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar el archivo' });

    db.run(
      'INSERT INTO graficas (usuario_id, nombre, archivo) VALUES (?, ?, ?)',
      [req.user.id, nombre, filename],
      function (err) {
        if (err) return res.status(500).json({ error: 'Error al registrar gráfica en BD' });

        res.status(201).json({ message: 'Gráfica guardada', id: this.lastID });
      }
    );
  });
});


// Listar gráficas del usuario
app.get('/api/graficas', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, nombre, archivo, fecha_creacion FROM graficas WHERE usuario_id = ?',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener gráficas' });
      res.json(rows);
    }
  );
});

// Descargar gráfica CSV
app.get('/api/graficas/:id/download', authenticateToken, (req, res) => {
  const id = req.params.id;

  db.get(
    'SELECT archivo FROM graficas WHERE id = ? AND usuario_id = ?',
    [id, req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Error al buscar gráfica' });
      if (!row) return res.status(404).json({ error: 'Gráfica no encontrada' });

      const filepath = path.join(grafDir, row.archivo);
      res.download(filepath);
    }
  );
});

//IMPLEMENTANDO GRAFICAS GUARDADAS DEMO
app.get('/api/graficas', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, nombre, archivo FROM graficas WHERE usuario_id = ?',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error consultando gráficas' });
      res.json(rows);
    }
  );
});

app.delete('/api/graficas/:id', authenticateToken, (req, res) => {
  const graficaId = req.params.id;

  db.get(
    'SELECT archivo FROM graficas WHERE id = ? AND usuario_id = ?',
    [graficaId, req.user.id],
    (err, row) => {
      if (err || !row) return res.status(404).json({ error: 'Gráfica no encontrada' });

      const filePath = path.join(grafDir, row.archivo);

      fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ error: 'Error borrando archivo' });

        db.run(
          'DELETE FROM graficas WHERE id = ? AND usuario_id = ?',
          [graficaId, req.user.id],
          (err) => {
            if (err) return res.status(500).json({ error: 'Error borrando de la BD' });
            res.json({ message: 'Gráfica eliminada' });
          }
        );
      });
    }
  );
});

app.get('/api/perfil', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'secreto123');
    res.json({ nombre: decoded.nombre });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});


//AQUI TERMINA DEMO 1

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
