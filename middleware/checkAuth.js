import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js";
export const checkAuth = async (request, response, next)=>{
    let token;
    //en el header es donde se va a enviar la auth y si la authorization es de tipo barer.
    //en postman, en el apartado de authorization hemos configurado el token de tipo Bearer. O sea hemos dicho que reciba un token de tipo bearer
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")){
        try {
            token= request.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            //console.log(decoded) al decodificarlo, me da el id del usuario (Recuerda que se le pasaba un id (el del user) como parámetro)
            //a partir del id extraido del JWT, buscamos el usuario por ese id y lo pasamos por request
            //el .select("-password") es para decirle que no nos de la contraseña
            request.usuario = await Usuario.findById(decoded.id).select("-password  -confirmado -token -createdAt  -updatedAt -__v")

            return next();
        }catch (error) {
            return response.status(404).json({msg: "Hubo un error"})
        }
    }
    if (!token) {
        const error = new Error("Token no válido")
        return response.status(401).json({msg: error.message})
    }
    next(); //se pasa al siguiente middleware (es el de crear proyecto)
}