import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${server}/api/v1/users`,
});

export const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userData, setUserData] = useState(authContext);
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      let response = await client.post("/register", {
        name,
        username,
        password,
      });

      console.log("✅ Register API Response:", response.data); // Debug log

      if (response.status === httpStatus.CREATED) {
        return response.data.message || "Registration successful!";
      }
      return "Registration failed!"; // Fallback message
    } catch (err) {
      console.error("❌ Registration Error:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let response = await client.post("/login", {
        username,
        password,
      });

      console.log("✅ Login API Response:", response.data); // Debug log

      if (response.status === httpStatus.OK) {
        localStorage.setItem("token", response.data.token);
        router("/home");
      }
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let response = await client.get("/get_all_activity", {
        params: { token: localStorage.getItem("token") },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let response = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });
      return response;
    } catch (e) {
      throw e;
    }
  };

  const data = {
    userData,
    setUserData,
    addToUserHistory,
    getHistoryOfUser,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
