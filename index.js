// index.js

// 1. Importar las librerías necesarias
const { MongoClient, ObjectId } = require("mongodb");

const express = require("express");

// 2. Crear la aplicación Express y configurar middleware para JSON
const app = express();
app.use(express.json());

// 3. Configurar la conexión a MongoDB con los mismos parámetros que funcionaban
const username = encodeURIComponent("antonio2");
const password = encodeURIComponent("NuLe7AKaxdbTHwlD");
const cluster = "cluster01.xhorz.mongodb.net";
const authSource = "admin";
const authMechanism = "SCRAM-SHA-1";

let uri = `mongodb+srv://${username}:${password}@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`;

// 4. Crear una instancia del cliente de MongoDB
const client = new MongoClient(uri);

// 5. Declarar una variable global para la base de datos
let db;

// 6. Función para conectar a MongoDB (sin cerrar la conexión)
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conexión exitosa a MongoDB!");
    // Usa la misma base de datos que en tu código anterior
    db = client.db("sample_mflix");
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}

// 7. Endpoint GET para obtener todos los comentarios
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

// 8. Endpoint POST para agregar un nuevo comentario
app.post("/api/comments", async (req, res) => {
  try {
    const newComment = req.body;
    // Validar campos mínimos
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


// Endpoint PUT para actualizar un comentario
app.put('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id; // Obtenemos el id del parámetro de la URL
    const updatedData = req.body; // Obtenemos los datos actualizados del cuerpo de la petición
    
    // Intentamos actualizar el documento que coincida con el _id
    const result = await db.collection("comments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    
    if (result.matchedCount === 0) {
      // Si no se encontró ningún comentario con ese id, enviamos un error 404
      return res.status(404).json({ error: "Comentario no encontrado" });
    }
    
    res.json({ message: "Comentario actualizado" });
  } catch (error) {
    console.error("Error al actualizar comentario:", error);
    res.status(500).json({ error: "Error al actualizar comentario" });
  }
});


// Endpoint DELETE para eliminar un comentario
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Intentamos eliminar el documento que coincida con el _id
    const result = await db.collection("comments").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      // Si no se encontró el comentario, enviamos un error 404
      return res.status(404).json({ error: "Comentario no encontrado" });
    }
    
    res.json({ message: "Comentario eliminado" });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ error: "Error al eliminar comentario" });
  }
});

app.get("/", (req, res) => {
  res.send("¡Servidor Express funcionando y conectado a MongoDB!");
});

// 9. Iniciar el servidor y la conexión a MongoDB
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectDB(); // Conectar a MongoDB cuando arranca el servidor
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
