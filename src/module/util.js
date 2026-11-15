import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import axios from "axios";
import localforage from "localforage";
import qs from "qs";
import React from "react";
import { decodeToken } from "react-jwt";
import { toast } from "react-toastify";
export function request(url, method, data, no_token = false, fullUrl = null,contentType="application/json") {
  return new Promise((resolve, reject) => {
    localforage.getItem("token").then((user_token) => {
      if (!user_token && !no_token) return true;

      var requestOptions = {
        method: method ? method : "GET",
        url: fullUrl ? url : process.env.REACT_APP_BE_URL + url,
      };
      if (data && contentType=="application/json") {
        requestOptions["data"] = check_data(data);
      }
      else{
        requestOptions["data"] =data;
      }

      var myHeaders = {};
      if (user_token) {
        myHeaders["Authorization"] = `Bearer ${user_token}`;
      }
      myHeaders["Content-Type"] =contentType;
      requestOptions["headers"] = myHeaders;
      axios(requestOptions)
        .then((response) => {
          console.log(response);
          resolve(response.data);
        })
        .catch((error) => {
          reject();
        });
    });
  });
}
export const check_data = (data) => {
  for (const key in data) {
    if (data[key] === undefined) data[key] = "";
  }
  return JSON.stringify(data);
};

export const getAuth = async () => {
  let token = await localforage.getItem("token");
  let user = {};
  if (token) {
    user = decodeToken(token);
  }
  return user;
};
export function getFormData(data) {
  let form_data = new FormData();
  for (var key in data) {
    form_data.append(key, data[key]);
  }
  return form_data;
}

export const sendAlert = (success = false, msg) => {
  const option = {
    position: "bottom-right",
    style: { direction: "ltr", "text-align": "right", fontFamily: "IRANSansX", "white-space": "pre-line" },
    theme: "colored",
  };
  if (success) toast.success(msg, option);
  else toast.error(msg, option);
};

export function getParams(params, name, createParams = 0, removePage = 0) {
  if (createParams == 1 && params.search("&")) {
    let new_params = "";
    let a = params.split("&");
    for (let i = 0; i < a.length; i++) {
      if (removePage == 1 && a[i].search("page") != -1) continue;
      new_params += a[i].replace("?", "") + "&";
    }
    return new_params.substring(0, new_params.length - 1);
  } else return new URLSearchParams(params).get(name);
}
export const confirm = () => {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      title: "تایید عملیات",
      icon: <ExclamationCircleOutlined />,
      content: "آیا مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      direction: "ltr",
      closable: true,
      maskClosable: true,
      centered: true,
      onOk: () => {
        resolve(true);
      },
    });
  });
};

export function convert_obj_to_form_data(obj) {
  let data = new FormData();
  for (const key in obj) {
    let val = obj[key];
    if (val) {
      if (typeof val === "object") {
        for (const k in val) {
          data.append(`${key}[]`, val[k]);
        }
      } else {
        data.append(key, val);
      }
    }
  }
  return data;
}
export function numberFormat(price) {
  let formattedPrice = price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
  return formattedPrice;
}
export const p2e = (s) => s.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
export const e2p = (s) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

export function maskm(e) {
  let val = e.target.value;
  val = p2e(val).replace(/\D/g, "");
  val = val.replace(/,/g, "");
  e.target.value = numberFormat(val);
  val = val ? parseInt(val) : 0;
  return val;
}
export function maskm2(val) {
  val = p2e(val).replace(/\D/g, "");
  val = val.replace(/,/g, "");
  val = numberFormat(val);
  return val;
}
const convert_ajax_select_data = (val, just_val) => {
  if (val.includes("|")) {
    let ex = val.split("|");
    if (just_val) val = ex[0];
    else val = { label: ex[1], value: ex[0] };
  }
  return val;
};
export const getParamsObject = (params, just_val = false) => {
  let obj = qs.parse(params);
  for (let key in obj) {
    let v = obj[key];
    // console.log(v)
    if (typeof v === "object") {
      for (const k in v) {
        obj[key][k] = convert_ajax_select_data(v[k], just_val);
      }
    } else {
      obj[key] = convert_ajax_select_data(v, just_val);
    }
  }
  return obj;
};
export const parseInputValue = (value, number = false) => {
  if (value) {
    value = p2e(value);
    if (/\D/g.test(value) && number) {
      value = value.replace(/[^0-9.-]/g, "");
    }
    return value;
  }
  return value;
};
export function in_array(arr1, arr2) {
  for (const key in arr1) {
    if (arr2.includes(arr1[key])) return true;
  }
  return false;
}
export const checkAccess = (roles, access_id) => {
  return in_array(roles, access_id);
};
export const rules = (label, message, required = true) => {
  if (!message && label) message = `${label} نمیتواند خالی باشد.`;
  return [{ required: required, message: message }];
};
