import { Button, Col, Form, Input, Modal, Radio, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { getParams, request, rules } from "../../module/util";
import AntdSelect from "../../components/AntdSelect";
import AjaxSelect from "../../components/AjaxSelect";
import { NumberFormat } from "../../components/NumberFormat";
const { Item, useForm } = Form;

export default function SaveSelfDeclaration({ open, setOpen, data, setData, carTypes, type, country }) {
  const navigate = useNavigate();
  const [form] = useForm();
  const handleSubmit = async (values) => {
    try {
      let create = !(data && data["id"]);
      let method = create ? "POST" : "PUT";
      const id = data["id"];
      let url = create ? "/self-declarations" : `/self-declarations/${id}`;
      if (!create) values["id"] = id;
      let res = await request(url, method, values);

      if (res["success"]) {
        navigate(`/self-declarations`);
        close();
      }
    } catch (error) {}
  };
  const close = () => {
    setOpen(false);
    setData({});
    form.resetFields();
  };
  useEffect(() => {
    if (open && data) {
      form.setFieldsValue(data);
    }
  }, [open]);
  return (
    <Modal
      open={open}
      style={{ top: 20 }}
      onCancel={close}
      bodyStyle={{ overflow: "auto", maxHeight: "calc(90vh - 120px)" }}
      title={`${data["id"] ? `ویرایش خود اظهاری: ${data["id"]}` : "ثبت خود اظهاری جدید"}`}
      footer={
        <>
          <div>
            <Button type="primary" danger className="me-2" onClick={() => close()}>
              لغو
            </Button>
            <Button type="primary" className="me-2" onClick={() => form.submit()}>
              ثبت
            </Button>
          </div>
        </>
      }
    >
      <div className="mb-5">
        <AjaxSelect
          url={"https://portalapi.dinapart.ir/api/scm-search-products"}
          fullUrl={true}
          value={null}
          onChange={(e) => {
            if (e) {
              form.setFieldValue("product_desc", e["label"]);
              form.setFieldValue("product_serial", e["code"]);
              form.validateFields();
            }
          }}
          placeholder={"جستجو قطعه"}
        />
      </div>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Item label="نوع خودرو" name="car_type" rules={rules("نوع خودرو")}>
          <AntdSelect options={carTypes} placeholder="انتخاب کنید ..." />
        </Item>
        <Item label="شرح قطعه" name="product_desc" rules={rules("شرح قطعه")}>
          <Input />
        </Item>
        <Item label="سریال قطعه" name="product_serial" rules={rules("سریال قطعه")}>
          <Input />
        </Item>
        <Item label="قیمت" name="price" rules={rules("قیمت")}>
          <NumberFormat />
        </Item>
        <Item label="نوع" name="type" rules={rules("نوع")}>
          <Radio.Group options={type} />
        </Item>
        <Item label="برند" name="brand" rules={rules("برند")}>
          <Input />
        </Item>
        <Item label="کشور" name="country">
          <AntdSelect options={country} placeholder="انتخاب کنید ..." />
        </Item>
        <Item label="ظرفیت تامین در ماه" name="capacity" rules={rules("ظرفیت تامین در ماه")}>
          <Input />
        </Item>
        <Item label="زمان تحویل (ماه)" name="delivery_time">
          <Input />
        </Item>
        <Item label="شماره فنی تامین کننده" name="technical_number">
          <Input />
        </Item>
      </Form>
    </Modal>
  );
}
