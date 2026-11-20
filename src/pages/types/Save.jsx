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
        <div className="modern-form-card rounded-2xl p-6 mb-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"><FloatingInput label="نام" name="name" rules={rules("نام")} /></div></div>
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
