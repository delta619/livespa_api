const express = require('express');

const app = express();
const customerRoute = require('./routes/customerRoute');
const appointmentRoute = require('./routes/appointmentRoute');
const adminRoute = require('./routes/adminRoute');
const publicRoutes = require('./routes/publicRoute')
const webhookRoutes = require('./routes/webhookRoute')

const Hit = require('./models/hitModel');

const globalErrorController = require('./controller/errorController');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const rawBody = require('raw-body');
const path = require('path');
// GLOBAL
const {PintDataClass} = require('./utils/PintDataClass');
app.use(morgan('dev'));
// protect
app.use(helmet());

const skipRateLimitOnHealthCheck = (req, res) => req.path === '/api/health';

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000, // MAX 100 requests in 1 hr
  message: 'Too many requests from your ip, Please try again in an hour',
});

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (skipRateLimitOnHealthCheck(req)) {
      next();
    } else {
      limiter(req, res, next);
    }
  });

  app.use('/api', limiter);
}
// BODY PARSER
// prevent NOSQL injection
app.use(mongoSanitize());

// prevent xss

app.use(xss());

// setting global cors

// if(process.env.NODE_ENV == "development"){
app.use(cors());
// }

// prevent parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// use rawBody
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl === '/webhook') {
        req.rawBody = buf.toString();
      }
    },
  })
);
app.use('/webhook', webhookRoutes)


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// fetch initial data 
const p = new PintDataClass()

app.get('/api/addHit', async (req, res) => {
  if (process.env.NODE_ENV == 'production') {
    // try {
    //   await Hit.create({
    //     hit: 1,
    //     data: JSON.stringify(req.headers),
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
  }
  return res.json({
    status: 200,
  });
});
app.use('/api/public', publicRoutes);
app.use('/api/customer', customerRoute);
app.use('/api/appointment', appointmentRoute);
app.use('/api/admin', adminRoute);


app.all('*', (req, res, next) => {
  return res.status(204).end();
});

app.use(globalErrorController);

exports.Server = app;
