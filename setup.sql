DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        first VARCHAR NOT NULL,
        last VARCHAR NOT NULL,
        email VARCHAR NOT NULL UNIQUE,
        password VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
       id SERIAL PRIMARY KEY,
       user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
       signature TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

CREATE TABLE user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        city VARCHAR,
        url VARCHAR
);