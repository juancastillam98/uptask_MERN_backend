import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";
import Tarea from "../models/Tarea.js";
const nuevoProyecto = async (request, response) => {
    //console.log(request.body)
    //console.log(request.usuario)
    const proyecto = new Proyecto(request.body)
    proyecto.creador = request.usuario._id; //el creador es el usuario logueado
    try {
        const proyectoAlmacenado = await proyecto.save();
        response.json(proyectoAlmacenado); //devolvemos el proyecto
    }catch (error){
        console.log(error)
    }
}
const obtenerProyectos = async (request, response) => {
    //consulta para recuperar proyectos en los que el usuario que realiza la solicitud está involucrado como creador o colaborador, y luego envía esa lista de proyectos al cliente.
    const proyectos = await Proyecto.find({
        '$or':[
            {"colaboradores":{$in:  request.usuario}},
            {"creador":{$in:  request.usuario}},
        ]
    }).select("-tareas");
    response.json(proyectos)
}

const obtenerProyecto = async (request, response) => {
    const {id} = request.params;
    //compruebo que el proyecto existe en la bd
    const proyecto = await Proyecto.findById(id)
        .populate({
            path: "tareas",
            populate: {path: "completado", select: "nombre"},
        })//la referencia es por el nombre  del campo en el modelo. Estamos aplicando un populate a un elemento que tiene un populate. Como una subconsulta
        .populate("colaboradores", "nombre email")//el 2º campo son los campos que quiero traerme

    if (!proyecto){
        const error = new Error("No encontrado");
        return response.status(404).json({msg: error.message})
    }
    //si el id de creador que tiene el proyecto no es el mismo que el que tiene un usuario, y tampoco tiene ningún colaborador
    if (proyecto.creador.toString() !== request.usuario._id.toString() &&
        !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === request.usuario._id.toString())) {
        const error = new Error("Acción no válida");
        return response.status(401).json({msg: error.message})
    }
    //Obtener las tareas de un proyecto
    //const tareas = await Tarea.find().where("proyecto").equals(proyecto._id)//proyecto._id es el que está en la bd
    response.json(proyecto)
}
const editarProyecto = async (request, response) => {
    const {id} = request.params;
    const proyecto = await Proyecto.findById(id)
    if (!proyecto){
        const error = new Error("No encontrado");
        return response.status(404).json({msg: error.message})
    }
    //si el id de creador que tiene el proyecto no es el mismo que el que tiene un usuario, devuelve un 404
    if (proyecto.creador.toString() !== request.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return response.status(401).json({msg: error.message})
    }

    proyecto.nombre=request.body.nombre || proyecto.nombre;
    proyecto.descripcion=request.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega=request.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente=request.body.cliente || proyecto.cliente;

    try {
        const proyectoAlmacenado = await proyecto.save();
        response.json(proyectoAlmacenado)
    }catch (error) {
        console.log(error)
    }
}
const eliminarProyecto = async (request, response) => {
    const {id} = request.params;
    const proyecto = await Proyecto.findById(id)
    if (!proyecto){
        const error = new Error("No encontrado");
        return response.status(404).json({msg: error.message})
    }
    //si el id de creador que tiene el proyecto no es el mismo que el que tiene un usuario, devuelve un 404
    if (proyecto.creador.toString() !== request.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return response.status(401).json({msg: error.message})
    }
    try{
        await proyecto.deleteOne();
        response.json({msg: "Proyecto eliminado"})
    }catch (error){
        console.log(error)
    }
}

const buscarColaborador=async(request, response)=>{
    //console.log(request.body)
    const {email}=request.body;
    const usuario = await Usuario.findOne({email})
        .select("-confirmado -createdAt -password -token -updatedAt -__v")
    if (!usuario){
        const error = new Error("Usuario no encontrado");
        return response.status(404).json({msg: error.message});
    }
    response.json(usuario)
}
const agregarColaborador = async (request, response) => {
    const proyecto = await Proyecto.findById(request.params.id)
    if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return response.status(404).json({msg: error.message});
    }
    //solo aquel quien creó el proyecto puede añadir colaboradores
    if (proyecto.creador.toString() !== request.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return response.status(404).json({msg: error.message});
    }

    //Comproabamos si el existe el usuaro que vamos a añador
    const {email}=request.body;
    const usuario = await Usuario.findOne({email})
        .select("-confirmado -createdAt -password -token -updatedAt -__v")
    if (!usuario){
        const error = new Error("Usuario no encontrado");
        return response.status(404).json({msg: error.message});
    }

    //Comprobamos que el colaborador no es el admin del proyecto
    if (proyecto.creador.toString() === usuario._id.toString()) {
        const error = new Error("El creador del proyecto no puede ser colaborador");
        return response.status(404).json({msg: error.message});
    }

    //Comprobamos que el usuaro que queremos agregar no esté ya agreado al proyecto
    if (proyecto.colaboradores.includes(usuario._id)) {
        const error = new Error(`Ya está el usuario ${usuario.nombre} agregado al proyecto`);
        return response.status(404).json({msg: error.message});
    }

    //agregar usuario
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save();
    response.json({msg: "Colaborador agregado correctamente"})
}
const eliminarColaborador = async (request, response) => {
    const proyecto = await Proyecto.findById(request.params.id)
    if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return response.status(404).json({msg: error.message});
    }
    //solo aquel quien creó el proyecto puede añadir colaboradores
    if (proyecto.creador.toString() !== request.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return response.status(404).json({msg: error.message});
    }

    //eliminar colaborador
    proyecto.colaboradores.pull(request.body.id)//le pasamos el id del colaborador
    await proyecto.save();
    response.json({msg: "Colaborador eliminado correctamente"})

}

export {
    nuevoProyecto,
    obtenerProyectos,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}