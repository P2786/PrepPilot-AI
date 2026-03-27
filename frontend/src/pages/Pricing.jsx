import { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// OPTIONAL: jo tamari authSlice ma setUser action hoy to use karo
// import { setUser } from "../features/auth/authSlice";

const Pricing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMockPaymentSuccess = async () => {
    try {
      setLoading(true);
      setMessage("");

      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      // Razorpay success pachi aa API hit karvani
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/activate-pro`,
        {
          planMonths: 1,
          razorpayPaymentId: "demo_payment_id_123",
          razorpayOrderId: "demo_order_id_123",
        },
        config
      );

      const updatedUser = {
        ...user,
        isPro: data?.user?.isPro,
        proExpiresAt: data?.user?.proExpiresAt,
      };

      // localStorage update
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // OPTIONAL Redux update
      // dispatch(setUser(updatedUser));

      setMessage("Premium activated successfully");

      // direct ProDashboard open
      navigate("/pro-dashboard");
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Payment activation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", color: "#fff" }}>
      <h1>PrepPilot AI Pricing</h1>
      <p>Upgrade to Pro for unlimited interviews and advanced AI review.</p>

      <button
        onClick={handleMockPaymentSuccess}
        disabled={loading}
        style={{
          padding: "12px 20px",
          borderRadius: "10px",
          border: "none",
          background: "#7c3aed",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Activate Pro"}
      </button>

      {message ? <p style={{ marginTop: "16px" }}>{message}</p> : null}
    </div>
  );
};

export default Pricing;