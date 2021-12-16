const supertest = require("supertest");
const { app } = require("../server");
const cookieSession = require("cookie-session");

jest.mock("../utils/db.js");

test("GET /profile functional when logged in", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app).get("/profile").expect(200);
});

test("GET /profile redirects to /login when not logged in", () => {
    return supertest(app).get("/").expect(302).expect("location", "/login");
});

test("GET /profile/edit functional when logged in", () => {
    cookieSession.mockSessionOnce({ userId: 1 });
    return supertest(app).get("/profile/edit").expect(200);
});

test("GET /profile/edit redirects to /login when not logged in", () => {
    return supertest(app).get("/").expect(302).expect("location", "/login");
});
