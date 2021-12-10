const express = require("express");
const cookieSession = require("cookie-session");
const { engine } = require("express-handlebars");
const { logUrl } = require("./helperFunctions");
const { COOKIE_SESSION_SECRET } = require("./secrets.json");
const db = require("./db");
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
        const { firstName, lastName, signature } = req.body;
        db.addSignature(firstName, lastName, signature)
            .then(() => {
                req.session.hasSigned = true;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("Err in addSignature:", err);
                res.render("petition", { addSignatureError: true });
            });
    });

app.get("/thanks", (req, res) => {
    if (req.session.hasSigned) {
        db.getNumberOfSignatures()
            .then(({ rows }) => {
                const numberOfSignatures = rows[0].count;
                res.render("thanks", {
                    numberOfSignatures,
                });
            })
            .catch((err) => {
                console.log("Err in getNumberOfSignatures:", err);
                res.render("thanks");
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.hasSigned) {
        let signers, numberOfSignatures;

        db.getSigners()
            .then(({ rows }) => {
                signers = rows;
                return db.getNumberOfSignatures();
            })
            .catch((err) => console.log("Err in getSigners:", err))
            .then(({ rows }) => {
                numberOfSignatures = rows[0].count;
                res.render("signers", { signers, numberOfSignatures });
            })
            .catch((err) => console.log("Err in getNumberOfSignatures:", err));
    } else {
        res.redirect("/petition");
    }
});

app.listen(PORT, console.log(`Petition server listening on port ${PORT}`));
