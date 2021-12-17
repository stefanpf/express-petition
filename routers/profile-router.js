const express = require("express");
const profileRouter = express.Router();
const db = require("../utils/db");
const { requireLoggedInUser } = require("../middleware/authorization");
const { hash } = require("../utils/bc");
const { checkValidEmail } = require("../utils/helper-functions");

profileRouter.use(requireLoggedInUser);

profileRouter
    .route("/profile")
    .get((req, res) => res.render("profile", { title: "Add some info" }))
    .post((req, res) => {
        let { age, city, url } = req.body;
        const userId = req.session.userId;
        if (!age && !city && !url) {
            res.redirect("/petition");
        } else {
            db.addProfile(userId, age, city, url)
                .then(() => {
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("Err in addProfile:", err);
                    res.render("profile", {
                        profileError: true,
                        title: "Add some info",
                    });
                });
        }
    });

profileRouter
    .route("/profile/edit")
    .get((req, res) => {
        const { userId } = req.session;
        db.getUserProfile(userId)
            .then(({ rows }) => {
                const { first, last, email, age, city, url } = rows[0];
                res.render("edit-profile", {
                    first,
                    last,
                    email,
                    age,
                    city,
                    url,
                    title: "Edit your profile",
                });
            })
            .catch((err) => {
                console.log("Err in getUserProfile:", err);
                res.render("edit-profile", {
                    editProfileError: true,
                    title: "Edit your profile",
                });
            });
    })
    .post((req, res) => {
        const { userId } = req.session;
        const { first, last, email, password, age, city, url } = req.body;
        if (checkValidEmail(email)) {
            if (!password) {
                db.updateUserWithoutPassword(
                    userId,
                    first.trim(),
                    last.trim(),
                    email.toLowerCase().trim()
                )
                    .then(() => {
                        return db.updateUserProfile(
                            userId,
                            age.trim(),
                            city.trim(),
                            url.trim()
                        );
                    })
                    .then(() => {
                        res.redirect("/thanks");
                    })
                    .catch((err) => {
                        console.log("Err in updateUserWithoutPassword:", err);
                        res.render("edit-profile", {
                            editProfileError: true,
                            first,
                            last,
                            email,
                            password,
                            age,
                            city,
                            url,
                            title: "Edit your profile",
                        });
                    });
            } else {
                hash(password)
                    .then((hashedPassword) => {
                        return db.updateUserWithPassword(
                            userId,
                            first.trim(),
                            last.trim(),
                            email.toLowerCase().trim(),
                            hashedPassword
                        );
                    })
                    .catch((err) => {
                        console.log("Err in updateUserWithPassword:", err);
                        res.render("edit-profile", {
                            editProfileError: true,
                            first,
                            last,
                            email,
                            password,
                            age,
                            city,
                            url,
                            title: "Edit your profile",
                        });
                    })
                    .then(() => {
                        return db.updateUserProfile(
                            userId,
                            age.trim(),
                            city.trim(),
                            url.trim()
                        );
                    })
                    .then(() => {
                        res.redirect("/thanks");
                    })
                    .catch((err) => {
                        console.log("Err in updateUserProfile:", err);
                        res.render("edit-profile", {
                            editProfileError: true,
                            first,
                            last,
                            email,
                            password,
                            age,
                            city,
                            url,
                            title: "Edit your profile",
                        });
                    });
            }
        } else {
            res.render("edit-profile", {
                editProfileError: true,
                title: "Edit your profile",
            });
        }
    });

profileRouter.post("/delete-account", (req, res) => {
    db.deleteAccount(req.session.userId)
        .then(() => {
            req.session = null;
            res.redirect("/login");
        })
        .catch((err) => {
            console.log("Err in deleteAccount:", err);
            res.render("edit-profile", {
                editProfileError: true,
            });
        });
});

module.exports = profileRouter;
