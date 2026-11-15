import localforage from "localforage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { decodeToken } from "react-jwt";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { confirm, request, sendAlert } from "../module/util";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState({});
  const [notification, setNotification] = useState([]);
  const [token, setToken] = useState("");
  const [title, setTitle] = useState("");
  const [customBreadcrumb, setCustomBreadcrumb] = useState("");
  const [check, setCheck] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const user = () => {
    if (!auth.urf_token)
      localforage.getItem("token").then((value) => {
        if (value) {
          setAuth(decodeToken(value));
          setToken(value);
        }
      });
  };

  const logout = (err) => {
    localforage.removeItem("token");
    navigate("/sign-in");
    if (err) sendAlert(false, err);
  };
  const getNotification = () => {
    localforage.getItem("token").then((value) => {
      if (value) {
        let user = decodeToken(value);
        let id;
        if (location.state) id = location.state["task"];
        window.history.replaceState({}, document.title);
        request(
          `/self-declarations/notifications${id ? `?id=${id}` : ""}`
        ).then((res) => {
          if (res["data"]) setNotification(res["data"]);
        });
      }
    });
  };
  useEffect(() => {
    setTimeout(() => {
      localforage.getItem("token", function (err, value) {
        if (!value) logout();
      });
      user();
      getNotification();
    }, 100);

    setTitle("");
    setCustomBreadcrumb("");
  }, [location]);
  const handleDelete = (id, url, redirect) => {
    confirm().then(() => {
      request(`/${url}/${id}`, "DELETE").then((res) => {
        if (res["success"]) {
          navigate(redirect);
        }
      });
    });
  };
  const handleFilter = (name, value) => {
    setSearchParams((prevSearchParams) => {
      const newSearchParams = new URLSearchParams(prevSearchParams);
      newSearchParams.set(name, value);
      return newSearchParams.toString();
    });
  };

  const authContextValue = {
    user,
    logout,
    auth,
    token,
    title,
    setTitle,
    handleDelete,
    customBreadcrumb,
    setCustomBreadcrumb,
    navigate,
    handleFilter,
    notification,
    getNotification,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
