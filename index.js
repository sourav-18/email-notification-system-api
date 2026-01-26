require("dotenv").config();
require("./db/mongo/conn.mongo");

const express=require("express")
const app=express();

const envUtil=require("./utils/env.util");
const dateUtil=require("./utils/date.util");
const mainRouter=require("./routes/main.route");
const globalErrorHandlerMiddleware=require("./middlewares/globalErrorHandler.middleware");
require("./cronJob/task.cronJob");

//external middleware use
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// main router initialize
app.use("/api/v1",mainRouter);

app.use(globalErrorHandlerMiddleware);



app.listen(envUtil.SERVER_PORT,(err)=>{
    if(!err){
        const serverStartInfo={
            message:"Server started",
            port:envUtil.SERVER_PORT,
            host:envUtil.SERVER_ENVIRONMENT,
            time:dateUtil.getByFormat()
        }
        console.log(serverStartInfo);
    }
});
