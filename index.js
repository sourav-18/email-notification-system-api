require("dotenv").config();
require("./db/mongo/conn.mongo");

const express = require("express")
const cors = require("cors");
const app = express();

const envUtil = require("./utils/env.util");
const dateUtil = require("./utils/date.util");
const globalErrorHandlerMiddleware = require("./middlewares/globalErrorHandler.middleware");
const authenticationMiddleware = require("./middlewares/authentication.middleware");

require("./cronJob/task.cronJob");

//external middleware use
app.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'app-id','secret-key'],
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// main router initialize
app.use("/api/v1", authenticationMiddleware.checkAppId, require("./routes/main.route"));

app.use(globalErrorHandlerMiddleware);



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
