const uuid=require("uuid").v4;

exports.getRandomId=()=>{
    return uuid().replaceAll('-','');
}