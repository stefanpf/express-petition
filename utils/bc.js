let { genSalt, hash, compare } = require("bcryptjs");

module.exports.compare = compare;
module.exports.hash = (plainTextPw) =>
    genSalt().then((salt) => hash(plainTextPw, salt));
