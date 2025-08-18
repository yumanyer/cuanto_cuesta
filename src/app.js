import express from "express"
import path from "path"
import { dataBase } from "./config/connectDB.config.js"
import {config} from "./config/env.config.js"
import userRoutes from "./routes/user.routes.js"
import matterRouter from "./routes/matterRaw.routes.js"
import getDirname from "../dirname.js"
import { logRequest } from "./middleware/logs.middleware.js"

// CONFIG SERVER
const app = express()
const PORT = process.env.PORT || config.port 
const publicPath = path.join(getDirname(), '../frontend/public')

// config de winston
app.use(logRequest)

// config de express
app.use(express.json() )
app.use(express.urlencoded({ extended: true }))

// CONFIG DE FRONT 
app.use(express.static(publicPath))

 // CONEXION A LA postgreSQL
dataBase.query("SELECT NOW()")
.then(()=>{
    console.log("Base de datos conectada")
    InitApp()
})
.catch((error)=>{
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
})
 
async function InitApp(){
    try {

       
        
        app.use("/api/users",userRoutes)
        app.use("/api/matterRaw",matterRouter)


        app.get("/",(req,res)=>{
            res.sendFile(path.join(publicPath,"home.html"))
        })

         // UNA VEZ CONECTADA LA DB INICIO LA APP
        app.listen(config.port, ()=>{
        console.log(`Escuchando a http://localhost:${config.port} ` )})

    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1);
    }
}