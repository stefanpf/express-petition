const supertest = require("supertest");
const { app } = require("../server");
const cookieSession = require("cookie-session");

test("GET /register functional", () => {
    return supertest(app).get("/register").expect(200);
});

test("GET /register redirects to /petition if logged in but hasn't signed", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app)
        .get("/register")
        .expect(302)
        .expect("location", "/petition");
});

test("GET /register redirects to /thanks if logged in and has signed", () => {
    cookieSession.mockSessionOnce({ userId: 1, hasSigned: true });
    return supertest(app)
        .get("/register")
        .expect(302)
        .expect("location", "/thanks");
});

test("GET /login functional", () => {
    return supertest(app).get("/login").expect(200);
});

test("GET /login redirects to /petition if logged in but hasn't signed", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app)
        .get("/login")
        .expect(302)
        .expect("location", "/petition");
});

test("GET /login redirects to /thanks if logged in and has signed", () => {
    cookieSession.mockSessionOnce({ userId: 1, hasSigned: true });
    return supertest(app)
        .get("/login")
        .expect(302)
        .expect("location", "/thanks");
});

test("GET /logout redirects to /login when not logged in", () => {
    return supertest(app)
        .get("/logout")
        .expect(302)
        .expect("location", "/login");
});

test("GET /logout redirects to / when logged in", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app).get("/logout").expect(302).expect("location", "/");
});
