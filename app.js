// external libararies and modules
const express = require("express");
const env = require("dotenv").config();
const path = require("path");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const ejsMate = require("ejs-mate");
const flash = require("connect-flash");
const nocache = require("nocache");
const passport = require("./config/passport.js")
const morgan = require("morgan")

const app = express();

// other files
const db = require("./config/db.js")

// routers
const userRouter = require("./routes/userRouter.js");
const adminRouter = require("./routes/adminRouter.js")
const profileRouter = require("./routes/profileRouter.js");
// mongodb connection activation
db();

const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_ATLAS_URI,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret:process.env.SESSION_SECRET
    }
});

store.on("error", function(error){
    console.log("Mongo session store error",error.message)
})
// middlewares
app.use(nocache());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"))
app.use(flash());
// Session configuration
app.use(session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,  
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.set('trust proxy', 1);

app.use(flash());


app.use(morgan("tiny"));
app.use(passport.initialize());
app.use(passport.session());

// custom middlewares
app.use((req, res, next) => {
    const successMessages = req.flash("success");
    res.locals.success = successMessages.length > 0 ? successMessages[0] : undefined;

    const errorMessage = req.flash("error");
    res.locals.error = errorMessage.length > 0 ? errorMessage[0] : undefined;
    next();
});
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    res.locals.admin = req.session.admin || null
    next();
});

// app settings
app.engine('ejs', ejsMate)
app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "views/user"),
    path.join(__dirname, "views/admin"),
    path.join(__dirname, "views/layouts"),
    path.join(__dirname, "views/profile"),
]);
app.use(express.static(path.join(__dirname, 'public')))

// routers
app.use("/", userRouter);
app.use("/admin", adminRouter)
app.use("/profile", profileRouter)

app.all(/(.*)/, (req, res, next) => {
    res.render("page-404")
    next()
})


app.listen(process.env.PORT, () => console.log("server is running"));
module.exports = app;