const supertest = require("supertest");
const { app } = require("../server");
const cookieSession = require("cookie-session");
const {
    addSignature,
    getNumberOfSignatures,
    getSignature,
    getSigners,
} = require("../utils/db");

jest.mock("../utils/db.js");

test("GET / redirects to /petition when logged in", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app).get("/").expect(302).expect("location", "/petition");
});

test("GET / redirects to /login when not logged in", () => {
    return supertest(app).get("/").expect(302).expect("location", "/login");
});

test("GET /petition redirects to /login when not logged in", () => {
    return supertest(app)
        .get("/petition")
        .expect(302)
        .expect("location", "/login");
});

test("GET /petition functional when logged in and hasn't signed", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app).get("/petition").expect(200);
});

test("GET /petition redirects to /thanks when logged in and has signed", () => {
    cookieSession.mockSessionOnce({ userId: 1, hasSigned: true });
    return supertest(app)
        .get("/petition")
        .expect(302)
        .expect("location", "/thanks");
});

test("POST /petition succeeds with good input", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    addSignature.mockResolvedValueOnce({
        rows: [{ id: 1 }],
    });
    return supertest(app)
        .post("/petition")
        .expect(302)
        .expect("location", "/thanks");
});

test("POST /petition fails with bad input", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app)
        .post("/petition")
        .send("signature=")
        .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.text).toContain("Uh oh, there was a problem");
        });
});

test("GET /thanks functional when logged in and has signed", () => {
    cookieSession.mockSessionOnce({ userId: 1, hasSigned: true });
    getNumberOfSignatures.mockResolvedValueOnce({
        rows: [{ count: 1 }],
    });
    getSignature.mockResolvedValueOnce({
        rows: [{ signature: "test" }],
    });
    return supertest(app).get("/thanks").expect(200);
});

test("GET /thanks redirects to /petition when logged in and hasn't signed", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app)
        .get("/thanks")
        .expect(302)
        .expect("location", "/petition");
});

test("GET /thanks redirects to /login when not logged in", () => {
    return supertest(app)
        .get("/thanks")
        .expect(302)
        .expect("location", "/login");
});

test("GET /signers functional when logged in and has signed", () => {
    cookieSession.mockSessionOnce({ userId: 1, hasSigned: true });
    getNumberOfSignatures.mockResolvedValueOnce({
        rows: [{ count: 1 }],
    });
    getSigners.mockResolvedValueOnce({
        rows: [
            { first: "a", last: "b" },
            { first: "a", last: "b" },
        ],
    });
    return supertest(app).get("/signers").expect(200);
});

test("GET /signers redirects to /petition when logged in and hasn't signed", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app)
        .get("/signers")
        .expect(302)
        .expect("location", "/petition");
});

test("GET /signers redirects to /login when not logged in", () => {
    return supertest(app)
        .get("/signers")
        .expect(302)
        .expect("location", "/login");
});
