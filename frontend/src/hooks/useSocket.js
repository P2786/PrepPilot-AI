import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socketUpdateSession } from "../features/sessions/sessionSlice";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const useSocket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(BACKEND_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.io connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket.io disconnected.");
    });

    socket.on("sessionUpdate", (payload) => {
      console.log("Real-time Session Update:", payload);
      dispatch(socketUpdateSession(payload));

      if (payload?.status === "QUESTIONS_READY" && payload?.sessionId) {
        navigate(`/interview/${payload.sessionId}`);
      }
    });

    socket.on("proSessionUpdate", (payload) => {
      console.log("Real-time Pro Session Update:", payload);
      dispatch(socketUpdateSession(payload));

      if (payload?.status === "QUESTIONS_READY" && payload?.sessionId) {
        navigate(`/pro-interview/${payload.sessionId}`);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id, dispatch, navigate]);

  return socketRef.current;
};

export default useSocket;