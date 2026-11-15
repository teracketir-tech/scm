import { Button, Form, Input, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { convert_obj_to_form_data, getParams, request, rules } from "../../module/util";
import Role from "./Role";
import { FloatingInput } from "../../components/FloatingInput";
import { FloatingSelect } from "../../components/FloatingSelect";
import axios from "axios";
import localforage from "localforage";
import { InfoCircleOutlined, UploadOutlined } from "@ant-design/icons";

const { Item, useForm } = Form;

export const SaveUser = () => {
  const { setTitle, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedValue, setSelectedValue] = useState([]);
  const [roles, setRoles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState([]);
  const [type, setType] = useState([]);
  const [sign, setSign] = useState(null);

  const [form] = useForm();
  const [model, setModel] = useState({});

  const handleSubmit = async (values) => {
    let create = location.pathname === "/users/create";
    let method = create ? "POST" : "PUT";
    const id = await getParams(location.search, "id");
    let url = create ? "/users" : `/users/${id}`;

    if (!create) values["id"] = id;
    values["role"] = selectedValue;

    const data = convert_obj_to_form_data(values);
    if (sign) values["sign"] = data.append("sign", sign.originFileObj);

    const token = await localforage.getItem("token");
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    const baseURL = import.meta.env.VITE_BE_URL || process.env.REACT_APP_BE_URL;
    const response = await axios({ method, url: `${baseURL}${url}`, headers, data });

    if (response["success"]) {
      if (response["id"]) navigate(`/users/view?id=${response["id"]}`);
    }
  };

  const getRole = async () => {
    let data = await request(`/users/form-data`, "GET");
    if (data["data"]) {
      setRoles(data["data"]["roles"]);
      setGroups(data["data"]["groups"]);
      setStatus(data["data"]["status"]);
      setType(data["data"]["type"]);
    }
  };

  useEffect(() => {
    getData();
    getRole();
  }, [location]);

  const getData = async () => {
    const id = await getParams(location.search, "id");
    if (id) {
      let data = await request(`/users/${id}`, "GET");
      if (data["data"]) {
        let _data = data["data"];
        if (_data["type"] == "0") delete _data["type"];
        form.setFieldsValue(_data);
        setTitle(` : ${_data["first_name"]} ${_data["last_name"]}`);
        setModel(data["data"]);
        if (_data["role"]) setSelectedValue(_data["role"]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        
        {/* بخش اول: اطلاعات پایه */}
        <div className="modern-form-card rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">اطلاعات پایه</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            
            <FloatingInput 
              label="نام" 
              name="first_name" 
              required 
              rules={[{ required: true, message: "نام را وارد کنید" }]} 
            />
            
            <FloatingInput label="نام خانوادگی" name="last_name" />
            
            <FloatingInput 
              label="نام کاربری" 
              name="username" 
              required 
              rules={[{ required: true, message: "نام کاربری را وارد کنید" }]} 
            />
            
            <FloatingInput 
              label="کلمه عبور" 
              name="password" 
              type="password" 
              rules={[{ required: location.pathname === "/users/create", message: "کلمه عبور را وارد کنید" }]} 
            />
            
            <FloatingInput label="ایمیل" name="email" />
            
            <FloatingSelect 
              label="گروه ها" 
              name="groups" 
              options={groups} 
              mode="multiple" 
            />
            
            <FloatingSelect 
              label="وضعیت" 
              name="status" 
              options={status} 
              required 
              rules={rules("وضعیت")} 
            />
            
            <FloatingSelect 
              label="نوع کاربر" 
              name="type" 
              options={type} 
              required 
              rules={rules("نوع کاربر")} 
            />
            
            <FloatingInput label="نام شرکت" name="company_name" />
          </div>
        </div>

        {/* بخش دوم: اطلاعات حقوقی */}
        <div className="modern-form-card rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">اطلاعات حقوقی</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            
            <FloatingInput label="کد اقتصادی" name="economic_code" />
            
            <FloatingInput label="کد تامین کننده" name="supplier_code" />
            
            <FloatingInput label="کد ملی" name="national_code" />
            
            <FloatingInput label="نام مدیر عامل" name="name_ceo" />
            
            <div className="relative h-[52px]">
              <label className="absolute top-0 right-3 -translate-y-1/2 bg-white dark:bg-gray-900 px-1 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                تصویر امضا
              </label>
              <Upload style={{position:'relative',top:'11px'}} listType="picture" beforeUpload={false} onChange={({ file }) => setSign(file)}>
                <Button icon={<UploadOutlined />} className="w-full h-[52px] rounded-lg border-dashed">
                  انتخاب تصویر
                </Button>
              </Upload>
            </div>
            
          </div>
        </div>

        {/* هشدار مدرن */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 mb-6 flex gap-3">
          <InfoCircleOutlined className="text-blue-500 text-xl mt-1 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed text-justify">
            توجه: درصورتی که برای کاربر گروه انتخاب میکنید و در گروه های انتخاب شده دسترسی ثبت کرده باشید، دسترسی های این قسمت بی تاثیر می‌شود و دسترسی های وارد شده داخل گروه برای کاربر ثبت می‌گردد. باکس دسترسی های پایین فقط جهت نمایش است. برای دسترسی دستی، گروه ها را حذف کنید و از بخش پایین انتخاب کنید.
          </p>
        </div>

        {/* بخش سوم: دسترسی‌ها */}
        <div className="modern-form-card rounded-2xl p-6 mb-6">
          <Role selectedValue={selectedValue} setSelectedValue={setSelectedValue} roles={roles} />
        </div>

        {/* دکمه ذخیره */}
        <div className="flex justify-end pb-8">
          <Button type="primary" htmlType="submit" size="large" className="!px-12 !rounded-xl">
            ذخیره کاربر
          </Button>
        </div>
      </Form>
    </div>
  );
};