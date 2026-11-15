import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AntdSelect from "../../components/AntdSelect";
import { useAuthContext } from "../../components/AuthProvider";
import { NumberFormat } from "../../components/NumberFormat";
import { checkAccess, numberFormat, request, rules } from "../../module/util";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import SupplierDetails from "./SupplierDetails";
const { Item, useForm } = Form;
export default function PriceDetails({
  open,
  setOpen,
  data,
  setData,

}) {
  const { setTitle, logout, auth } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = useForm();
  const handleSubmit = async (values) => {
    try {
      const id = data["id"];
      let url = `/self-declarations/update2/${id}`;
      values["id"] = id;
      values["suggested"] = 1;
      let res = await request(url, "PUT", values);

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
      form.setFieldsValue(data);
    }
  }, [open]);

  return (
    <Modal
      width={1000}
      open={open}
      style={{ top: 20 }}
      onCancel={close}
      bodyStyle={{ overflow: "auto", maxHeight: "calc(90vh - 120px)" }}
      title={`${`جزئیات قیمت گذاری برای خوداظهاری شماره: ${data["id"]}`}`}
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
        <div className="row w-100">
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
                <tr>
                  <th>قیمت پیشنهادی بازاریابی</th>
                  <td>{numberFormat(data["inquiry_price"])}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-md-6">
            <SupplierDetails supplier={data['supplier']}/>
          </div>
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h6 className="bold">اطلاعات</h6>
              </div>
              <div className="card-body">
                <div className="d-flex gap-2">
                  <span className="bold flex-1">
                    سریال قطعه: {data["product_serial"]}
                  </span>
                  <span className="bold flex-1">
                    نام قطعه: {data["product_desc"]}
                  </span>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-6">
                    <Item label="مدت زمان فروش (روز)" name="sale_period">
                      <Input />
                    </Item>
                  </div>
                  <div className="col-md-6">
                    <Item
                      label="قیمت پیشنهادی فروش"
                      rules={rules("قیمت")}
                      name={"suggested_selling_price"}
                    >
                      <NumberFormat
                        disabled={
                          data["suggested_selling_price"] &&
                          !checkAccess(auth.roles, [512])
                        }
                      />
                    </Item>
                  </div>
                  <div className="col-md-12">
                    <Item
                      label="توضیحات کارشناس فروش"
                      name={"description_sales"}
                    >
                      <Input.TextArea />
                    </Item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
