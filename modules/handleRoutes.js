const db = require("./db");
const { compare, hash } = require("./bc");

function postRegister(req, res) {
    const { firstName, lastName, email, password } = req.body;
    hash(password)
        .then((hashedPassword) => {
            return db.addUser(
                firstName,
                lastName,
                email.toLowerCase(),
                hashedPassword
            );
        })
        .then(({ rows }) => {
            req.session = {
                userId: rows[0].id,
                loggedIn: true,
            };
            res.redirect("/profile");
        })
        .catch((err) => {
            console.log("Err in addUser:", err);
            res.render("register", { registrationError: true });
        });
}

function postProfile(req, res) {
    let { age, city, url } = req.body;
    const userId = req.session.userId;
    if (!age && !city && !url) {
        req.session = {
            userId,
            loggedIn: true,
        };
        res.redirect("/petition");
    } else {
        db.addProfile(userId, age, city, url)
            .then(() => {
                req.session = {
                    userId,
                    loggedIn: true,
                };
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("Err in addProfile:", err);
                res.render("profile", { profileError: true });
            });
    }
}

function postLogin(req, res) {
    const { email, password: typedPassword } = req.body;
    let userId, signatureId;
    db.getUser(email.toLowerCase())
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
                        loggedIn: true,
                    };
                    res.redirect("/thanks");
                } else {
                    req.session = {
                        userId,
                        loggedIn: true,
                    };
                }
            } else {
                throw new Error(
                    `Incorrect password attempt on /login for user ${email}`
                );
            }
        })
        // .then((passwordCorrect) => {
        //     if (passwordCorrect) {
        //         return db.getSignatureIdByUserId(userId);
        //     } else {
        //         throw new Error(
        //             `Incorrect password attempt on /login for user ${email}`
        //         );
        //     }
        // })
        // .then(({ rows }) => {
        //     if (rows.length === 0) {
        //         req.session = {
        //             userId,
        //             loggedIn: true,
        //         };
        //         res.redirect("/petition");
        //     } else {
        //         req.session = {
        //             userId,
        //             hasSigned: true,
        //             signatureId: rows[0].id,
        //             loggedIn: true,
        //         };
        //         res.redirect("/thanks");
        //     }
        // })
        .catch((err) => {
            console.log("Err in getUser:", err);
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
                loggedIn: true,
            };
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Err in addSignature:", err);
            res.render("petition", { addSignatureError: true });
        });
}

function getSigners(req, res) {
    let signers;

    db.getSigners(req.params.city)
        .then(({ rows }) => {
            signers = rows;
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

function getLogout(req, res) {
    req.session.userId = "";
    res.redirect("/");
}

module.exports = {
    postRegister,
    postProfile,
    postLogin,
    postPetition,
    getSigners,
    getThanks,
    getLogout,
};
