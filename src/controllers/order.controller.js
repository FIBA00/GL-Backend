export async function createOrder(req, res) {
  try {
    const { user, products, totalPrice } = req.body;

    const order = await OrdersModel.create({
      user,
      products,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
export async function getAllOrders(req, res) {
  try {
    const orders = await OrdersModel.find()
      .populate("user")
      .populate("products.product");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteOrder(req, res) {
  try {
    const order = await OrdersModel.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
