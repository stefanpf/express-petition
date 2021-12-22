function requireLoggedInUser(req, res, next) {
    if (req.path == "/") return next();

    if (!req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
}

function requireHasSigned(req, res, next) {
    if (!req.hasSigned) {
        res.redirect("/petition");
    } else {
        next();
    }
}

module.exports = {
    requireLoggedInUser,
    requireHasSigned,
};
