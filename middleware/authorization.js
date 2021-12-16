function requireLoggedInUser(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/login");
    } else {
        next();
    }
}

function requireLoggedOutUser(req, res, next) {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
}

module.exports = {
    requireLoggedInUser,
    requireLoggedOutUser,
};
