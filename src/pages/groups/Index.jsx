import { Button, Col, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { getParams, request, rules } from "../../module/util";
import Role from "../users/Role";
const { Item, useForm } = Form;
export default function SaveGroup() {
  const { setTitle, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [form] = useForm();
  const [selectedValue, setSelectedValue] = useState([]);
  const [roles, setRoles] = useState([]);
  const [model, setModel] = useState({});
  const handleSubmit = async (values) => {
    try {
      let create = location.pathname === "/groups/create";
      let method = create ? "POST" : "PUT";
      values["role"] = selectedValue;
      const id = await getParams(location.search, "id");
      let url = create ? "/groups" : `/groups/${id}`;
      if (!create) values["id"] = id;
      let res = await request(url, method, values);

      if (res["success"]) {
        navigate(`/groups`);
      }
    } catch (error) {}
  };
  const getRole = async () => {
    let data = await request(`/groups/form-data`, "GET");
    if (data["data"]) {
      setRoles(data["data"]["roles"]);
    }
  };
  useEffect(() => {
    getData();
    getRole();
  }, [location]);

  const getData = async () => {
    const id = await getParams(location.search, "id");
    if (id) {
      let data = await request(`/groups/${id}`, "GET");
      if (data["success"]) {
        let _data = data["data"];
        form.setFieldsValue(_data);
        setTitle(` : ${_data["name"]}`);
        setModel(data["data"]);
        if (_data["role"]) setSelectedValue(_data["role"]);
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
        <Role
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          roles={roles}
        />
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
