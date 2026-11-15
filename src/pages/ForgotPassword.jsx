import { Button, Card, Col, Form, Input, Layout, Row, Switch, Typography } from "antd";
import localforage from "localforage";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import AntdSelect from "../components/AntdSelect";
import { request, rules, sendAlert } from "../module/util";

const { Title } = Typography;
const { Header, Footer, Content } = Layout;

export default function ForgotPassword() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [token, setToken] = useState(false);

  const onFinish = (data) => {
    request("/users/forgot-password", "POST", data, true).then((res) => {
      if (res["code"]) return setToken(true);
      if (res.success && res["change"]) {
        navigate("/sign-in");
      }
    });
  };

  return (
    <>
      <div className="AZ-login-page row g-0 h-100">
        <div className="col-lg-3 login-right">
          <div className="login-box_right d-flex flex-column justify-content-center">
            <div className="d-flex align-items-center justify-content-center">
              <img src={logo} alt="" className="logo" />
            </div>
            <h4 className="login-title text-center">پرتال جامع تامین کنندگان شرکت دیناپارت </h4>
          </div>
        </div>

        <div className="col-lg-9 login-left">
          <div className="login-box_left">
            <div className="login-box_left_body w-100">
              <h1 className="login-title text-center">فراموشی کلمه عبور</h1>

              <Form onFinish={onFinish} layout="vertical" className="row-col" autoComplete="off" form={form}>
                <Form.Item
                  className="username"
                  label="نام کاربری"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "نام کاربری را وارد کنید",
                    },
                  ]}
                >
                  <Input placeholder="نام کاربری" onChange={() => setToken(false)} autoComplete="new-password" />
                </Form.Item>

                {token ? (
                  <>
                    <Form.Item className="username" label="کلمه عبور جدید" name="new_password" rules={rules("کلمه عبور")}>
                      <Input placeholder="کلمه عبور" type="password" autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item className="username" label="کد تایید" name="code" rules={rules("کد تایید")}>
                      <Input placeholder="کد تایید" autoComplete="new-password" />
                    </Form.Item>
                  </>
                ) : (
                  ""
                )}
              </Form>
            </div>
            <div className="login-footer w-100 d-flex flex-column">
              <Button type="" className="AZ-primary-btn d-flex align-items-center justify-content-center w-100 mb-" onClick={() => form.submit()}>
                {token ? "ثبت" : "دریافت کد تایید"}
              </Button>
              <div className="d-flex flex-column gap-1 mt-3">
                <Link className="login-page-link" to={"/signup"}>
                  حساب کاربری ندارید؟ ثبت نام کنید
                </Link>
                <Link className="login-page-link" to={"/sign-in"}>
                  ورود با کلمه عبور
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
