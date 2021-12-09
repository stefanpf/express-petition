const express = require("express");
const { engine } = require("express-handlebars");
const { logUrl } = require("./helperFunctions");
const cookieParser = require("cookie-parser");
const db = require("./db");
const app = express();
const PORT = 8080;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(logUrl);
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static("./public"));

app.route("/").get((req, res) => {
    res.redirect("/petition");
});

app.route("/petition")
    .get((req, res) => {
        res.render("petition");
    })
    .post((req, res) => {
        const { firstName, lastName, signature } = req.body;
        db.addSignature(firstName, lastName, signature)
            .then(() => res.redirect("/thanks"))
            .catch((err) => {
                console.log("Err in addSignature:", err);
                res.render("petition", { addSignatureError: true });
            });
    });

app.get("/thanks", (req, res) => {
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
});

app.get("/signers", (req, res) => {
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
});

app.listen(PORT, console.log(`Express server listening on port ${PORT}`));
