const db = require("./db");
const { compare, hash } = require("./bc");
const { checkValidEmail } = require("./helperFunctions");

function postRegister(req, res) {
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
}

function getEditProfile(req, res) {
    const { userId } = req.session;
    db.getUserProfile(userId)
        .then(({ rows }) => {
            const { first, last, email, age, city, url } = rows[0];
            res.render("edit-profile", {
                loggedIn: true,
                first,
                last,
                email,
                age,
                city,
                url,
            });
        })
        .catch((err) => {
            console.log("Err in getUserProfile:", err);
            res.render("edit-profile", {
                loggedIn: true,
                editProfileError: true,
            });
        });
}

function postEditProfile(req, res) {
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
                    req.session.userId = userId;
                    res.redirect("/profile/edit");
                })
                .catch((err) => {
                    console.log("Err in updateUserWithoutPassword:", err);
                    res.render("edit-profile", {
                        editProfileError: true,
                        loggedIn: true,
                        first,
                        last,
                        email,
                        password,
                        age,
                        city,
                        url,
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
                        loggedIn: true,
                        first,
                        last,
                        email,
                        password,
                        age,
                        city,
                        url,
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
                    req.session.userId = userId;
                    res.redirect("/profile/edit");
                })
                .catch((err) => {
                    console.log("Err in updateUserProfile:", err);
                    res.render("edit-profile", {
                        editProfileError: true,
                        loggedIn: true,
                        first,
                        last,
                        email,
                        password,
                        age,
                        city,
                        url,
                    });
                });
        }
    } else {
        res.render("edit-profile", { editProfileError: true, loggedIn: true });
    }
}

function postProfile(req, res) {
    let { age, city, url } = req.body;
    const userId = req.session.userId;
    if (!age && !city && !url) {
        req.session = {
            userId,
        };
        res.redirect("/petition");
    } else {
        db.addProfile(userId, age || null, city, url)
            .then(() => {
                req.session = {
                    userId,
                };
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("Err in addProfile:", err);
                res.render("profile", { loggedIn: true, profileError: true });
            });
    }
}

function postLogin(req, res) {
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
            res.render("login", { loginError: true });
        });
}

function postPetition(req, res) {
    const { signature } = req.body;
    const { userId } = req.session;
    db.addSignature(userId, signature)
        .then(({ rows }) => {
            req.session = {
                userId,
                hasSigned: true,
                signatureId: rows[0].id,
            };
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Err in addSignature:", err);
            res.render("petition", { loggedIn: true, addSignatureError: true });
        });
}

function getSigners(req, res) {
    let signers;

    db.getSigners(req.params.city)
        .then(({ rows }) => {
            signers = rows;
            for (let signer of signers) {
                if (signer.url && !signer.url.startsWith("http")) {
                    signer.url = "https://" + signer.url;
                }
            }
            return db.getNumberOfSignatures();
        })
        .catch((err) => console.log("Err in getSigners:", err))
        .then(({ rows }) => {
            res.render("signers", {
                signers,
                numberOfSignatures: rows[0].count,
                loggedIn: true,
            });
        })
        .catch((err) => console.log("Err in getNumberOfSignatures:", err));
}

function getThanks(req, res) {
    let numberOfSignatures;
    const { signatureId } = req.session;

    db.getNumberOfSignatures()
        .then(({ rows }) => {
            numberOfSignatures = rows[0].count;
            return db.getSignature(signatureId);
        })
        .catch((err) => console.log("Err in getNumberOfSignatures:", err))
        .then(({ rows }) => {
            res.render("thanks", {
                numberOfSignatures,
                signature: rows[0].signature,
                loggedIn: true,
            });
        })
        .catch((err) => {
            console.log("Err in getSignature", err);
            res.render("thanks");
        });
}

function postDeleteSignature(req, res) {
    const { userId } = req.session;
    db.deleteSignature(userId)
        .then(() => {
            req.session = { userId, hasSigned: null };
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("Err in deleteSignature:", err);
            res.render("edit-profile", { editProfileError: true });
        });
}

function postDeleteAccount(req, res) {
    db.deleteAccount(req.session.userId)
        .then(() => {
            req.session = null;
            res.redirect("/register");
        })
        .catch((err) => {
            console.log("Err in deleteAccount:", err);
            res.render("edit-profile", { editProfileError: true });
        });
}

module.exports = {
    postRegister,
    getEditProfile,
    postEditProfile,
    postProfile,
    postLogin,
    postPetition,
    getSigners,
    getThanks,
    postDeleteSignature,
    postDeleteAccount,
};
