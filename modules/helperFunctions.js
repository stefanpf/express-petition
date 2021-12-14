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

module.exports.logUrl = logUrl;
module.exports.requireLoggedInUser = requireLoggedInUser;
