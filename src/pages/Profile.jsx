import { Button, Form} from "antd";
import { FloatingInput } from "../components/FloatingInput";
import localforage from "localforage";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { request, rules } from "../module/util";
const { Item, useForm } = Form;
export default function Profile() {
  const [form] = useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const getData = async () => {
    try {
      let res = await request(`/users/profile`, "get");
      if (res["success"]) {
        form.setFieldsValue(res["data"]);
      }
    } catch (error) {}
  };
  useEffect(() => {
    getData();
  }, [location]);
  const onFinish = async (values) => {
    try {
      let res = await request(`/users/update-profile`, "POST", values);
      if (res["success"] && res["data"]) {
        localforage.setItem("token", res["data"]);
        navigate(location);
      }
    } catch (error) {}
  };
  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <div className="row p-4">
        <div className="col-md-4">
          <FloatingInput label="نام" name="first_name" rules={rules("نام")} type="text" />
        </div>
        <div className="col-md-4">
          <Item
            label="نام خانوادگی"
            name="last_name"
            rules={rules("نام خانوادگی")}
          >
            <Input type="text" placeholder="نام خانوادگی" />
          </Item>
        </div>
        <div className="col-md-4">
          <Item label="نام شرکت" name="company_name">
            <Input />
          </Item>
        </div>
        <div className="col-md-4">
          <Item label="کد اقتصادی" name="economic_code">
            <Input />
          </Item>
        </div>
        <div className="col-md-4">
          <Item label="کد ملی" name="national_code">
            <Input />
          </Item>
        </div>
        <div className="col-md-4">
          <Item
            label="کلمه عبور جدید"
            name="new_password"
            extra={
              <span className="text-primary">
                در صورت پر شدن کلمه عبور شما تغییر خواهد کرد.
              </span>
            }
          >
            <Input.Password />
          </Item>
        </div>
      </div>
      <Item className="text-center">
        <Button className="w-25" type="primary" htmlType="submit">
          ثبت
        </Button>
      </Item>
    </Form>
  );
}
