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
const session = require('express-session');
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Para formularios
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: '230904',
  resave: false,
  saveUninitialized: false
}));

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

app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir la página
app.get('/ingresar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ingresar.html'));
});
app.get('/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'log.html'));
});
app.get('/publicarViaje', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'publicarViaje.html'));
});
app.get('/registro-conductor', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registroConductor.html'));
});
app.get('/subelicencia', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'subirLicencia.html'));
});
app.get('/buscarViaje', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'viajePublicado.html'));
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

    const sqlUsuario = `
    INSERT INTO Usuario (
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, programa_educativo,
      telefono, correo, genero, foto_ine, foto_perfil, contrasena
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

    db.query(sqlUsuario, [
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento, programa_educativo,
      telefono, correo, genero, foto_ine, foto_perfil, hashedPassword
    ], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al registrar usuario');
      } else {
        const idUsuario = result.insertId;

        // Insertar rol de pasajero (id_rol = 1)
        const sqlRol = `INSERT INTO Usuario_Rol (id_usuario, id_rol) VALUES (?, ?)`;
        db.query(sqlRol, [idUsuario, 1], (err2, result2) => {
          if (err2) {
            console.error(err2);
            res.status(500).send('Usuario creado, pero error al asignar rol');
          } else {
            res.send('Usuario registrado con rol pasajero');
          }
        });
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
    req.session.userId = usuario.id_usuario; // Guardar el ID del usuario en la sesión
    // Enviamos sólo lo necesario
    const datosUsuario = {
      id: usuario.id_usuario,
      nombre: usuario.nombre,
      foto_perfil: usuario.foto_perfil
    };
    res.json({ success: true, usuario: datosUsuario });
  });
});

app.get('/perfils', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'perfil.html'));
});

app.get('/verificar-conductor', async (req, res) => {
  const id_usuario = req.session.userId;
  console.log('ID de usuario recibido en el backend:', id_usuario); // Verifica el valor recibido

  try {
    const [result] = await db.promise().query(
      'SELECT * FROM Conductor_Info WHERE id_usuario = ?',
      [id_usuario]
    );
    const esConductor = result.length > 0;
    console.log('Resultado de la consulta:', result);
    console.log('Es conductor:', esConductor);
    res.json({ esConductor });
  } catch (error) {
    console.error('Error al verificar conductor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/registrar-automovil', (req, res) => {
  const { placas, modelo, ano, color, numero_serie } = req.body;
  const query = 'INSERT INTO Automovil (placas, modelo, ano, color, numeroz_serie) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [placas, modelo, ano, color, numero_serie], (err, result) => {
    if (err) {
      console.error('Error al registrar automóvil:', err);
      res.status(500).send('Error al registrar automóvil');
      return;
    }
    req.session.autoId = result.insertId; // Guardar el ID del automóvil en la sesión
    res.redirect('/subelicencia');
  });
});

app.post('/subir-licencia', upload.single('foto_licencia'), (req, res) => {
  const id_usuario = req.session.userId;
  const id_automovil = req.session.autoId;
  const foto_licencia = req.file.filename;

  if (!id_usuario || !id_automovil || !foto_licencia) {
    return res.status(400).send('Faltan datos para registrar al conductor.');
  }

  const query = 'INSERT INTO Conductor_Info (id_usuario, id_automovil, foto_licencia) VALUES (?, ?, ?)';
  db.query(query, [id_usuario, id_automovil, foto_licencia], (err, result) => {
    if (err) {
      console.error('Error al guardar la información del conductor:', err);
      return res.status(500).send('Error al registrar la información del conductor');
    }

    res.redirect('/publicarViaje');
  });
});

app.post('/publicar-viaje', async (req, res) => {
  const id_usuario = req.session.userId; // 🔥 CAMBIA AQUÍ: usa sesión, no body

  const {
    origen,
    destino,
    hora,
    fecha,
    ruta,
    numero_asientos,
    costo_asiento
  } = req.body;

  if (!id_usuario) {
    return res.status(401).json({ mensaje: 'Usuario no autenticado' });
  }

  try {
    const [conductorAutoRows] = await db.promise().query(`
      SELECT id_usuario, id_automovil
      FROM Conductor_Info
      WHERE id_usuario = ?
    `, [id_usuario]);

    if (conductorAutoRows.length === 0) {
      return res.status(400).json({ mensaje: 'El usuario no es conductor o no tiene automóvil registrado' });
    }

    const { id_usuario: id_usuario_conductor, id_automovil } = conductorAutoRows[0];

    await db.promise().query(
      `INSERT INTO Viaje_Publicado (
        id_usuario, id_automovil, origen, destino, hora, fecha, ruta, numero_asientos, costo_asiento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario_conductor, id_automovil, origen, destino, hora, fecha, ruta, numero_asientos, costo_asiento]
    );

    res.status(200).json({ mensaje: 'Viaje publicado exitosamente' });
  } catch (error) {
    console.error('Error al publicar viaje:', error);
    res.status(500).json({ mensaje: 'Error al publicar viaje' });
  }
});

