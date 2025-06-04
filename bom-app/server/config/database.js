const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(` MongoDB bağlantısı başarılı: ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error(' MongoDB bağlantı hatası:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log(' MongoDB bağlantısı kesildi');
        });

    } catch (error) {
        console.error(' MongoDB bağlantı hatası:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;