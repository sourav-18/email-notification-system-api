const envUtil=require("../../utils/env.util");

const mongoose=require("mongoose");

const conn=mongoose.createConnection(envUtil.MONGODB_URL);

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', () => {
    console.log('mongodb connected successfully at : '+envUtil.MONGODB_URL);
});

module.exports = conn;