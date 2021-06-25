if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const app = express();
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const passport = require('passport')
const ExpressError = require('./utils/ExpressError')
const localStrategy = require('passport-local')
const User = require('./models/users')
const session = require('express-session')
const flash = require('connect-flash')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const MongoStore = require('connect-mongo')

// DATABASE
const dataStore = process.env.DB_URL || 'mongodb://localhost:27017/church-app';
    // 'mongodb://localhost:27017/church-app'
mongoose.connect(dataStore,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false

    })
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"))
db.once('open', () => {
    console.log("Database is Connected!!!")

})
// routes
const indexRoutes = require('./routes/index')
const userRoutes = require('./routes/user')
const staticRoutes = require('./routes/static')
const sermonRoutes = require('./routes/sermon')
const reviewRoutes = require('./routes/reviews')
const parishRoutes = require('./routes/parish')
const testimonyRoutes = require('./routes/testimony')
const eventsRoutes = require('./routes/events')
const searchRoutes = require('./routes/search')

// APP CONFIG
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: dataStore,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});
store.on("error", function (e) {
    console.log("Session Store Error", e)

})
const sessionConfig = {
    store,
    name: 'chukseva',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7

    }

}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://fonts.googleapis.com/css",
    "https://use.fontawesome.com/",
    "https://fonts.gstatic.com/s/dosis/v19/HhyaU5sn9vOmLzlnC_W6EQ.woff2"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = ["fontawesome-webfont.eot",
    "fontawesome-webfont.svg",
    "fontawesome-webfont.ttf",
    "fontawesome-webfont.woff",
    "fontawesome-webfont.woff2",
    "FontAwesome.otf",
    "glyphicons-halflings-regular.eot",
    "glyphicons-halflings-regular.svg",
    "glyphicons-halflings-regular.ttf",
    "glyphicons-halflings-regular.woff",
    "glyphicons-halflings-regular.woff2",
    "https://fonts.googleapis.com/css",
    "https://fonts.gstatic.com/s/"

];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ihezurumba/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);





// Passport config
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

app.use('/', indexRoutes)
app.use('/', userRoutes)
app.use('/about', staticRoutes)
app.use('/sermons', sermonRoutes)
app.use('/sermons/:id', reviewRoutes)
app.use('/parish', parishRoutes)
app.use('/testimony', testimonyRoutes)
app.use('/events', eventsRoutes)
// app.use('/search', searchRoutes)

app.all('*', (req, res, next) => {
    req.flash('error', 'Page Not Found')
    res.redirect('/')
    // next(new ExpressError('Page Not Found', 404))
    next()

})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Oh no, something went wrong'
    res.status(statusCode).render('error', { err })

})

// SERVER CONFIG
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Church App is running on 3000')
})