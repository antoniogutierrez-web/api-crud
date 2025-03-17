// index.js

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require('cors');

// Crear la aplicación Express y configurar middleware
const app = express();
app.use(express.json());
app.use(cors());

// Configurar la conexión a MongoDB
const username = encodeURIComponent("antonio2");
const password = encodeURIComponent("NuLe7AKaxdbTHwlD");
const cluster = "cluster01.xhorz.mongodb.net";
const authSource = "admin";
const authMechanism = "SCRAM-SHA-1";
const uri = `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`;

const client = new MongoClient(uri);
let db;

// Función para conectar a MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conexión exitosa a MongoDB!");
    db = client.db("sample_mflix");
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}

// Endpoints CRUD con documentación Swagger
/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Obtiene todos los comentarios
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   text:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 */
app.get("/api/comments", async (req, res) => {
  try {
    const collection = db.collection("comments");
    const comments = await collection.find().toArray();
    res.json(comments);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Agrega un nuevo comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - text
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario agregado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 */
app.post("/api/comments", async (req, res) => {
  try {
    const newComment = req.body;
    if (!newComment || !newComment.name || !newComment.email || !newComment.text) {
      return res.status(400).json({ error: "Faltan campos requeridos (name, email, text)" });
    }
    const result = await db.collection("comments").insertOne(newComment);
    res.json({ message: "Comentario agregado", id: result.insertedId });
  } catch (error) {
    console.error("Error al insertar comentario:", error);
    res.status(500).json({ error: "Error al insertar comentario" });
  }
});

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Actualiza un comentario existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del comentario a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.put('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const result = await db.collection("comments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }
    res.json({ message: "Comentario actualizado" });
  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    res.status(500).json({ error: "Error al actualizar comentario" });
  }
});

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Elimina un comentario existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del comentario a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.collection("comments").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }
    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ error: "Error al eliminar comentario" });
  }
});

// Endpoint raíz
app.get("/", (req, res) => {
  res.send("¡Servidor Express funcionando y conectado a MongoDB!");
});

// Configuración Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API CRUD de Comentarios',
      version: '1.0.0',
      description: 'Documentación de la API para manejar comentarios usando Express y MongoDB'
    },
    servers: [
      {
        url: process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:3000',
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


/**
 * @swagger
 * /api/comments:
 *   delete:
 *     summary: Elimina todos los comentarios
 *     responses:
 *       200:
 *         description: Todos los comentarios fueron eliminados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.delete("/api/comments", async (req, res) => {
  try {
    const result = await db.collection("comments").deleteMany({});
    res.json({ message: `Se eliminaron ${result.deletedCount} comentarios.` });
  } catch (error) {
    console.error("Error al eliminar comentarios:", error);
    res.status(500).json({ error: "Error al eliminar comentarios" });
  }
});
