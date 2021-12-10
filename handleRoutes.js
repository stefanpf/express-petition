const db = require("./db");

module.exports.postPetition = function (req, res) {
    const { firstName, lastName, signature } = req.body;
    db.addSignature(firstName, lastName, signature)
        .then(({ rows }) => {
            req.session = {
                hasSigned: true,
                signatureId: rows[0].id,
            };
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("Err in addSignature:", err);
            res.render("petition", { addSignatureError: true });
        });
};

module.exports.getSigners = function (req, res) {
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
};

module.exports.getThanks = function (req, res) {
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
            });
        })
        .catch((err) => {
            console.log("Err in getSignature", err);
            res.render("thanks");
        });
};
