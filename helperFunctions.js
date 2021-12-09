function logUrl(req, res, next) {
    console.log(`${req.method}\t${req.url}`);
    next();
}

module.exports.logUrl = logUrl;
