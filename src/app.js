//IMPORTS
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
//DB
import { dataBase } from "./config/connectDB.config.js"
//VARIABLES
import {config} from "./config/env.config.js"
//RUTAS
import userRoutes from "./routes/user.routes.js"
import matterRouter from "./routes/matterRaw.routes.js"
import RecetasRouter from "./routes/recetas.routes.js"
import IngredienteRouter from "./routes/ingrediente.routes.js"
// DIRNAME => OBTIENE LA RUTA DEL DIRECTORIO 
import getDirname from "../dirname.js"
//MIDDLEWARE
import { logRequest } from "./middleware/app/logs.middleware.js"
import { requireAuth } from "./middleware/auth/requireAuth.middleware.js"
// CONFIG SERVER
const app = express()
const PORT = process.env.PORT || config.port 
const privatePath = path.join(getDirname(), '../frontend/private')
const publicPath = path.join(getDirname(), '../frontend/public')
app.use(express.static(path.join(getDirname(), 'public')));

// config de winston
app.use(logRequest)

// config de express
app.use(express.json() )
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// CONFIG DE FRONT 
app.use(express.static(publicPath))


 // CONEXION A LA postgreSQL
dataBase.query("SELECT NOW()")
.then(()=>{
    console.log("Base de datos conectada")
    console.time("Conexión a la base de datos")
    InitApp()
    console.timeEnd("Conexión a la base de datos")
})
.catch((error)=>{
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
})
 
async function InitApp(){
    try {

       
        
        app.use("/api/users",userRoutes)
        app.use("/api/matterRaw",matterRouter)
        app.use("/api/recetas", RecetasRouter)
        app.use("/api/ingrediente", IngredienteRouter)

        //protego la ruta de cargar materia separando logica de interfaz
        app.get("/matterRaw", requireAuth(["Pastelero","Admin"]), (req,res)=>{
            res.sendFile(path.join(privatePath,"/matterRaw.html"))
        })
        app.get("/",(req,res)=>{
            res.sendFile(path.join(publicPath,"home.html"))
        })
         // UNA VEZ CONECTADA LA DB INICIO LA APP
         //2-3 ms
         console.time("Inicio de la aplicación")
        app.listen(config.port, ()=>{
        console.log(`Escuchando a http://localhost:${config.port} ` )})
        console.timeEnd("Inicio de la aplicación")
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        process.exit(1);
    }
}