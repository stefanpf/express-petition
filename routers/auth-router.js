const express = require("express");
const authRouter = express.Router();
const db = require("../utils/db");
const { requireLoggedInUser } = require("../middleware/authorization");
const { compare, hash } = require("../utils/bc");
const { checkValidEmail } = require("../utils/helper-functions");

authRouter
    .route("/register")
    .get((req, res) => {
        if (req.session.userId) {
            if (!req.session.hasSigned) {
                res.redirect("/petition");
            } else {
                res.redirect("/thanks");
            }
        } else {
            res.render("register", { loggedOut: true });
        }
    })
    .post((req, res) => {
        const { firstName, lastName, email, password } = req.body;
        if (checkValidEmail(email)) {
            hash(password)
                .then((hashedPassword) => {
                    return db.addUser(
                        firstName.trim(),
                        lastName.trim(),
                        email.toLowerCase().trim(),
                        hashedPassword
                    );
                })
                .then(({ rows }) => {
                    req.session = {
                        userId: rows[0].id,
                    };
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("Err in addUser:", err);
                    res.render("register", { registrationError: true });
                });
        } else {
            res.render("register", { registrationError: true });
        }
    });

authRouter
    .route("/login")
    .get((req, res) => {
        if (req.session.userId) {
            if (!req.session.hasSigned) {
                res.redirect("/petition");
            } else {
                res.redirect("/thanks");
            }
        } else {
            res.render("login", { loggedOut: true });
        }
    })
    .post((req, res) => {
        const { email, password: typedPassword } = req.body;
        let userId, signatureId;
        db.getUserByEmail(email.toLowerCase())
            .then(({ rows }) => {
                userId = rows[0].id;
                signatureId = rows[0].signature_id;
                return compare(typedPassword, rows[0].password);
            })
            .then((passwordCorrect) => {
                if (passwordCorrect) {
                    if (signatureId) {
                        req.session = {
                            userId,
                            signatureId,
                            hasSigned: true,
                        };
                        res.redirect("/thanks");
                    } else {
                        req.session = {
                            userId,
                        };
                        res.redirect("/petition");
                    }
                } else {
                    throw new Error(
                        `Incorrect password attempt on /login for user ${email}`
                    );
                }
            })
            .catch((err) => {
                console.log("Err in getUserByEmail:", err);
                res.render("login", { loggedOut: true, loginError: true });
            });
    });

authRouter.get("/logout", requireLoggedInUser, (req, res) => {
    req.session = null;
    res.redirect("/");
});

module.exports = authRouter;
