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

function checkValidEmail(str) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        str
    );
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

module.exports = {
    logUrl,
    requireLoggedInUser,
    checkValidEmail,
    sanitizeInput,
};
