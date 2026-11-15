import { Button, Card, Checkbox, Col, Form, Input, Layout, Row, Switch, Typography } from "antd";
import localforage from "localforage";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { request, rules, sendAlert } from "../module/util";

const { Title } = Typography;
const { Header, Footer, Content } = Layout;

export default function SignIn() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [token, setToken] = useState(false);

  const onFinish = (data) => {
    request("/users/sign-in", "POST", data, true).then((res) => {
      if (res["code"]) return setToken(true);
      if (res.success && res["data"]) {
        sendAlert(true, "با موفقیت وارد شدید");
        localforage.setItem("token", res["data"]);
        navigate("/");
      }
    });
  };

  return (
    <div className="AZ-login-page row g-0 h-100">
      <div className="col-lg-3 login-right">
        <div className="login-box_right d-flex flex-column justify-content-center">
          <div className="d-flex align-items-center justify-content-center">
            <img src={logo} alt="" className="logo" />
          </div>
          <h4 className="login-title text-center"> پرتال جامع تامین کنندگان شرکت دیناپارت </h4>
        </div>
      </div>

      <div className="col-lg-9 login-left">
        <div className="login-box_left">
          <div className="login-box_left_body w-100">
            <h1 className="login-title text-center"> برای ورود نام کاربری و رمز عبور خود را وارد کنید </h1>
            <Form form={form} onFinish={onFinish} layout="vertical" className="row-col" autoComplete="off">
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

              <Form.Item className="username" label="کلمه عبور" name="password" rules={rules("کلمه عبور")}>
                <Input placeholder="کلمه عبور" type="password" autoComplete="new-password" />
              </Form.Item>
              {token ? (
                <Form.Item className="username" label="کد تایید" name="code" rules={rules("کد تایید")}>
                  <Input placeholder="کد تایید" autoComplete="new-password" />
                </Form.Item>
              ) : (
                ""
              )}
              <Form.Item name="remember" className="AZ-checkbox-group" valuePropName="checked">
                <input type="checkbox" name="remember" id="remember" />
                {/* <Checkbox defaultChecked id="remember" /> */}
                {/* <Switch defaultChecked id="remember" /> */}
                <label className="me-3 mr-3" htmlFor="remember">
                  مرا بخاطر بسپار
                </label>
              </Form.Item>
            </Form>
          </div>
          <div className="login-footer w-100 d-flex flex-column">
            <Button type="" className="AZ-primary-btn d-flex align-items-center justify-content-center w-100 mb-" onClick={() => form.submit()}>
              ورود
            </Button>
            <div className="d-flex flex-column gap-1 mt-3">
              <Link className="login-page-link" to={"/signup"}>
                حساب کاربری ندارید؟ ثبت نام کنید
              </Link>
              <Link className="login-page-link" to={"/forgot-password"}>
                فراموشی کلمه عبور؟
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/*  */}
      {/* <Layout
        className="pb-5 login_background layout-default layout-signin"
        dir="rtl"
      >
        <Header>
          <div className="header-col header-brand d-flex">
            <h5>
              <img src={logo} alt="" height={50} />
            </h5>
          </div>
        </Header>
        <Content className="signin text-right mb-5">
          <div className="row justify-content-center mb-5">
            <div className="col-md-5 text-center">
              <Card style={{backgroundColor: "rgb(255 255 255 / 85%)"}}>
                <h3 className="mb-15 w-100">
                  پرتال جامع تامین کنندگان شرکت دیناپارت
                </h3>
                <Title className="font-regular text-muted" level={5}>
                  برای ورود نام کاربری و رمز عبور خود را وارد کنید
                </Title>
                <Form
                  onFinish={onFinish}
                  layout="vertical"
                  className="row-col"
                  autoComplete="off"
                >
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
                    <Input
                      placeholder="نام کاربری"
                      onChange={() => setToken(false)}
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item
                    className="username"
                    label="کلمه عبور"
                    name="password"
                    rules={rules("کلمه عبور")}
                  >
                    <Input
                      placeholder="کلمه عبور"
                      type="password"
                      autoComplete="new-password"
                    />
                  </Form.Item>
                  {token ? (
                    <Form.Item
                      className="username"
                      label="کد تایید"
                      name="code"
                      rules={rules("کد تایید")}
                    >
                      <Input
                        placeholder="کد تایید"
                        autoComplete="new-password"
                      />
                    </Form.Item>
                  ) : (
                    ""
                  )}
                  <Form.Item
                    name="remember"
                    className="aligin-center text-right"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked id="remember" />
                    <label className="me-3" htmlFor="remember">
                      مرا بخاطر بسپار
                    </label>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                    >
                      ورود
                    </Button>
                  </Form.Item>
                </Form>
                <div className="text-center">
                  <Link className="btn btn-link" to={"/signup"}>
                    حساب کاربری ندارید؟ ثبت نام کنید
                  </Link>
                  <br />
                  <Link className="btn btn-link" to={"/forgot-password"}>
                    فراموشی کلمه عبور؟
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Content>
      </Layout> */}
    </div>
  );
}
