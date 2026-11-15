import { Button, Form, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AntdSelect from "../../components/AntdSelect";
import { useAuthContext } from "../../components/AuthProvider";
import { NumberFormat } from "../../components/NumberFormat";
import { checkAccess, request, rules } from "../../module/util";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import SupplierDetails from "./SupplierDetails";

const { Item, useForm } = Form;

export default function InquiryModal({ open, setOpen, data, setData }) {
  const { setTitle, auth } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = useForm();
  const [items, setItems] = useState([]);
  const [inquiryPrice, setInquiryPrice] = useState(null);

  const getData = async () => {
    try {
      const id = data?.id;
      let res = await request(`/self-declarations/inquiry/${id}`, "GET");
      let product = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=${data["product_serial"]}`, "GET", null, true, true);
      if (res["success"] && res["data"]) {
        form.setFieldsValue({
          items: res["data"],
          inquiry_price: res["inquiry_price"] ? res["inquiry_price"] : null,
          portal_price: product?.data?.length ? product?.data[0]["LastPrice"] : null,
        });
        setInquiryPrice(res["inquiry_price"] ? res["inquiry_price"] : null);
        setItems(res["data"]);
      }
    } catch (error) {}
  };

  const handleSubmit = async (values) => {
    try {
      const id = data["id"];
      values["id"] = id;
      let res = await request(`/self-declarations/inquiry`, "POST", values);
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
      styles={{ overflow: "auto", maxHeight: "calc(90vh - 120px)" }}
      title={`${`ثبت بازاریابی برای خوداظهاری شماره: ${data["id"]}`}`}
      footer={
        <>
          <div>
            <Button type="primary" danger className="me-2" onClick={() => close()}>
              لغو
            </Button>
            {checkAccess(auth.roles, [519]) ? (
              <Button type="primary" className="me-2" onClick={() => form.submit()}>
                ثبت
              </Button>
            ) : null}
          </div>
        </>
      }
    >
      <div className="row">
        <div className="col-md-6">
          <table className="table table-striped  w-100">
            <tbody>
              <tr>
                <th colSpan={2}>اطلاعات استعلام</th>
              </tr>
              <tr>
                <th>تاریخ شروع</th>
                <td dir="ltr">{data["created_date"]}</td>
              </tr>
              <tr>
                <th>تاریخ پایان</th>
                <td dir="ltr">{data["update_date"]}</td>
              </tr>
              <tr>
                <th>تاریخ ثبت</th>
                <td dir="ltr">{data["created_date"]}</td>
              </tr>
              <tr>
                <th>تعداد دفعات</th>
                <td>{data["count"]}</td>
              </tr>
              <tr>
                <th>توضیحات</th>
                <td>{data["description_supplier"]}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <SupplierDetails supplier={data["supplier"]} />
        </div>
      </div>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="d-flex">
          <Item name={"inquiry_price"} label="قیمت بازاریابی" rules={rules("قیمت بازاریابی")} className="w-50">
            <NumberFormat disabled={inquiryPrice && !checkAccess(auth.roles, [518]) ? true : false} />
          </Item>
          <Item name={"portal_price"} label="قیمت پرتال فروش" rules={rules("قیمت پرتال فروش")} className="w-50">
            <NumberFormat disabled />
          </Item>
        </div>
        <Form.List name="items" initialValue={[{}]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              <div className="mb-4">
                <Button
                  onClick={() => {
                    add();
                  }}
                >
                  اضافه کردن (+)
                </Button>
              </div>
              <table className="w-100 table table-hover text-center form-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>نام فروشگاه</th>
                    <th>آدرس</th>
                    <th>تلفن</th>
                    <th>سریال قطعه</th>
                    <th>برند</th>
                    <th>
                      قیمت <span className="text-danger">*</span>
                    </th>
                    <th>توضیحات</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(({ key, name, ...restField }, k) => (
                    <>
                      <tr>
                        <td>
                          {fields.length > 1 && !items[key] ? <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(name)} /> : null}
                        </td>
                        <td>
                          <Item {...restField} name={[name, "company_name"]}>
                            <Input placeholder="نام فروشگاه" />
                          </Item>
                        </td>
                        <td>
                          <Item {...restField} name={[name, "address"]}>
                            <Input.TextArea placeholder="آدرس" />
                          </Item>
                        </td>
                        <td>
                          <Item {...restField} name={[name, "phone"]}>
                            <Input placeholder="تلفن" />
                          </Item>
                        </td>
                        <td>
                          <Item {...restField} name={[name, "product_serial"]}>
                            <Input placeholder="سریال قطعه" />
                          </Item>
                        </td>
                        <td>
                          <Item {...restField} name={[name, "brand"]}>
                            <Input placeholder="برند" />
                          </Item>
                        </td>
                        <td>
                          <Item {...restField} name={[name, "price"]} rules={rules("قیمت")}>
                            <NumberFormat placeholder="قیمت" disabled={items[key] && !checkAccess(auth.roles, [518])} />
                          </Item>
                        </td>
                        <td>
                          <Item {...restField} name={[name, "description"]}>
                            <Input.TextArea placeholder="توضیحات" />
                          </Item>
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
