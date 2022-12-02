const express = require('express')
const app = express()
const passport = require('passport')
const bodyParser = require('body-parser');

require('./configs/passport');
require('dotenv').config()
const cors = require('cors')
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
let PORT;
process.env.NODE_ENV === 'production'
    ? (PORT = process.env.PROD_PORT)
    : (PORT = process.env.DEV_PORT)

// register route
const auth = require('./routes/auth')
const staff = require('./routes/staff')
const user = require('./routes/user')
const history = require('./routes/history')
const event = require('./routes/events')
const mail = require('./routes/mail')

// Set Parses JSON 
// app.use(express.json())
app.use(bodyParser.json({ extended: true}));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', cors(corsOptions), auth)
app.use('/api/staff', cors(corsOptions), passport.authenticate('jwt', { session: false }), staff)
app.use('/api/user', cors(corsOptions), passport.authenticate('jwt', { session: false }), user)
app.use('/api/history', cors(corsOptions), passport.authenticate('jwt', { session: false }), history)
app.use('/api/event', cors(corsOptions), passport.authenticate('jwt', { session: false }), event)
app.use('/api/mail', cors(corsOptions), mail)

app.get('/', (req, res) => {
    res.send('Hello World !!, ' + process.env.NODE_ENV + " mode")
})

app.use('/api/image/', express.static(__dirname + '/public/images'));
app.use('/api/infomation/', express.static(__dirname + '/public/infomations'));

// Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.status || 500
    res.status(statusCode);
    res.json({
        error: {
            status: statusCode,
            message: err.message,
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server in ${process.env.NODE_ENV} mode, listening on *:${PORT}`)
})