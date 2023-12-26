import express from "express";

import {
    nuevoProyecto,
    obtenerProyectos,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
} from "../controllers/proyectoController.js";

//hay que importar el checkAuth, porque para hacer todo lo relacionado con los proyectos el usuario ha de estar autenticado
import {checkAuth} from "../middleware/checkAuth.js";

const router = express.Router()

router
    .route("/")
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto)

router
    .route("/:id")//id del proyecto
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)// put para actualizar
    .delete(checkAuth, eliminarProyecto)
//router.get('/tareas/:id', checkAuth, obtenerTareas)
router.post("/colaboradores", checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)//el /:id es el id del proyecto
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)//no es delete porque delete es para borrar un elemento de la bd y no queremos eso

export default router;