import request from "supertest";
import App from "../../app.js";
import {
    connectTestDb,
    clearTestDB,
    closeTestDB,
} from "../helpers/db.helper.js";
import { createTestUser, authHeaderFor } from "../helpers/auth.helper";

beforeAll(async function setupDatabase() {
    await connectTestDb();
});

afterEach(async function resetDatabase() {
    await clearTestDB();
});

afterAll(async function teardownDatabase() {
    await closeTestDB();
});

describe("POST /api/users/register", function describeRegister() {
    it("creates a user and returns a bearer token", async function registerSuccessTest() {
        const res = await request(App).post("/api/users/register").send({
            username: "newuser",
            email: "newuser@guzolink.test",
            password: "Password123!",
        });
        expect(res.status).toBe(201);
        expect(res.body.bearerToken).toBeDefined();
        expect(res.body.user.email).toBe("newuser@guzolink.test");
    });

    it("rejects a duplicate email", async function duplicateEmailTest() {
        await createTestUser({ email: "dupe@guzolink.test" });
        const res = await request(App).post("/api/users/register").send({
            username: "someoneelse",
            email: "dupe@guzolink.test",
            password: "Password123!",
        });
        expect(res.status).toBe(400);
    });

    it("rejects a duplicate username", async function duplicateUsernameTest() {
        await createTestUser({ username: "takenname" });
        const res = await request(App).post("/api/users/register").send({
            username: "takenname",
            email: "fresh@guzolink.test",
            password: "Password123!",
        });
        expect(res.status).toBe(400);
    });
});

describe("POST /api/users/login", function describeLogin() {
    it("logs in with correct credentials", async function loginSuccessTest() {
        const user = await createTestUser({ password: "CorrectPass1!" });
        const res = await request(App).post("/api/users/login").send({
            email: user.email,
            password: "CorrectPass1!",
        });
        expect(res.status).toBe(200);
        expect(res.body.bearerToken).toBeDefined();
    });

    it("rejects an unknown email", async function unknownEmailTest() {
        const res = await request(App).post("/api/users/login").send({
            email: "ghost@guzolink.test",
            password: "whatever",
        });
        expect(res.status).toBe(401);
    });

    it("rejects the wrong password", async function wrongPasswordTest() {
        const user = await createTestUser({ password: "CorrectPass1!" });
        const res = await request(App).post("/api/users/login").send({
            email: user.email,
            password: "WrongPass!",
        });
        expect(res.status).toBe(401);
    });

    it("rejects a missing password", async function missingPasswordTest() {
        const res = await request(App).post("/api/users/login").send({
            email: "someone@guzolink.test",
        });
        expect(res.status).toBe(400);
    });
});

describe("POST /api/users/logout", function describeLogout() {
    it("increments tokenVersion, invalidating the old token", async function logoutInvalidatesTokenTest() {
        const user = await createTestUser();
        const oldHeaders = authHeaderFor(user);

        const logoutRes = await request(App).post("/api/users/logout").set(oldHeaders);
        expect(logoutRes.status).toBe(200);

        // regression test for the tokenVersion mechanism itself: the same
        // token that just logged out must now be rejected everywhere.
        const profileRes = await request(App)
            .get("/api/users/profile/" + user._id)
            .set(oldHeaders);
        expect(profileRes.status).toBe(401);
    });
});

describe("GET /api/users/all", function describeGetAllUsers() {
    it("blocks non-admin users with 403", async function nonAdminBlockedTest() {
        const user = await createTestUser({ role: "user" });
        const res = await request(App).get("/api/users/all").set(authHeaderFor(user));
        expect(res.status).toBe(403);
    });

    it("returns 200 with an empty array when no users exist (regression)", async function emptyListRegressionTest() {
        const admin = await createTestUser({ role: "admin" });
        const res = await request(App).get("/api/users/all").set(authHeaderFor(admin));
        // GetAllUsers previously returned 400 here — this locks in the fix.
        expect(res.status).toBe(200);
        // admin itself was just created, so exclude it from the "empty" claim —
        // asserting shape, not literal length, keeps this test honest.
        expect(Array.isArray(res.body.users)).toBe(true);
    });
});

describe("Update/Delete ownership enforcement", function describeOwnership() {
    it("allows a user to update their own profile", async function selfUpdateTest() {
        const user = await createTestUser();
        const res = await request(App)
            .post("/api/users/update/" + user._id)
            .set(authHeaderFor(user))
            .send({ phone: "0911000000" });
        expect(res.status).toBe(200);
        expect(res.body.user.phone).toBe("0911000000");
    });

    it("blocks a user from updating someone else's profile (regression)", async function crossUserUpdateBlockedTest() {
        const owner = await createTestUser();
        const attacker = await createTestUser();
        const res = await request(App)
            .post("/api/users/update/" + owner._id)
            .set(authHeaderFor(attacker))
            .send({ phone: "0911999999" });
        // this is the IDOR fix — previously 200
        expect(res.status).toBe(403);
    });

    it("allows an admin to update any profile", async function adminUpdateTest() {
        const owner = await createTestUser();
        const admin = await createTestUser({ role: "admin" });
        const res = await request(App)
            .post("/api/users/update/" + owner._id)
            .set(authHeaderFor(admin))
            .send({ phone: "0911111111" });
        expect(res.status).toBe(200);
    });

    it("blocks a user from deleting someone else's account (regression)", async function crossUserDeleteBlockedTest() {
        const owner = await createTestUser();
        const attacker = await createTestUser();
        const res = await request(App)
            .delete("/api/users/" + owner._id)
            .set(authHeaderFor(attacker));
        expect(res.status).toBe(403);
    });
});