import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setUser } from "../features/auth/authSlice";

const PaymentPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpaySuccess = async (response) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/verify`,
        {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          amount: 499,
        },
        config
      );

      const updatedUser = data.user;

      localStorage.setItem("user", JSON.stringify(updatedUser));
      dispatch(setUser(updatedUser));

      toast.success("Pro activated successfully");
      navigate("/pro-dashboard");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Payment verification failed"
      );
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create-order`,
        { amount: 499 },
        config
      );

      const order = data.order;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PrepPilot AI Pro",
        description: "Premium Subscription",
        order_id: order.id,
        handler: handleRazorpaySuccess,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Payment start failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060816] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-4">Upgrade to PrepPilot AI Pro</h1>
        <p className="text-white/70 mb-6">
          Unlimited mock interviews, advanced AI review, company-wise practice,
          PDF report, and pro analytics.
        </p>

        <div className="mb-6 rounded-xl bg-white/5 p-4 border border-white/10">
          <p className="text-lg font-semibold">Plan Price: ₹499 / month</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 transition px-5 py-3 font-semibold disabled:opacity-60"
        >
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;