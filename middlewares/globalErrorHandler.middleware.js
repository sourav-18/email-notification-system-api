const CustomError=require("../errors/customError");
const responseUtil=require("../utils/response.util");

module.exports=(error,req,res,next)=>{
    if (error instanceof CustomError) {
       return res.status(error.statusCode)
           .json(responseUtil.error(
               {statusCode:error.statusCode,message:error.message}));
    }

    return res.status(500)
        .json(responseUtil.error(
            {statusCode:500,message:error.message}));
}