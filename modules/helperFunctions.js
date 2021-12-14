function logUrl(req, res, next) {
    console.log(`${req.method}\t${req.url}`);
    next();
}

function requireLoggedInUser(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/login");
    } else {
        next();
    }
}

function testValidEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
    );
}

module.exports.logUrl = logUrl;
module.exports.validEmail = testValidEmail;
module.exports.requireLoggedInUser = requireLoggedInUser;
