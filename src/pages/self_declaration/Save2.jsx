import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AntdSelect from "../../components/AntdSelect";
import { useAuthContext } from "../../components/AuthProvider";
import { NumberFormat } from "../../components/NumberFormat";
import { request, rules } from "../../module/util";
const { Item, useForm } = Form;
export default function SaveSelfDeclaration2({
  open,
  setOpen,
  data,
  setData,
  placeDelivery,
  WarrantyStatus,
  packing,
  justPrice,
  setJustPrice,
  justPriceType,
}) {
  const { setTitle, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = useForm();
  const handleSubmit = async (values) => {
    try {
      const id = data["id"];
      let action = justPrice ? "update3" : "update2";
      let url = `/self-declarations/${action}/${id}`;
      values["id"] = id;
      let res = await request(url, "PUT", values);

      if (res["success"]) {
        navigate(location);
        close();
      }
    } catch (error) {}
  };
  const close = () => {
    setOpen(false);
    setJustPrice(false);
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
      title={`${
        data["id"] ? `ویرایش خود اظهاری: ${data["id"]}` : "ثبت خود اظهاری جدید"
      }`}
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
        {justPrice ? (
          <>
            {justPriceType == 513 ? (
              <Item
                label="قیمت مدیر تامین"
                name="supply_manager_price"
                rules={rules("قیمت مدیر تامین")}
              >
                <NumberFormat />
              </Item>
            ) : (
              <Item
                label="قیمت مدیر عامل"
                name="ceo_price"
                rules={rules("قیمت مدیر عامل")}
              >
                <NumberFormat />
              </Item>
            )}
          </>
        ) : (
          <>
            <Item label="شماره استعلام">
              <Input readOnly value={data["id"]} />
            </Item>
            <Item
              label="سریال قطعه"
              name="product_serial"
              rules={rules("سریال قطعه")}
            >
              <Input readOnly />
            </Item>
            <Item label="تعداد قطعه" name="product_count">
              <Input />
            </Item>

            {data["status"] < 2 ? (
              <Item label="روش پرداخت (روز)" name="payment_method">
                <Input />
              </Item>
            ) : (
              ""
            )}
            <Item label="قیمت واحد (قیمت بدون ارزش افزوده)" name="price" rules={rules("قیمت")}>
              <NumberFormat
                disabled={
                  data["status"] >= 2 && ![5, 8, 11].includes(data["status"])
                }
              />
            </Item>
            {/* {data["status"] < 2 ? (
          <Item label="محل تولید" name="place_delivery_id">
            <AntdSelect options={placeDelivery} placeholder="انتخاب کنید ..." />
          </Item>
        ) : (
          ""
        )} */}
            {/* <Item label="شرایط پرداخت" name="payment_terms">
          <Input />
        </Item> */}
            <Item label="وضعیت گارانتی" name="warranty_status">
              <AntdSelect
                options={WarrantyStatus}
                placeholder="انتخاب کنید ..."
              />
            </Item>
            <Item label="مدت گارانتی (ماه)" name="warranty_time">
              <Input />
            </Item>
            <Item label="مدت اعتبار قیمت (روز)" name="price_validity_time">
              <Input />
            </Item>
            {/* {data["status"] < 2 ? (
          <Item label="تعداد تامین در ماه" name="number_per_month">
            <Input />
          </Item>
        ) : (
          ""
        )} */}

            <Item label="نحوه بسته بندی" name="packaging_method">
              <AntdSelect options={packing} placeholder="انتخاب کنید ..." />
            </Item>
            <Item label="برند" name="brand">
              <Input />
            </Item>
            <Item label="توضیحات تامین کننده" name="description_supplier">
              <Input />
            </Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
