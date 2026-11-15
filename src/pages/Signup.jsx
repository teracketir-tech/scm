import { Button, Card, Col, Form, Input, Layout, Row, Typography } from "antd";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { request, rules } from "../module/util";

function onChange(checked) {
  console.log(`switch to ${checked}`);
}
const { Title } = Typography;
const { Header, Footer, Content } = Layout;
const { Item, useForm } = Form;
export default function Signup() {
  const [form] = useForm();
  const navigate = useNavigate();
  const [token, setToken] = useState([]);
  const onFinish = (data) => {
    request("/users/signup", "POST", data, true).then((res) => {
      if (res.success) {
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
            <h4 className="login-title text-center"> پرتال جامع تامین کنندگان شرکت دیناپارت </h4>
          </div>
        </div>

        <div className="col-lg-9 login-left">
          <div className="login-box_left">
            <div className="login-box_left_body w-100">
              <h1 className="login-title text-center">ثبت نام</h1>

              <Form onFinish={onFinish} layout="vertical" className="row-col" autoComplete="off" form={form}>
                <Row>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="نام" name="first_name" rules={rules("نام")}>
                      <Input />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="نام خانوادگی" name="last_name" rules={rules("نام خانوادگی")}>
                      <Input />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="نام کاربری (شماره تماس)" name="username" rules={rules("نام کاربری")}>
                      <Input />
                    </Item>
                  </Col>

                  <Col xs={24} md={12} className="px-2">
                    <Item label="کلمه عبور" name="password" rules={rules("کلمه عبور")}>
                      <Input type="password" />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item
                      label="ایمیل"
                      name="email"
                      rules={[
                        {
                          type: "email",
                          message: "ایمیل وارد شده نامعتبر میباشد",
                        },
                      ]}
                    >
                      <Input />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="نام شرکت" name="company_name" rules={rules("نام شرکت")}>
                      <Input />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="کد اقتصادی" name="economic_code">
                      <Input />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="کد ملی" name="national_code">
                      <Input />
                    </Item>
                  </Col>
                  <Col xs={24} md={12} className="px-2">
                    <Item label="نام مدیر عامل" name="name_ceo">
                      <Input />
                    </Item>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className="login-footer w-100 d-flex flex-column">
              <Button type="" className="AZ-primary-btn d-flex align-items-center justify-content-center w-100" onClick={() => form.submit()}>
                ثبت نام
              </Button>
              <div className="d-flex flex-column gap-1 mt-3">
                <Link className="login-page-link" to={"/sign-in"}>
                  ورود
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
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
              <Card style={{ backgroundColor: "rgb(255 255 255 / 85%)" }}>
                <Title className="mb-15">ثبت نام</Title>
                <Title className="font-regular text-muted" level={5}>
                  برای ثبت نام اطلاعات خود را وارد کنید
                </Title>
                
                <div className="text-center">
                  <Link className="btn btn-link" to={"/sign-in"}>
                    ورود با کلمه عبور
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Content>
      </Layout> */}
    </>
  );
}
