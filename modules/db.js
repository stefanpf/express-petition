const { DATABASE, DB_USERNAME, DB_PASSWORD } = require("../secrets.json");
const psql = require("spiced-pg");

const db = psql(
    `postgres:${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/${DATABASE}`
);

console.log(`[db] connecting to: ${DATABASE}`);

function getSigners() {
    return db.query(
        "SELECT users.first, users.last FROM users INNER JOIN signatures ON users.id = signatures.user_id"
    );
}

function getNumberOfSignatures() {
    return db.query("SELECT COUNT(*) FROM signatures");
}

function getSignatureIdByUserId(userId) {
    const q = `SELECT id FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
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

function getUser(email) {
    const q = `SELECT id, password FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
}

module.exports = {
    getSigners,
    getNumberOfSignatures,
    getSignature,
    getSignatureIdByUserId,
    addSignature,
    addUser,
    getUser,
};
