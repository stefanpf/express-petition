const express = require("express");
const cookieSession = require("cookie-session");
const helmet = require("helmet");
const { engine } = require("express-handlebars");
const { logUrl, requireLoggedInUser } = require("./modules/helperFunctions");
const { COOKIE_SESSION_SECRET } = require("./secrets.json");
const routes = require("./modules/handleRoutes");
const app = express();
const PORT = 8080;

// TEMPLATING ENGINE
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// MIDDLEWARE
app.use(logUrl);
app.use(express.urlencoded());
app.use(
    cookieSession({
        secret: COOKIE_SESSION_SECRET,
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
app.get("/", requireLoggedInUser, (req, res) => {
    res.redirect("/petition");
});

app.route("/register")
    .get((req, res) => res.render("register"))
    .post((req, res) => routes.postRegister(req, res));

app.route("/profile")
    .get(requireLoggedInUser, (req, res) => res.render("profile"))
    .post((req, res) => routes.postProfile(req, res));

app.route("/login")
    .get((req, res) => res.render("login"))
    .post((req, res) => routes.postLogin(req, res));

app.route("/petition")
    .get(requireLoggedInUser, (req, res) => {
        if (req.session.hasSigned) {
            res.redirect("/thanks");
        } else {
            res.render("petition");
        }
    })
    .post((req, res) => routes.postPetition(req, res));

app.get("/thanks", requireLoggedInUser, (req, res) => {
    if (req.session.hasSigned) {
        routes.getThanks(req, res);
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", requireLoggedInUser, (req, res) => {
    if (req.session.hasSigned) {
        routes.getSigners(req, res);
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers/:city", requireLoggedInUser, (req, res) => {
    if (req.session.hasSigned) {
        routes.getSigners(req, res);
    } else {
        res.redirect("/petition");
    }
});

app.get("/logout", requireLoggedInUser, (req, res) => {
    routes.getLogout(req, res);
});

app.listen(
    process.env.PORT || PORT,
    console.log(`Petition server listening on port ${PORT}`)
);
