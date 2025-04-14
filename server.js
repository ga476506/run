const express = require('express');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs'); // Importación de fs para manejar directorios
const db = require('./config/bd');

const app = express();
const port = 3000;
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Para formularios
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de almacenamiento de imágenes con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadDir;
        if (file.fieldname === 'foto_ine') {
            uploadDir = path.join(__dirname, 'Public', 'Images', 'INE');
        } else if (file.fieldname === 'foto_perfil') {
            uploadDir = path.join(__dirname, 'Public', 'Images', 'avatares');
        } else if (file.fieldname === 'foto_licencia') {
            uploadDir = path.join(__dirname, 'Public', 'Images', 'Licencia');
        } else {
            uploadDir = path.join(__dirname, 'Public', 'Images'); // Carpeta por defecto (si es otro tipo de archivo)
        }

        // Crear el directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Configuración de multer para manejar múltiples archivos
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'Public')));

// Ruta para servir la página de login
app.get('/ingresar', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'ingresar.html'));
});
app.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'log.html'));
});

// Ruta POST para registro de usuario
app.post('/registro', upload.fields([
    { name: 'foto_ine', maxCount: 1 },
    { name: 'foto_perfil', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      nombre,
      apellido_paterno,
      apellido_materno,
      fecha_nacimiento,
      programa_educativo,
      telefono,
      correo,
      genero,
      contrasena
    } = req.body;

    const foto_ine = req.files['foto_ine'] ? req.files['foto_ine'][0].filename : null;
    const foto_perfil = req.files['foto_perfil'] ? req.files['foto_perfil'][0].filename : null;

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const sql = `
      INSERT INTO Usuario (
        nombre, apellido_paterno, apellido_materno, fecha_nacimiento, programa_educativo,
        telefono, correo, genero, foto_ine, foto_perfil, contrasena
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, programa_educativo,
      telefono, correo, genero, foto_ine, foto_perfil, hashedPassword
    ], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al registrar usuario');
      } else {
        res.send('Usuario registrado con éxito');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta POST para login de usuario
app.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  const sql = 'SELECT * FROM Usuario WHERE correo = ?';
  db.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error del servidor' });
    }
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Correo no registrado' });
    }

    const usuario = results[0];
    const match = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Enviamos sólo lo necesario
    const datosUsuario = {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      foto_perfil: usuario.foto_perfil
    };
    res.json({ success: true, usuario: datosUsuario });
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});