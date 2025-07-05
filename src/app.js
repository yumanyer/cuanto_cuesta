import express from "express"
import { dataBase } from "./config/connectDB.config.js"
import config from "./config/env.config.js"




const app = express()

const PORT = process.env.PORT       


async function InitApp(){
    try {

        // ESPERO A QUE LA DB SE CONCETE
        await dataBase.query("SELECT NOW()")
        console.log("Base datos conectada")

        // UNA VEZ CONECTADA INICIO LA APP
        app.listen(config.port,()=>{
        console.log(`Escuchando a http://localhost:${config.port}/`)})


    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1);
    }
}
InitApp()




// config de express
app.use(express.json())


app.get("/",(req,res)=>{
    res.send("server ON")
})


