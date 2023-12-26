//este fichero, el controlador, va  a comunicar el routing con el modelo
import {generarId} from "../helpers/generarId.js";
import {generarJWT} from "../helpers/generarJWT.js";
import Usuario from "../models/Usuario.js";
import {emailRegistro, emailRecuperarPassword} from "../helpers/emails.js";

/* Esto es un ejemplo para que veas como funciona.
const usuarios = (req, res)=>{
    res.json("Desde el controlador")
}
}*/
const registrar = async (req, res)=>{
    //Evitar registros duplicados
    const {email} = req.body //.body es porque los valores los paso yo (por el formulario). Si los coge de la url es .params
    const existeUsuario = await Usuario.findOne({email: email})//busco el email

    if (existeUsuario){
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({ message: error.message})
    }
    
    try {
        //creamos una nueva instancia a partir del modelo
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        // aquí (el .save) llama al modelo para ver si hay algún middleware. En este caso sí, un pre para hashear las contraseñas
        await usuario.save();//esto es lo que va a insertar en la bd.

        //Enviar el email de confirmación
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Usuario creado correctamente, Revisa tu email para confirmar tu cuenta"})

    }catch (error){
        console.log("Error: " + error)
    }
}

const confirmar = async (req, res) => {
    //console.log(req.params.token)//.token es lo dínamico. es .toke porque en la routar  es :token.
    const {token} = req.params
    const usuarioConfirmar = await Usuario.findOne({token})

    //si el usuario ha confirmado
    if(!usuarioConfirmar){
        const error = new Error("Token no válido");
        return res.status(403).json({ message: error.message})
    }
    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";//eliminamos el token porque es de 1 solo uso
        await usuarioConfirmar.save();
        res.json({ message: "Usuario confirmado correctamente"})
    }catch (error){
        console.log(error)``
    }
}

//esto es para iniciar sesión -> el login. Aquí lo que vamos a hacer es que para poder iniciar sesión tienes que confirmar contraseña
const autenticar = async (req, res) => {
    const {email, password} = req.body
    //Comprobar si el user existe
    const usuario= await Usuario.findOne({email});
    if (!usuario) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({message: error.message})
    }
    //Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada")
        return res.status(403).json({message: error.message})
    }
    //Comprobar su password --> esto lo vamos a hacer en el modelo (comprobar si la contraseña introducida es correcta)
    if (await usuario.comprobarPassword(password)){
        //si la contraseña es correcta, ya iniciamos sesión. Devolvemos una copia del usuario para tener un control de los usuarios que están activos.
        //o sea cuando un usuario ha iniciado sesión. Es porque está activo.
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),//este JWT es el que se le pasará a checkAuth
        })
    }else{
        const error = new Error("El password es incorrecto")
        return res.status(403).json({message: error.message})
    }
}

//Esta función es la encargada de generar de nuevo el token.
const olvidePassword = async (req, res) => {
    const {email} = req.body;
    const usuario= await Usuario.findOne({email});
    if (!usuario) {
        const error = new Error("El usuario no existe")
        return res.status(404).json({message: error.message})
    }
    try {
        usuario.token = generarId();//generamos de nuevo el token cuando el usuario quiera cambiar el password. Esto es para identificarle
        await usuario.save();

        //Enviar email para recuperar password
        emailRecuperarPassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: "Hemos enviado un email con las instrucciones"})
    }catch (error){
        console.log(error)
    }
}

const comprobarToken = async (req, res)=>{
    const {token} = req.params;
    const tokenValido = await Usuario.findOne({token})
    if (tokenValido){
        res.json({msg: "Token válido "})
    }else{
        const error = new Error("Token no válido")
        return res.status(404).json({message: error.message})
    }
}

const nuevoPassword = async (req, res)=>{
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token})

    if (usuario){
        usuario.password = password;
        usuario.token=""
        try {
            await usuario.save();
            res.json({msg: "Password modificado correctamente"})
        }catch (error){
            console.log(error)
        }
    }else{
        const error = new Error("Token no válido")
        return res.status(404).json({message: error.message})
    }
}

const perfil = async (req, res)=> {
    const {usuario} = req;
    res.json(usuario)
}

export {registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil}