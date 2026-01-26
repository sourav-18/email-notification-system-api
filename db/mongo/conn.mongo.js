const envUtil=require("../../utils/env.util");

const mongoose=require("mongoose");

mongoose.connect(envUtil.MONGODB_URL).then(()=>{
    console.log('mongodb connected successfully at : '+envUtil.MONGODB_URL);
}).catch((error)=>{
    console.error.bind(console, 'connection error:');
})