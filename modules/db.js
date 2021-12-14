const { DATABASE, DB_USERNAME, DB_PASSWORD } = require("../secrets.json");
const psql = require("spiced-pg");

const db = psql(
    `postgres:${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/${DATABASE}`
);

console.log(`[db] connecting to: ${DATABASE}`);

function getSigners(city) {
    const params = city ? [city] : null;
    let q = `SELECT users.first, users.last, p.age, p.city, p.url FROM users 
        LEFT JOIN signatures 
        ON users.id = signatures.user_id
        JOIN user_profiles AS p
        ON users.id = p.user_id`;
    if (params) {
        q += ` WHERE LOWER(p.city) = LOWER($1)`;
    }
    return db.query(q, params);
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

function addProfile(userId, age, city, url) {
    const q = `INSERT INTO user_profiles (user_id, age, city, url)
            VALUES ($1, $2, $3, $4)`;
    const params = [userId, age, city, url];
    return db.query(q, params);
}

function getUser(email) {
    const q = `SELECT users.id AS id, users.password, signatures.id AS signature_id, signatures.signature
                FROM users LEFT JOIN signatures ON users.id = signatures.user_id
                WHERE users.email = $1`;
    const params = [email];
    return db.query(q, params);
}

module.exports = {
    getSigners,
    getNumberOfSignatures,
    getSignature,
    addSignature,
    addProfile,
    addUser,
    getUser,
};
