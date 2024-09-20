const AppError = require("./../utils/appError");
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    console.log(value);
    const message = `Duplicate field value: x. Please use another value.`;

    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    
    return new AppError(message, 400);
}

const handleJWTTokenError = () => new AppError('Invalid token. Login again!', 401);

const handleJWTTokenExpiration = () => new AppError('Your token has been expired. Login again!', 401);

const sendErrorDev = (res, err) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (res, err) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.log("ERROR 🔥", err);

        res.status(500).json({
            status: 'error',
            message: "Something went wrong."
        });
    }
}

module.exports = (err, req, res, next) => {
    console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(res, err);
    } else if(process.env.NODE_ENV === "production") {
        let error = {...err};

        if (error.name === "CastError") {
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        
        if (error.name === "ValidationError") {
            error = handleValidationErrorDB(error);
        }

        if (error.name === "JsonWebTokenError") {
            error = handleJWTTokenError();
        } 

        if (error.name === "TokenExpiredError") {
            error = handleJWTTokenExpiration();
        } 

        sendErrorProd(res, error);
    }

    next();
}