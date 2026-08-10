import {
  GraphQLID,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import ProductType from "../types/product.type.js";
import { ProductResolvers } from "../resolvers/product.resolver.js";

const ProductQueries = {
  // all market products
  products: {
    type: new GraphQLList(ProductType),
    args: {
      // page/limit added for the "Load more" pagination on the home
      // page. Resolver needs to use these with .skip()/.limit() —
      // see the note below.
      page: { type: GraphQLInt },
      limit: { type: GraphQLInt },
    },
    resolve: ProductResolvers.products,
  },
  shopProducts: {
    // was: type: ProductType (singular) — wrong, a shop has MANY
    // products. This must be a list, matching what the resolver
    // actually returns and what the frontend's useShopProducts hook
    // expects to .map() over.
    type: new GraphQLList(ProductType),
    args: {
      // shopId is now required — this query is meaningless without one,
      // so it's better to fail fast with a clear GraphQL error than
      // silently query with an undefined shopId.
      shopId: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: ProductResolvers.shopProducts,
  },
};

export default ProductQueries;