const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.error('🔥 Hata yakalandı:', err);

    // MongoDB CastError (Geçersiz ObjectId)
    if (err.name === 'CastError') {
        const message = 'Geçersiz ID formatı';
        error = { message, statusCode: 400 };
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Bu ${field} zaten kullanımda`;
        error = { message, statusCode: 400 };
    }

    // MongoDB Connection Error
    if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
        const message = 'Veritabanı bağlantı hatası';
        error = { message, statusCode: 500 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Sunucu hatası oluştu',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`${req.originalUrl} endpoint'i bulunamadı`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };