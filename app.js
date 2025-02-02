const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
require('express-async-errors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

// routes
const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const orderRoute = require('./routes/orderRoutes');
const uploadRoute = require('./routes/uploadRoutes');

// utils
const {
    unknownEndPointHandler,
    errorHandler,
} = require('./utils/errorHandler.js');
const limiter = require('./utils/rateLimiter');

const app = express();

/**
 * parse application/json
 * limit req size to 5kb
 */
app.use(express.json({ limit: '5kb' }));

// no-sql prevention
app.use(mongoSanitize());

// logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// use secure headers
app.use(helmet());

//  apply to all requests
app.use(limiter);

// compress all responses
app.use(compression());

app.use('/api/user', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/upload', uploadRoute);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// if (process.env.NODE_ENV === 'production') {
app.use(express.static(path.join(__dirname, './build')));
// }

app.use(unknownEndPointHandler);
app.use(errorHandler);

module.exports = app;
