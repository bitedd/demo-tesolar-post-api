const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

// Route files
const packages = require('./routes/packages');
const packageEvents = require('./routes/packageEvents');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
// https://blog.websecurify.com/2014/08/hacking-nodejs-and-mongodb.html
// mongosanitize middleware를 이용하지 않으면, login시도시에 email에 "email": {"$gt": ""} 처럼 입력시에 로그인처리가 되어버림.
app.use(mongoSanitize());

// Set security headers
// Add header such as ...
// X-DNS-Prefetch-Control
// X-Content-Type-Options
app.use(helmet());

// Prevent XSS(cross site scripting) attacks
// Body의 JSON Value에 실제 데이터말고, <script>alert(1)</script>와 같은 스크립트를 넣고, 이것이브라우저에서 사용되는 것을 방지
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
// query parameter에 search?firstname=John&firstname=John 처럼 복수개를 일부러 넣는 경우가 있는데, 이것을 마지막 것으로만 처리하도록 하는 패키지
app.use(hpp());

// Enable CORS
// 다른 도메인,프로토콜사이에서 통신이 가능해짐.
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/packages', packages);
app.use('/api/v1/packageevents', packageEvents);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
