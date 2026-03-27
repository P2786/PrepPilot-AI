import asyncHandler from "express-async-handler";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("CREATE ORDER HIT");
    console.log("REQ BODY:", req.body);
    console.log("REQ USER:", req.user?._id);

    if (!amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error("Valid amount is required");
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      // Razorpay receipt short rakhvu
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: String(req.user?._id || ""),
        plan: "PrepPilot AI Pro",
      },
    };

    const order = await razorpay.orders.create(options);

    console.log("ORDER CREATED:", order);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500);
    throw new Error(error?.error?.description || error?.message || "Failed to create order");
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error("Missing payment verification fields");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error("Invalid payment signature");
    }

    let payment = await Payment.findOne({ razorpay_payment_id });

    if (!payment) {
      payment = await Payment.create({
        user: req.user._id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: amount || 0,
        status: "success",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const now = new Date();
    let baseDate = now;

    if (user.proExpiresAt && new Date(user.proExpiresAt) > now) {
      baseDate = new Date(user.proExpiresAt);
    }

    user.isPro = true;
    user.proExpiresAt = addDays(baseDate, 30);

    await user.save();

    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : "";

    res.status(200).json({
      success: true,
      message: "Payment verified and Pro activated successfully",
      payment,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        preferredRole: user.preferredRole,
        isPro: user.isPro,
        proExpiresAt: user.proExpiresAt,
        weeklyInterviewCount: user.weeklyInterviewCount,
        weeklyInterviewResetAt: user.weeklyInterviewResetAt,
        token,
      },
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    res.status(500);
    throw new Error(error?.message || "Payment verification failed");
  }
});

export { createOrder, verifyPayment };