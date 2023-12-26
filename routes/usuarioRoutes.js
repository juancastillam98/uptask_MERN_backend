import express from 'express';
const router = express.Router();
import {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
} from "../controllers/usuarioController.js"; //controlador de usuarios
import {checkAuth} from "../middleware/checkAuth.js";
/*
router.get('/', (req, res) => {// aquí el / hace referencia a la misma url que recibe en el routing. En este caso /api/usuarios
    res.send("Desde - get - API/Usuarios")
})
router.post('/confirmar', (req, res) => {// aquí el /confirmar --> la url que comprueba es /api/usuarios/confirmar
    res.send("Desde - Post - Confirmarndo")
})
*/
/* Esto es un ejemplo para que veas como está comunicado todo
router.get("/",usuarios);//redirigimos al controllador de usuario
router.post("/",crearUsuario);//redirigimos al controllador de usuario*/

//Autenticación, Registro y Confirmación de Usuario
router.post("/", registrar); //para crear un nuevo usuario
router.get("/confirmar/:token", confirmar)//al ponerle las : genero el routing dinámico
router.post("/login", autenticar)
router.post("/olvide-password", olvidePassword)
/*
Esto es lo mismo que lo que hay en router.route
router.get("/olvide-password/:token", comprobarToken)
router.post("/olvide-password/:token", nuevoPassword)
 */
//Aquí estoy diciendo que por el método get llame a comprobarToken y por el método post a nuevoPassword
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)
router.get("/perfil", checkAuth, perfil); //entra a /perfil, ejecuta el middleware (checkAuth) y luego entra en perfil
export default router;