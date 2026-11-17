const isProduction = () => (process.env.NODE_ENV ?? '').toLowerCase() === 'production';

export default (err, req, res, next) => {
    if (res.headersSent) return next(err);
    const num = v => (Number.isInteger(v) && v >= 400 && v <= 599 ? v : undefined);
    const statusCode = num(err.statusCode) ?? num(err.status) ?? 500;

    if (statusCode >= 500) console.error(err);

    const body = {
        status: statusCode >= 500 ? 'error' : 'fail',
        message: statusCode >= 500 && isProduction() ? 'Something went wrong.' : err.message
    };
    if (!isProduction()) body.stack = err.stack;

    res.status(statusCode).json(body);
};
