import bcrypt from "bcrypt"
import { GenerateToken } from "../../src/middlewares/auth.middleware";
import UserModel from "../../src/models/user.model";

export async function createTestUser(overrides) {
    const plainPassword = (overrides && overrides.password) || "Password123!";
    const hashed = await bcrypt.hash(plainPassword, 10);

    const defaults = {
        username: "testuser_" + Date.now(),
        email: "testuser_" + Date.now() + "@guzolink.test",
        role: "user",
        tokenVersion: 0,
    };

    const userData = Object.assign({}, defaults, overrides, { password: hashed })
    const user = await UserModel.create(userData);
    user.plainPassword = plainPassword; //stash for login tests, not persisted
    return user;
}

export function authHeaderFor(user) {
    const token = GenerateToken(user);
    return {
        Authorization: "Bearer" + token
    }
}
