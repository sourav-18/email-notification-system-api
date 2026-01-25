exports.success=({message, data})=> {
    return {
        status: 'success',
        message: message,
        data: data??null
    };
}

exports.error=({message, data,})=> {
    return {
        status: 'error',
        message: message,
        data: data??null
    };
}
