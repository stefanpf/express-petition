const express = require("express");
const authRouter = express.Router();
const db = require("../utils/db");
const { requireLoggedInUser } = require("../middleware/authorization");
const { compare, hash } = require("../utils/bc");
const {
    checkValidEmail,
    getNumberOfSignaturesAndPercentage,
} = require("../utils/helper-functions");

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
            let petitionStats;
            getNumberOfSignaturesAndPercentage()
                .then((stats) => {
                    petitionStats = stats;
                    res.render("register", {
                        loggedOut: true,
                        title: "Register",
                        ...petitionStats,
                    });
                })
                .catch((err) => {
                    console.log(
                        "Error in getNumberOfSignaturesAndPercentage:",
                        err
                    );
                    res.render("register", {
                        loggedOut: true,
                        title: "Register",
                        GOAL_NUMBER: 50,
                        actualNumber: 25,
                        percentage: 50,
                    });
                });
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
                    res.render("register", {
                        registrationError: true,
                        title: "Register",
                    });
                });
        } else {
            res.render("register", {
                registrationError: true,
                title: "Register",
            });
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
            let petitionStats;
            getNumberOfSignaturesAndPercentage()
                .then((stats) => {
                    petitionStats = stats;
                    res.render("login", {
                        loggedOut: true,
                        title: "Login",
                        ...petitionStats,
                    });
                })
                .catch((err) => {
                    console.log(
                        "Error in getNumberOfSignaturesAndPercentage:",
                        err
                    );
                    res.render("login", {
                        loggedOut: true,
                        title: "Login",
                        GOAL_NUMBER: 50,
                        actualNumber: 25,
                        percentage: 50,
                    });
                });
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
                res.render("login", {
                    loggedOut: true,
                    loginError: true,
                    title: "Login",
                });
            });
    });

authRouter.get("/logout", requireLoggedInUser, (req, res) => {
    req.session = null;
    res.redirect("/");
});

module.exports = authRouter;
