function logUrl(req, res, next) {
    console.log(`${req.method}\t${req.url}`);
    next();
}

function checkValidEmail(str) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        str
    );
}

module.exports = {
    logUrl,
    checkValidEmail,
};
