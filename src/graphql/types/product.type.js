import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
} from "graphql";
import UserType from "./user.type.js";

const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    stock: { type: GraphQLInt },
    category: { type: GraphQLID },
    shop: { type: GraphQLID },
    image: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
    // renamed from createdById -> createdBy to match the actual field
    // name on the Product mongoose model (createdBy: { ref: "User" }).
    // parent.createdById was always undefined before this fix, so this
    // field silently resolved to null on every product.
    // The fixed createdBy field with a defensive resolver
    createdBy: {
      type: UserType,
      resolve(parent, args, context) {
        // 1. Extract the creator ID safely (checks both fields)
        const creatorId = parent.createdBy || parent.createdById;

        // 2. SAFEGUARD: If there's no creator ID on this document, return null immediately.
        // This prevents the "loader.load() must be called with a value" exception!
        if (!creatorId) {
          return null;
        }

        // 3. Retrieve the loader dynamically with standard fallbacks
        const loader = context.userLoader || context.loaders?.user;

        if (!loader) {
          console.warn("User DataLoader is missing from GraphQL context!");
          return null;
        }

        // 4. Safely call load with a converted string ID
        return loader.load(creatorId.toString());
      },
    },
  }),
});

export default ProductType;
