const { DATABASE, DB_USERNAME, DB_PASSWORD } = require("./secrets.json");
const psql = require("spiced-pg");

const db = psql(
    `postgres:${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/${DATABASE}`
);

console.log(`[db] connecting to: ${DATABASE}`);

function getSigners() {
    return db.query("SELECT first, last FROM signatures");
}

function getNumberOfSignatures() {
    return db.query("SELECT COUNT(*) FROM signatures");
}

function getSignature(signatureId) {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const params = [signatureId];
    return db.query(q, params);
}

function addSignature(firstName, lastName, signature) {
    const q = `INSERT INTO signatures (first, last, signature) 
            VALUES ($1, $2, $3) RETURNING id`;
    const params = [firstName, lastName, signature];
    return db.query(q, params);
}

module.exports = {
    getSigners,
    getNumberOfSignatures,
    getSignature,
    addSignature,
};
