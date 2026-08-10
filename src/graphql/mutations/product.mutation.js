import {
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLID,
} from "graphql";
import ProductType from "../types/product.type.js";
import { ProductResolvers } from "../resolvers/product.resolver.js";

const ProductMutations = {
  createProduct: {
    type: ProductType,
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLString },
      price: { type: new GraphQLNonNull(GraphQLFloat) },
      stock: { type: new GraphQLNonNull(GraphQLInt) },
      category: { type: new GraphQLNonNull(GraphQLID) },
      shop: { type: new GraphQLNonNull(GraphQLID) },
      image: { type: GraphQLString },
    },
    resolve: ProductResolvers.createProduct, // "resolve", not "resolver"; reference, not called
  },
  deleteProduct: {
    type: ProductType, // or GraphQLBoolean if you just want true/false back
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: ProductResolvers.deleteProduct, // you'll need to write this resolver
  },
  updateProduct: {
    type: ProductType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      price: { type: GraphQLFloat },
      stock: { type: GraphQLInt },
      category: { type: GraphQLID },
      image: { type: GraphQLString },
    },
    resolve: ProductResolvers.updateProduct, // also needs writing
  },
};

export default ProductMutations;
