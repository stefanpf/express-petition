let DATABASE, DB_USERNAME, DB_PASSWORD;
if (!(process.env.NODE_ENV == "production")) {
    DATABASE = require("../secrets").DATABASE;
    DB_USERNAME = require("../secrets").DB_USERNAME;
    DB_PASSWORD = require("../secrets").DB_PASSWORD;
}

const psql = require("spiced-pg");

const db = psql(
    process.env.DATABASE_URL ||
        `postgres:${DB_USERNAME}:${DB_PASSWORD}@localhost:5432/${DATABASE}`
);

console.log(`[db] connecting to: ${DATABASE}`);

function getSigners(city) {
    const params = city ? [city] : null;
    let q = `SELECT users.first, users.last, p.age, p.city, p.url FROM users 
        LEFT JOIN signatures 
        ON users.id = signatures.user_id
        LEFT JOIN user_profiles AS p
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
    const params = [userId, age || null, city, url];
    return db.query(q, params);
}

function getUserByEmail(email) {
    const q = `SELECT users.id AS id, users.password, signatures.id AS signature_id, signatures.signature
                FROM users LEFT JOIN signatures ON users.id = signatures.user_id
                WHERE users.email = $1`;
    const params = [email];
    return db.query(q, params);
}

function getUserProfile(userId) {
    const q = `SELECT u.first, u.last, u.email, p.age, p.city, p.url 
            FROM users AS u LEFT JOIN user_profiles AS p
            ON u.id = p.user_id
            WHERE u.id = $1`;
    const params = [userId];
    return db.query(q, params);
}

function updateUserWithPassword(userId, first, last, email, password) {
    const q = `UPDATE users
            SET first = $1, last = $2, email = $3, password = $4
            WHERE id = $5`;
    const params = [first, last, email, password, userId];
    return db.query(q, params);
}

function updateUserWithoutPassword(userId, first, last, email) {
    const q = `UPDATE users
            SET first = $1, last = $2, email = $3
            WHERE id = $4`;
    const params = [first, last, email, userId];
    return db.query(q, params);
}

function updateUserProfile(userId, age, city, url) {
    const q = `INSERT INTO user_profiles (user_id, age, city, url)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id)
            DO UPDATE SET age = $2, city = $3, url = $4`;
    const params = [userId, age || null, city, url];
    return db.query(q, params);
}

function deleteSignature(userId) {
    const q = `DELETE FROM signatures WHERE user_id = $1`;
    const params = [userId];
    return db.query(q, params);
}

function deleteAccount(userId) {
    const q = `DELETE FROM users WHERE id = $1`;
    const params = [userId];
    return db.query(q, params);
}

module.exports = {
    getSigners,
    getNumberOfSignatures,
    getSignature,
    addSignature,
    addProfile,
    addUser,
    getUserByEmail,
    getUserProfile,
    updateUserWithPassword,
    updateUserWithoutPassword,
    updateUserProfile,
    deleteSignature,
    deleteAccount,
};
