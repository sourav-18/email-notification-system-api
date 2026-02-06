require("fix-esm").register()
require("dotenv").config();

const express = require("express")
const cors = require("cors");
const app = express();

const envUtil = require("./utils/env.util");
const dateUtil = require("./utils/date.util");
const globalErrorHandlerMiddleware = require("./middlewares/globalErrorHandler.middleware");
const authenticationMiddleware = require("./middlewares/authentication.middleware");
const connectDB = require("./db/mongo/conn.mongo");


//external middleware use
app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH']
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (!req.body) {
        req.body = {}
    }
    next();
})

// main router initialize

async function startServer() {

    await connectDB()
    
    require("./cronJob/task.cronJob");

    app.use("/api/v1", authenticationMiddleware.checkAppId, require("./routes/main.route"));

    app.use(globalErrorHandlerMiddleware);

    app.use((req, res) => {
        res.send("hello")
    })

    app.listen(envUtil.SERVER_PORT, (err) => {
        if (!err) {
            const serverStartInfo = {
                message: "Server started",
                port: envUtil.SERVER_PORT,
                host: envUtil.SERVER_ENVIRONMENT,
                time: dateUtil.getByFormat()
            }
            console.log(serverStartInfo);
        }
    });
}

startServer();



