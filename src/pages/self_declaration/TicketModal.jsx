import { Avatar, Button, Form, Input, List, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AntdSelect from "../../components/AntdSelect";
import { useAuthContext } from "../../components/AuthProvider";
import { NumberFormat } from "../../components/NumberFormat";
import { request, rules } from "../../module/util";
import { MinusCircleOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
const { Item, useForm } = Form;
export default function TicketModal({ open, setOpen, data, setData }) {
  const { setTitle, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [form] = useForm();
  const handleSubmit = async (values) => {
    try {
      const id = data["id"];
      let url = `/self-declarations/message`;
      values["id"] = id;
      values["is_staff"] = data["is_staff"];
      let res = await request(url, "POST", values);
      if (res["success"]) {
        navigate(location);
        close();
      }
    } catch (error) {}
  };
  const close = () => {
    setOpen(false);
    setData({});
    form.resetFields();
  };
  const getData = async () => {
    try {
      let res = await request(`/self-declarations/messages?id=${data["id"]}`);
      if (res["success"]) {
        setMessages(res["data"]);
      }
    } catch (error) {}
  };
  useEffect(() => {
    if (open && data) {
      getData();
    }
  }, [open]);
  return (
    <Modal
      width={1000}
      open={open}
      style={{ top: 20 }}
      onCancel={close}
      bodyStyle={{ overflow: "auto", maxHeight: "calc(90vh - 120px)" }}
      title={`${`ارسال پیام اصلاح قیمت برای خوداظهاری شماره: ${data["id"]}`}`}
      footer={
        <>
          <div>
            <Button
              type="primary"
              danger
              className="me-2"
              onClick={() => close()}
            >
              لغو
            </Button>
            <Button
              type="primary"
              className="me-2"
              onClick={() => form.submit()}
            >
              ثبت
            </Button>
          </div>
        </>
      }
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Item name={"body"} label="متن پیام" rules={rules("پیام")}>
          <Input.TextArea rows={5} />
        </Item>
      </Form>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={messages}
        renderItem={(item) => (
          <List.Item key={item.title}>
            <List.Item.Meta
                avatar={<Avatar  icon={<UserOutlined />} />}
              className="message-modal"
              title={<span>{item.name}<span
              className={`mx-2 badge ${
                item.is_staff ? "bg-success" : "bg-info"
              }`}
            >
              {item.is_staff ? "کارشناس فروش" : "تامین کننده"}
            </span></span>}
              description={
               item['date']
              }
            />
            {item.body}
          </List.Item>
        )}
      />
    </Modal>
  );
}