app.get('/viajes', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
    SELECT 
    u.nombre AS nombre_usuario,
    a.modelo AS modelo_auto,
    a.color AS color_auto,
    vp.origen,
    vp.destino,
    vp.hora,
    vp.fecha,
    vp.ruta,
    vp.numero_asientos,
    vp.costo_asiento
    FROM 
    Viaje_Publicado vp
    JOIN 
    Usuario u ON vp.id_usuario = u.id_usuario
    JOIN 
    Automovil a ON vp.id_automovil = a.id_automovil;
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los viajes:', error);
    res.status(500).send('Error al obtener los viajes');
  }
});

//Ver perfil
app.get('/api/perfil', async (req, res) => {
  const id_usuario = req.session.userId;
  if (!id_usuario) return res.status(401).json({ mensaje: 'No autenticado' });

  try {
    const [usuarioRows] = await db.promise().query(`
      SELECT id_usuario, nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
             programa_educativo, telefono, correo, genero, foto_perfil
      FROM Usuario
      WHERE id_usuario = ?
    `, [id_usuario]);

    if (usuarioRows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const usuario = usuarioRows[0];

    const [conductorRows] = await db.promise().query(`
      SELECT c.id_automovil, c.foto_licencia, a.modelo, a.ano, a.color, a.numeroz_serie, a.placas
      FROM Conductor_Info c
      JOIN Automovil a ON c.id_automovil = a.id_automovil
      WHERE c.id_usuario = ?
    `, [id_usuario]);

    if (conductorRows.length > 0) {
      usuario.conductor = true;
      usuario.automovil = conductorRows[0];
    } else {
      usuario.conductor = false;
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

//Editar perfil
app.post('/api/perfil', upload.single('foto_perfil'), async (req, res) => {
  const id_usuario = req.session.userId;
  if (!id_usuario) return res.status(401).json({ mensaje: 'No autenticado' });

  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    fecha_nacimiento,
    programa_educativo,
    telefono,
    genero,
    modelo,
    ano,
    color,
    numeroz_serie,
    placas
  } = req.body;

  const nuevaFoto = req.file ? req.file.filename : null;

  try {
    // Actualizar datos del usuario
    let sql = `
      UPDATE Usuario SET
        nombre = ?, apellido_paterno = ?, apellido_materno = ?,
        fecha_nacimiento = ?, programa_educativo = ?, telefono = ?, genero = ?
    `;
    const valores = [nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
                     programa_educativo, telefono, genero];

    if (nuevaFoto) {
      sql += `, foto_perfil = ?`;
      valores.push(nuevaFoto);
    }

    sql += ` WHERE id_usuario = ?`;
    valores.push(id_usuario);

    await db.promise().query(sql, valores);

    // Consultar si es conductor
    const [conductorRows] = await db.promise().query(`
      SELECT c.id_automovil
      FROM Conductor_Info c
      WHERE c.id_usuario = ?
    `, [id_usuario]);

    if (conductorRows.length > 0) {
      const id_automovil = conductorRows[0].id_automovil;

      // Asegurarse de que todos los campos del automóvil estén presentes
      if (modelo && ano && color && numeroz_serie && placas) {
        await db.promise().query(`
          UPDATE Automovil SET
            modelo = ?, ano = ?, color = ?, numeroz_serie = ?, placas = ?
          WHERE id_automovil = ?
        `, [modelo, ano, color, numeroz_serie, placas, id_automovil]);
      }
    }

    res.json({ mensaje: 'Perfil actualizado correctamente', foto_perfil: nuevaFoto });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});



app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});