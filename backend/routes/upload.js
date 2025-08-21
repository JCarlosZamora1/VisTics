const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ruta absoluta de la carpeta uploads
const uploadDir = path.join(__dirname, '..', 'uploads');

// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configura Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Si req.body.usuario no existe, poner "anonimo" para evitar undefined
    const usuario = req.body.usuario || 'anonim0';
    const filename = `${usuario}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Ruta de subida de imagen
router.post('/upload', upload.single('imagen'), (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen.' });

  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
