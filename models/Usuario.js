import mongoose from "mongoose";
import bcrypt from "bcrypt"; //dependencia para hashear los password

//información del usuario
const usuarioSchema = mongoose.Schema({
    nombre: {
        type: 'String',
        required: true,
        trim: true,
    },
    password: {
        type: 'String',
        required: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: true,
        trim: true,
        unique: true
    },
    token: {
        type: 'String'
    },
    confirmado: {
        type: 'Boolean',
        default: false
    },

}, {
    timestamps: true,
});
//pre es un middleware de bcrypt para ejecutar código "antes" de insertarlo en la bd
usuarioSchema.pre("save", async function (next){
    //estoy comprobando si la password ya está hasheado, en cuyo caso lo ignora. (Ocurre cuando hago login)
    if (!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);//mientras más rondas más seguro
    this.password = await bcrypt.hash(this.password, salt);
});

//creo una función llamada comprobarPasword para comprobar si la contraseña introducida por el usuario es correcta
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password)//comprueba un string con el password hasheado
}


const Usuario = mongoose.model("Usuario", usuarioSchema)
export default Usuario;