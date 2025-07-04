import express from "express"


const app = express()

app.get("/",(req,res)=>{
    res.send("server ON")
})

app.listen(PORT,()=>{
    console.log(`Escuchando a http://localhost:${PORT}/`)
})

