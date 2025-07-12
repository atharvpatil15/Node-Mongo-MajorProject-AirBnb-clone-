// utils/ExpressError.js - Fixed version

class ExpressError extends Error {
    constructor(statusCode, message) {  // statusCode first, message second
        super(message);  // Pass message to parent Error class
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

module.exports = ExpressError;