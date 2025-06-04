require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const productRoutes = require('./routes/products');

const app = express();
connectDB();

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['http://localhost:3000']
        : true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(` ${req.method} ${req.path} - ${new Date().toISOString()}`);
        next();
    });
}

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'BOM API Sunucusu Çalışıyor',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            search: '/api/products/search',
            health: '/api/health'
        }
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                status: dbStatus,
                name: mongoose.connection.name
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

app.use('/api/products', productRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(' =================================');
        console.log(` BOM API Sunucusu başlatıldı`);
        console.log(` Port: ${PORT}`);
        console.log(` Ortam: ${process.env.NODE_ENV}`);
        console.log(` URL: http://localhost:${PORT}`);
        console.log(' =================================');
    });

    process.on('SIGTERM', () => {
        console.log('⚠️ SIGTERM sinyali alındı. Sunucu kapatılıyor...');
        server.close(() => {
            console.log(' Sunucu güvenli bir şekilde kapatıldı');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('⚠️ SIGINT sinyali alındı. Sunucu kapatılıyor...');
        server.close(() => {
            console.log(' Sunucu güvenli bir şekilde kapatıldı');
            process.exit(0);
        });
    });

    process.on('unhandledRejection', (err) => {
        console.error(' İşlenmeyen Promise Reddi:', err.message);
        server.close(() => {
            process.exit(1);
        });
    });

    process.on('uncaughtException', (err) => {
        console.error(' Yakalanmamış İstisna:', err.message);
        process.exit(1);
    });
};

if (require.main === module) {
    startServer();
}

module.exports = app;