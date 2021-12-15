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

function getEditProfile(req, res) {}

function postEditProfile(req, res) {}

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

function getLogout(req, res) {
    req.session.userId = null;
    res.redirect("/");
}

function postDeleteSignature(req, res) {}

function postDeleteAccount(req, res) {}

module.exports = {
    postRegister,
    getEditProfile,
    postEditProfile,
    postProfile,
    postLogin,
    postPetition,
    getSigners,
    getThanks,
    getLogout,
    postDeleteSignature,
    postDeleteAccount,
};
