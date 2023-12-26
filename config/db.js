import mongoose from "mongoose";
export const conectarDB = async ()=> {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        const url = `${connection.connection.host}: ${connection.connection.port}`
        console.log(`MongoDB Conectado en: ${url}`)
    }catch (error){
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}
/*
esto estaba antes, pero ahora es código deprecado
    ,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,

    }*/