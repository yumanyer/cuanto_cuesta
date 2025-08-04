    import express from "express"
    import { MatterRaw } from "../models/matterRaw.models.js"
    import { userMiddleware } from "../Middleware/user.middleware.js"
import { MatterRawControllers } from "../controllers/matterRaw.controllers.js"

    const MatterRawRouter = express.Router()

    MatterRawRouter.post("/create",userMiddleware,MatterRawControllers)

    export default MatterRawRouter