import { Button, Col, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getParams, request, rules } from "../module/util";
import { useAuthContext } from "../components/AuthProvider";
import { NumberFormat } from "../components/NumberFormat";
const { Item, useForm } = Form;
export default function Settings() {
  const { setTitle, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [form] = useForm();

  const [model, setModel] = useState({});
  const handleSubmit = async (values) => {
    try {
      let method = "PUT";
      const id = await getParams(location.search, "id");
      let url = `/settings/${1}`;
      let res = await request(url, method, values);

      if (res["success"]) {
      }
    } catch (error) {}
  };

  useEffect(() => {
    getData();
  }, [location]);
  const getData = async () => {
    let data = await request(`/settings`, "GET");
    if (data["success"]) {
      let _data = data["data"];
      form.setFieldsValue(_data);
      setModel(data["data"]);
    }
  };
  return (
    <div className="pa-3">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row>
          <Col className="pr-2" md={8} sm={24} xs={24} lg={8}>
            <Item label="مبلغ مالیات بر ارزش افزوده (درصد)" name="tax">
              <NumberFormat />
            </Item>
          </Col>
        </Row>

        <Row>
          <Col className="pr-2" md={8} sm={24} xs={24} lg={8}>
            <Item label="افزایش کلی کارمزد قیمت ها (درصد)" name="fee">
              <NumberFormat />
            </Item>
          </Col>
        </Row>

        <Form.Item className="text-center">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "25%" }}
          >
            ذخیره
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
