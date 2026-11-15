import { Button, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { getParams, request, rules } from "../../module/util";
import { FloatingInput } from "../../components/FloatingInput";
import Role from "../users/Role";

const { useForm } = Form;

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
    <div className="max-w-7xl mx-auto">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        
        {/* کارت اطلاعات گروه */}
        <div className="modern-form-card rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">اطلاعات گروه</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <FloatingInput 
              label="نام گروه" 
              name="name" 
              required 
              rules={rules("نام")} 
            />
          </div>
        </div>

        {/* کارت دسترسی‌ها */}
        <div className="modern-form-card rounded-2xl p-6 mb-6">
          <Role
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
            roles={roles}
          />
        </div>

        {/* دکمه ذخیره */}
        <div className="flex justify-end pb-8">
          <Button type="primary" htmlType="submit" size="large" className="!px-12 !rounded-xl !bg-brand-500 !border-brand-500">
            ذخیره
          </Button>
        </div>
      </Form>
    </div>
  );
}