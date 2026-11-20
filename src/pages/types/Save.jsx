import { Button, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { getParams, request, rules } from "../../module/util";
import { FloatingInput } from "../../components/FloatingInput";
const { useForm } = Form;
export default function SaveTypes() {
  const { setTitle, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [form] = useForm();

  const [model, setModel] = useState({});
  const handleSubmit = async (values) => {
    try {
      let create = location.pathname === "/types/create";
      let method = create ? "POST" : "PUT";
      const id = await getParams(location.search, "id");
      let url = create ? "/types" : `/types/${id}`;
      if (!create) values["id"] = id;
      let res = await request(url, method, values);

      if (res["success"]) {
        navigate(`/types`);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getData();
  }, [location]);
  const getData = async () => {
    const id = await getParams(location.search, "id");
    if (id) {
      let data = await request(`/types/${id}`, "GET");
      if (data["success"]) {
        let _data = data["data"];
        form.setFieldsValue(_data);
        setTitle(` : ${_data["name"]}`);
        setModel(data["data"]);
      }
    }
  };
  return (
    <div className="pa-3">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row>
          <Col className="pr-2" md={8} sm={24} xs={24} lg={8}>
            <Item label="نام" name="name" rules={rules("نام")}>
              <Input type="text" placeholder="نام" />
            </Item>
          </Col>
        </Row>
        <Form.Item className="text-left">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="!px-12 !rounded-xl"
          >
            ذخیره
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
