//fichero con la configuración del servidor
//const express = require('express');//busca en node_modules el paquete de express
//Para poder usar esta sintaxis, hemos tenido que añadir   "type": "module", al package.json
import express from 'express';
import dotenv from 'dotenv';//dependencia para crear variables de entorno
import cors from 'cors'; //este es el paquete que nos permite importar los dominios desde el front. (el fron corre en el puerto 5173 y el back en el 4000

import {conectarDB} from './config/db.js'
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();//recuerda, express es la parte de las APIs en MERN
app.use(express.json()); //esto es para poder procesar las solicitudes vía json
dotenv.config();
conectarDB();

///Configurar CORS --> cors es desde donde le van a llegar las peticiones. (Del frontend por el puerto que tenga, en este caso el 5173)
const whitelist= [process.env.FRONTED_URL];//lista de dominios permitidos
const corsOptions = {
  origin: function (origin, callback) {
    //console.log(origin) nos muestra el http://localhost:5173/
    if (whitelist.includes(origin)){
      //Puede consultar la API
      callback(null, true);//null porque no hay mensaje que mostrar, true para darle acceso
    }else{
      //No está permitido
      callback(new Error("Error de Cors"))
    }
  }
}
app.use(cors(corsOptions))//el primer param es el origin

//Routing /puede ser app.get/.post/.put/.delete - seguido del endpoint (.use es que admite todo)
//está redirigiendo a usuarioRoutes.js. Cuando se escriba /api/usuarios -> redirige a usuarioRoutes.js y se ejecuta
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;//comprueba si existe la variable PORT en .env, en cuyo caso contrario usará el 4000.
//hemos metido el puerto en una variable propia porque al hacer el deployiment nos podrá en el puerto que esté disponible
const servidor= app.listen(PORT, () => {//almacenamos la referencia en una variable
  console.log(`Servidor correiendo en el puerto ${PORT}`);
  console.log(`Url del frontEND ${process.env.FRONTED_URL}`)
})

//Socket.io
import {Server} from 'socket.io';
import proyecto from "./models/Proyecto.js";
const io = new Server(servidor, {
  pingTimeout: 60000,
  //recuerda, cors es desde donde le van a llegar las peticiones
  cors: {
    origin: process.env.FRONTED_URL,
    credentials: true
  }
})
//abrimos una nueva conexión
io.on("connection", (socket) => {
  console.log("Conectado a socket.io")

  socket.on("abrir proyecto", (idProyecto)=>{
    //socket.join es para separar
    socket.join(idProyecto)//estamos separando cada proyecto (le pasamos el id del proyecto) en un socket distinto.
    //o sea estamos creando distintas rooms para cada cada proyecto
    //la idea del socket.join es que cada vez que un usuario entre en un proyecto, esté en un socket diferente
  })

  // En el servidor
    socket.on("nueva tarea",  (tarea)=> {
      const proyecto= tarea.proyecto
      socket.to(proyecto).emit("tarea agregada", tarea)//enviamos la tarea a todos los usuarios que estén en ese room.
    });

  socket.on("eliminar tarea", (tarea)=> {
    const proyecto= tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea)
  })

  socket.on("actualizar tarea", (tarea)=> {
    const proyecto= tarea.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada", tarea)
  })

  socket.on("cambiar estado", (tarea)=> {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea)
  })


  //socket.to("658489a5d0ef79e8346be748").emit("respuesta", {nombre: "Juan"})//este envía a un usuario concreto
  //socket.emit("respuesta", {nombre: "Juan"})//este emite se envía a todos los usuarios.

})