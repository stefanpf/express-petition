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

function sanitizeInput(obj) {
    let newObj = obj;
    if (newObj.age === "") {
        newObj.age = null;
    }
    if (newObj.city === "") {
        newObj.city = null;
    }
    return newObj;
}

module.exports.sanitizeInput = sanitizeInput;
module.exports.logUrl = logUrl;
module.exports.requireLoggedInUser = requireLoggedInUser;
