const { DATABASE, DB_USERNAME, DB_PASSWORD } = require("../secrets.json");
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

function addSignature(userId, signature) {
    const q = `INSERT INTO signatures (user_id, signature) 
            VALUES ($1, $2) RETURNING id`;
    const params = [userId, signature];
    return db.query(q, params);
}

function addUser(firstName, lastName, email, hashedPw) {
    const q = `INSERT INTO users (first, last, email, password)
            VALUES ($1, $2, $3, $4) RETURNING id`;
    const params = [firstName, lastName, email, hashedPw];
    return db.query(q, params);
}

function getUser(email, password) {
    const q = `SELECT id FROM users WHERE email = $1 AND password = $2`;
    const params = [email, password];
    return db.query(q, params);
}

module.exports = {
    getSigners,
    getNumberOfSignatures,
    getSignature,
    addSignature,
    addUser,
    getUser,
};
