//Esta función de generar el id, es para el token (que va a ser un id). No es el id de la bd. Ese ya lo crea el mongo
export const generarId= ()=>{
const random = Math.random().toString(32).substring(2);
const fecha = Date.now().toString(32);
return random + fecha;
}