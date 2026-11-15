import { Button, Form, Input, Select, Modal, message } from "antd";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../components/AuthProvider";
import { request } from "../../module/util";

const { Item } = Form;

export const SaveEsalatUser = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  userId = null,
  mode = "create" 
}) => {
  const { setTitle } = useAuthContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let url = mode === "create" ? "/users/esalat/create" : `/users/esalat/user/${userId}`;
      let method = mode === "create" ? "POST" : "PUT";
      
      const res = await request(url, method, values);
      
      if (res.success) {
        message.success(mode === "create" ? "کاربر با موفقیت ایجاد شد" : "کاربر با موفقیت ویرایش شد");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error("خطا در ذخیره اطلاعات");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("خطا در ذخیره اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && userId) {
        getData();
      } else {
        form.resetFields();
      }
    }
  }, [visible, mode, userId]);

  const getData = async () => {
    if (userId) {
      const response = await request(`/users/esalat/${userId}`, "GET");
      if (response.data) {
        const { user } = response.data;
        form.setFieldsValue({
          username: user.username,
          chassis_number: user.chassis_number,
          license_plate_number: user.license_plate_number,
          status: user.status,
        });
        setTitle(`ویرایش کاربر: ${user.username}`);
      }
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      title={mode === "create" ? "افزودن کاربر گارانتی" : "ویرایش کاربر گارانتی"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
    >
      <Form 
        form={form} 
        layout="vertical" 
        name="esalat_user_form"
        onFinish={handleSubmit}
      >
        <Item 
          label="نام کاربری" 
          name="username" 
          rules={[{ required: true, message: "لطفاً نام کاربری را وارد کنید!" }]}
        >
          <Input />
        </Item>
        
        <Item 
          label="وضعیت" 
          name="status" 
          rules={[{ required: true, message: "لطفاً وضعیت را انتخاب کنید!" }]}
        >
          <Select>
            <Select.Option value={10}>فعال</Select.Option>
            <Select.Option value={9}>غیرفعال</Select.Option>
          </Select>
        </Item>
        
        <Item 
          label="شماره پلاک" 
          name="license_plate_number" 
          rules={[{ required: true, message: "لطفاً شماره پلاک را وارد کنید!" }]}
        >
          <Input />
        </Item>
        
        <Item 
          label="شماره شاسی" 
          name="chassis_number" 
          rules={[{ required: true, message: "لطفاً شماره شاسی را وارد کنید!" }]}
        >
          <Input />
        </Item>
        
        <Item className="text-center">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "25%" }}
            loading={loading}
          >
            {mode === "create" ? "ایجاد کاربر" : "ویرایش کاربر"}
          </Button>
        </Item>
      </Form>
    </Modal>
  );
};