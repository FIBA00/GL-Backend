import { GraphQLSchema, GraphQLObjectType } from "graphql";
import ProductQueries from "./queries/product.query.js";
import ProductMutations from "./mutations/product.mutation.js";
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    ...ProductQueries,
  },
});

const Mutations = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    ...ProductMutations,
  },
});

export const ProductRootSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
});
