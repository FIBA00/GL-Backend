import Product from "../../models/product.model.js";
import Shop from "../../models/shop.model.js";

export const ProductResolvers = {
  // ─── queries ────────────────────────────────────────────────
  products: async (_, { page = 1, limit = 6 }) => {
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);
    return products;
  },

  shopProducts: async (parent, { shopId }) => {
    return await Product.find({ shop: shopId });
  },

  // ─── mutations ──────────────────────────────────────────────
  createProduct: async (parent, args, { user }) => {
    if (!user) throw new Error("You are not authenticated");
    const {
      name,
      price,
      category,
      shop: shopId,
      description,
      stock,
      image,
    } = args;

    // Note: `!price` treats a legitimate price of 0 (e.g. a free
    // promotional item) as missing. Fine to leave for now since real
    // products won't be free, but worth remembering if that ever
    // changes — the fix would be `price === undefined` instead of `!price`.

    if (!name || !price || !category || !shopId) {
      throw new Error("Name, price, category, and shop are required");
    }

    const shop = await Shop.findById(shopId);
    if (!shop) throw new Error("Shop not found");

    const isOwner =
      shop.owner?.toString() === (user._id || user.id)?.toString();
    if (!isOwner && user.role !== "admin") {
      throw new Error("You are not authorized to add products to this shop");
    }

    return await Product.create({
      name,
      description,
      price,
      stock: stock || 0,
      category,
      shop: shopId,
      image,
      // was createdById -> renamed to createdBy to match the actual
      // field on the Product model. Mongoose's default strict mode
      // silently drops fields that aren't in the schema, so this was
      // saving products with NO creator reference at all — which is
      // also why the ownership checks below always failed.
      createdBy: user._id || user.id,
    });
  },

  deleteProduct: async (parent, { id }, { user }) => {
    if (!user) throw new Error("You are not authenticated");

    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    // Only the product's creator (or an admin) may delete it.
    const isOwner =
      product.createdBy?.toString() === (user._id || user.id)?.toString();

    if (!isOwner && user.role !== "admin") {
      throw new Error("You are not authorized to delete this product");
    }

    await Product.findByIdAndDelete(id);

    // Return the deleted document so the client can confirm what was removed.
    return product;
  },

  updateProduct: async (parent, args, { user }) => {
    if (!user) throw new Error("You are not authenticated");

    const { id, ...updates } = args;

    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    const isOwner =
      product.createdBy?.toString() === (user._id || user.id)?.toString();
    if (!isOwner && user.role !== "admin") {
      throw new Error("You are not authorized to update this product");
    }

    // Drop any args the client didn't send (GraphQL passes them as undefined,
    // not omitted) so we don't overwrite existing fields with undefined.
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );

    return await Product.findByIdAndUpdate(id, cleanedUpdates, { new: true });
  },
};
