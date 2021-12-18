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
            res.render("petition", { title: "Add Your Voice!" });
        }
    })
    .post((req, res) => {
        const { signature } = req.body;
        const { userId } = req.session;
        if (signature === "") {
            return res.render("petition", {
                addSignatureError: true,
            });
        }
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
                res.render("petition", {
                    addSignatureError: true,
                    title: "Add Your Voice!",
                });
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
                    title: "Thank you!",
                });
            })
            .catch((err) => {
                console.log("Err in getSignature", err);
                res.render("thanks", { title: "Thank you!" });
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
            res.render("edit-profile", {
                editProfileError: true,
                title: "Edit your profile",
            });
        });
});

petitionRouter.get("/", (req, res) => {
    res.redirect("/petition");
});

function getSigners(req, res) {
    let signers;
    const location = req.params.city
        ? req.params.city.charAt(0).toUpperCase() + req.params.city.slice(1)
        : null;

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
                location,
                numberOfSignatures: rows[0].count,
                title: "Who else has signed?",
            });
        })
        .catch((err) => console.log("Err in getNumberOfSignatures:", err));
}

module.exports = petitionRouter;
