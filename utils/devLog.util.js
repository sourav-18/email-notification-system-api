const { SERVER_ENVIRONMENT } = require("./env.util")

module.exports = function devLog(...data) {
    if (SERVER_ENVIRONMENT === "prod" || SERVER_ENVIRONMENT === "dev") {
        console.log(...data)
    }
}