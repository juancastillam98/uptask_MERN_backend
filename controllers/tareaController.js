import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
const agregarTarea = async (request, response) => {
    const {proyecto}= request.body; //le paso por el body el id del proyecto
    const existeProyecto = await Proyecto.findById(proyecto)
    if (!existeProyecto){
        const error = new Error("No existe ese proyecto")
        return response.status(404).json({message: error.message})
    }
    if (existeProyecto.creador.toString() !== request.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para añadir tareas")
        return response.status(403).json({message: error.message})
    }
    try {
        const tareaAlmacenada = await Tarea.create(request.body)
        //Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        response.json(tareaAlmacenada)
    }catch (error){
        console.log(error)
    }
}
const obtenerTarea = async (request, response) => {
    const {id}=request.params;

    const tarea = await Tarea.findById(id).populate("proyecto")// el populate es para buscar datos dentro de la tabla
        //esta consulta es como un "select * from tarea where id = id, group by proyecto"
    if (!tarea) {
        const error = new Error("No existe la tarea")
        return response.status(404).json({message: error.message})
    }

    //si trato de ver una tarea que no he creado, me causa un error
    if(tarea.proyecto.creador.toString() !== request.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return response.status(403).json({message: error.message})
    }
    response.json(tarea)
}
const actualizarTarea = async (request, response) => {
    const {id}=request.params;
    const tarea = await Tarea.findById(id).populate("proyecto")// el populate es para buscar datos dentro de la tabla
    if (!tarea) {
        const error = new Error("No existe la tarea")
        return response.status(404).json({message: error.message})
    }
    if(tarea.proyecto.creador.toString() !== request.usuario._id.toString()) {
        const error = new Error("Acción no válida")
        return response.status(403).json({message: error.message})
    }
    tarea.nombre= request.body.nombre || tarea.nombre;
    tarea.descripcion= request.body.descripcion || tarea.descripcion;
    tarea.prioridad= request.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega= request.body.fechaEntrega || tarea.fechaEntrega;

    try {
        const tareaAlmacenada = await tarea.save();
        response.json(tareaAlmacenada);
    }catch (error){
        console.log(error)
    }
}

const eliminarTarea = async (request, response) => {
    const {id} = request.params;

    const tarea = await Tarea.findById(id).populate("proyecto")

    if (!tarea){
        const error = new Error("Tarea no encontrado");
        return response.status(404).json({msg: error.message})
    }
    //si el id de creador que tiene el proyecto no es el mismo que el que tiene un usuario, devuelve un 404
    if (tarea.proyecto.creador.toString() !== request.usuario._id.toString()){
        const error = new Error("Acción no válida");
        return response.status(403).json({msg: error.message})
    }
    try{
        const proyecto = await Proyecto.findById(tarea.proyecto);//obtenemos el proyecto asociado a la tarea
        proyecto.tareas.pull(tarea._id)

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        response.json({msg: "Tarea eliminada correctamente"})
    }catch (error){
        console.log(error)
    }
}
const cambiarEstado = async (request, response) => {
    const {id} = request.params;

    const tarea = await Tarea.findById(id).populate("proyecto")

    if (!tarea){
        const error = new Error("Tarea no encontrado");
        return response.status(404).json({msg: error.message})
    }
    //solo el administrador o los colaboradores pueden modificar una tarea
    if (tarea.proyecto.creador.toString() !== request.usuario._id.toString()  &&
    !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === request.usuario._id.toString())) {
        const error = new Error("Acción no válida");
        return response.status(403).json({msg: error.message})
    }
    tarea.estado =!tarea.estado;
    tarea.completado=request.usuario._id;//la tarea tiene asociado en el campo completado el usuario.
    await tarea.save();
    //requests.usuario._id es el id del usuario autenticado
    //devolvemos la tarea ya actualizada

    const tareaAlmacenada = await Tarea.findById(id)
        .populate("proyecto")
        .populate("completado")

    response.json(tareaAlmacenada)//devuelvo la tarea con la última información que se ha guardado en ella
}
export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}