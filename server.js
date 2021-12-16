const express = require("express");
const cookieSession = require("cookie-session");
const helmet = require("helmet");
const { engine } = require("express-handlebars");
const { logUrl } = require("./utils/helper-functions");
const authRouter = require("./routers/auth-router");
const profileRouter = require("./routers/profile-router");
const petitionRouter = require("./routers/petition-router");
const app = express();
const PORT = 8080;

// TEMPLATING ENGINE
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// MIDDLEWARE
if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}
app.use(logUrl);
app.use(express.urlencoded());
app.use(
    cookieSession({
        secret:
            process.env.SESSION_SECRET ||
            require("./secrets").COOKIE_SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});
app.use(express.static("./public"));
app.use(helmet());

// ROUTES
app.use(authRouter);
app.use(profileRouter);
app.use(petitionRouter);

if (require.main == module) {
    app.listen(
        process.env.PORT || PORT,
        console.log(`Petition server listening on port ${PORT}`)
    );
}

module.exports.app = app;
