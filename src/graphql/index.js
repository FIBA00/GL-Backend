// graphql/index.js
import { createHandler } from "graphql-http/lib/use/express";
import { AuthenticateToken } from "../middlewares/auth.middleware.js";
import { createUserLoader } from "./loaders/user.loader.js";
import { ProductRootSchema } from "./schema.js";

export const ProductRoute = createHandler({
  schema: ProductRootSchema,

  context: async (request) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(" ")[1];

    let user = null;
    if (token) {
      try {
        user = await AuthenticateToken(token);
      } catch (err) {
        console.log(err);
      }
    }

    return {
      user,
      userLoader: createUserLoader(),
    };
  },
});