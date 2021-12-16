function requireLoggedInUser(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/login");
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
