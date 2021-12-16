const express = require("express");
const petitionRouter = express.Router();
const db = require("../utils/db");
const { requireLoggedInUser } = require("../middleware/authorization");

petitionRouter.use(requireLoggedInUser);

petitionRouter
    .route("/petition")
    .get((req, res) => {
        if (req.session.hasSigned) {
            res.redirect("/thanks");
        } else {
            res.render("petition");
        }
    })
    .post((req, res) => {
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
                res.render("petition", { addSignatureError: true });
            });
    });

petitionRouter.get("/thanks", (req, res) => {
    if (req.session.hasSigned) {
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
    } else {
        res.redirect("/petition");
    }
});

petitionRouter.get("/signers", (req, res) => {
    if (req.session.hasSigned) {
        getSigners(req, res);
    } else {
        res.redirect("/petition");
    }
});

petitionRouter.get("/signers/:city", (req, res) => {
    if (req.session.hasSigned) {
        getSigners(req, res);
    } else {
        res.redirect("/petition");
    }
});

petitionRouter.post("/delete-signature", (req, res) => {
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
});

petitionRouter.get("/", (req, res) => {
    res.redirect("/petition");
});

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
            });
        })
        .catch((err) => console.log("Err in getNumberOfSignatures:", err));
}

module.exports = petitionRouter;