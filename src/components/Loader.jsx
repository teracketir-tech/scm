import axios from "axios";
import localforage from "localforage";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendAlert } from "../module/util";

export const Loader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestCounter, setRequestCounter] = useState(0);
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const logout = (err = null) => {
    localforage.removeItem("token");
    navigate("/sign-in");
    if (err) sendAlert(false, err);
  };
  const handleStatus = (error) => {
    if (error.response.status === 403) {
      logout();
    }
    
   if (error.response.status === 401) {
        localforage.removeItem("token");
        navigate("/sign-in");
   }
    if (error.response.status === 404) navigate("/404");
    if (error.response.status === 405) navigate("/403");
    if (error.response.data.message)
      sendAlert(false, error.response.data.message);
  };
  const setLoader = () => {
    axios.interceptors.request.use(
      (config) => {
        setRequestCounter((counter) => counter + 1);
        setIsLoading(true);
        return config;
      },
      (error) => {
        setRequestCounter((counter) => counter - 1);
        handleStatus(error);
        return Promise.reject(error);
      }
    );
    axios.interceptors.response.use(
      function (response) {
        setRequestCounter((counter) => counter - 1);
        if (response.data.message)
          sendAlert(response.data.success, response.data.message);
        return response;
      },
      function (error) {
        setRequestCounter((counter) => counter - 1);
        handleStatus(error);
        return Promise.reject(error);
      }
    );
  };
  useEffect(() => {
    setLoader();
  }, []);

  return (
    <>
      {isLoading && requestCounter > 0 ? (
        <div id="loader_body">
          <div className="loader">
            <div>
              <span className="_loader"></span>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
