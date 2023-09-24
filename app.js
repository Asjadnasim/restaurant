const path = require('path');

const express = require('express');
const csrf = require('csurf');
const expressSession = require('express-session');

const createSessionConfig = require('./config/session');
const db = require('./data/database');
const errorHandlerMiddleware = require('./middlewares/error.handler');
const addCsrfTokenMiddlewares = require('./middlewares/csrf-token');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const protectROutesMiddleware = require('./middlewares/protect-routes');
const CartMiddleware = require('./middlewares/cart');
const updateCartPricesMiddleware = require('./middlewares/update-cart-prices');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const baseRoutes = require('./routes/base.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use('/products/assets', express.static('product-data'));
app.use(express.urlencoded({ external: false }));
app.use(express.json());

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf());

app.use(CartMiddleware);
app.use(updateCartPricesMiddleware);

app.use(addCsrfTokenMiddlewares);
app.use(checkAuthStatusMiddleware);

app.use(baseRoutes);
app.use(authRoutes);
app.use(productRoutes);
app.use('/cart', cartRoutes);
app.use(protectROutesMiddleware);
app.use('/orders', ordersRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(() => {
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });
