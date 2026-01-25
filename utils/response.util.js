exports.success=({message, statusCode, data})=> {
    return {
        status: 'success',
        statusCode: statusCode,
        message: message,
        data: data??null
    };
}

exports.error=({message,statusCode, data,})=> {
    return {
        status: 'error',
        statusCode: statusCode,
        message: message,
        data: data??null
    };
}
