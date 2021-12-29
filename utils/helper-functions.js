const { getNumberOfSignatures } = require("./db");

function logUrl(req, res, next) {
    console.log(`${req.method}\t${req.url}`);
    next();
}

function checkValidEmail(str) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        str
    );
}

function getNumberOfSignaturesAndPercentage() {
    const GOAL_NUMBER = 30;
    let actualNumber;

    return getNumberOfSignatures()
        .then(({ rows }) => {
            actualNumber = parseInt(rows[0].count);
            return {
                GOAL_NUMBER,
                actualNumber,
                percentage: Math.round((actualNumber / GOAL_NUMBER) * 100),
            };
        })
        .catch((err) => {
            console.log("Error in getNumberOfSignatures:", err);
            actualNumber = 17;
            return {
                GOAL_NUMBER,
                actualNumber,
                percentage: Math.round((actualNumber / GOAL_NUMBER) * 100),
            };
        });
}

module.exports = {
    logUrl,
    checkValidEmail,
    getNumberOfSignaturesAndPercentage,
};
