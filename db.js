const { DATABASE, DB_USERNAME, DB_PASSWORD } = require("./secrets.json");
const psql = require("spiced-pg");

const db = psql(
    `postgres:${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/${DATABASE}`
);

console.log(`[db] connecting to: ${DATABASE}`);

module.exports.getSigners = () => {
    return db.query("SELECT first, last FROM signatures");
};

module.exports.getNumberOfSignatures = () => {
    return db.query("SELECT COUNT(*) FROM signatures");
};

module.exports.addSignature = (firstName, lastName, signature) => {
    const q = `INSERT INTO signatures (first, last, signature) 
            VALUES ($1, $2, $3)`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);
};
