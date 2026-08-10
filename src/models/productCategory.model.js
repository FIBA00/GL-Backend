import mongoose from "../utils/mongoose.util.js";

const ProductCategorySchema = new mongoose.Schema(
    {
        name: { 
            type: String,
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    },
);

const ProductCategoryModel = mongoose.model("ProductCategory", ProductCategorySchema);
export default ProductCategoryModel;