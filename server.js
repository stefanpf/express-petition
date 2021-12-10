const express = require("express");
const cookieSession = require("cookie-session");
const { engine } = require("express-handlebars");
const { logUrl } = require("./helperFunctions");
const { COOKIE_SESSION_SECRET } = require("./secrets.json");
const db = require("./db");
const routes = require("./handleRoutes");
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
    })
);
app.use(express.static("./public"));

// ROUTES
app.route("/").get((req, res) => {
    res.redirect("/petition");
});

app.route("/petition")
    .get((req, res) => {
        if (req.session.hasSigned) {
            res.redirect("/thanks");
        } else {
            res.render("petition");
        }
    })
    .post((req, res) => {
        routes.postPetition(req, res);
    });

app.get("/thanks", (req, res) => {
    if (req.session.hasSigned) {
        routes.getThanks(req, res);
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.hasSigned) {
        routes.getSigners(req, res);
    } else {
        res.redirect("/petition");
    }
});

app.listen(PORT, console.log(`Petition server listening on port ${PORT}`));
