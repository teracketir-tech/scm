import { Button, Card, Col, Form, Input, InputNumber, Row, Table } from "antd";
import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { checkAccess, getParams, request, rules } from "../../module/util";
import { NumberFormat } from "../../components/NumberFormat";
const { Item, useForm } = Form;
export default function PriceAnalysis() {
  const { setTitle, auth } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [form] = useForm();

  const [model, setModel] = useState({});
  const [product, setProduct] = useState({});
  const [id, setId] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const handleSubmit = async (values) => {
    try {
      let method = "POST";
      let url = `/self-declarations/save-price-analysis?id=${id}`;
      let res = await request(url, method, values);

      if (res["success"]) {
        navigate(`/self-declarations`);
      }
    } catch (error) {}
  };

  useEffect(() => {
    const idTmp = getParams(location.search, "id");
    setId(idTmp);
    getData(idTmp);
  }, [location]);

  const getData = async (id) => {
    if (id) {
      let data = await request(`/self-declarations/price-analysis?id=${id}`, "GET");
      if (data["success"]) {
        let _data = data["data"];
        if (_data["price_analysis"]) form.setFieldsValue(_data["price_analysis"]);
        form.setFieldsValue(_data);
        setTitle(` : ${_data["id"]}`);
        setModel(data["data"]);
        let product = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=${_data["product_serial"]}`, "GET", null, true, true);
        if (product["data"] && product["data"][0]) {
          let p = product["data"][0];
          setProduct(p);
          if (p && p["LastPrice"]) {
            form.setFieldValue("sell_price", parseInt(p["LastPrice"]));
          } else {
            form.setFieldValue("sell_price", 0);
          }
        }
        handlePrice();
        handleProfitPrice();
      }
      let inquiry = await request(`/self-declarations/inquiry/${id}`, "GET");
      setInquiries(inquiry.data);
    }
  };
  const handlePrice = () => {
    let values = form.getFieldsValue();
    let price = values["price"] ? parseInt(values["price"]) : 0;
    let price1 = (price / 1.1 - values["price_9"] / 1.09) / (values["price_9"] / 1.09);
    let price2 = values["sell_price"] / price - 1;
    price2 = parseFloat(price2).toFixed(2);
    form.setFieldValue("add_percent", price1);
    form.setFieldValue("percent", price2);
    form.setFieldValue("price_17", price * 1.17);
    form.setFieldValue("price_20", price * 1.2);
    form.setFieldValue("price_25", price * 1.25);
    form.setFieldValue("price_30", price * 1.3);
    form.setFieldValue("price_35", price * 1.35);
    form.setFieldValue("price_40", price * 1.4);
  };
  const handleProfitPrice = () => {
    let values = form.getFieldsValue();
    let price = values["price"] ? parseInt(values["price"]) : 0;
    let price1 = values["supply_manager_price"] ? (values["supply_manager_price"] - price) / price : 0;
    let price2 = values["ceo_price"] ? (values["ceo_price"] - price) / price : 0;
    price1 = parseFloat(price1 * 100).toFixed(2);
    price2 = parseFloat(price2 * 100).toFixed(2);
    form.setFieldValue("supply_profit_price", price1);
    form.setFieldValue("ceo_profit_price", price2);
  };
  const handleAccept = async (accept2 = false) => {
    try {
      let method = "POST";
      const id = await getParams(location.search, "id");
      let url = `/self-declarations/save-price-analysis?id=${id}&accept=${true}&accept2=${accept2}`;
      let res = await request(url, method, {});

      if (res["success"]) {
        navigate(`/self-declarations`);
      }
    } catch (error) {}
  };

  const columns = [
    {
      title: "نام فروشگاه",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "آدرس",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "تلفن",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "سریال قطعه",
      dataIndex: "product_serial",
      key: "product_serial",
    },
    {
      title: "برند",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: (
        <span>
          قیمت <span className="text-danger">*</span>
        </span>
      ),
      dataIndex: "price",
      key: "price",
      render: (price) => Number(price).toLocaleString(),
    },
    {
      title: "توضیحات",
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <div className="pa-3 analysis__form">
      <Button className="btn btn-primary hide_print m-3" onClick={() => navigate(-1)}>
        بازگشت
      </Button>
      <NavLink to={`/self-declarations/print-price-analysis?id=${model.id}`} className="btn btn-primary hide_print m-3" target="_blank">
        چاپ
      </NavLink>
      <Form form={form} onFinish={handleSubmit} layout="vertical" disabled={model["ceo_accept"] && !checkAccess(auth.roles, [517])}>
        <Card title="مدیریت تامین" bodyStyle={{ padding: 15 }}>
          <div className="row ">
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label="کد کالا" name="product_serial">
                <Input type="text" readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label="برند" name="brand">
                <Input type="text" readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label="کشور" name="country">
                <Input type="text" readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label="شرح کالا" name="product_desc">
                <Input type="text" readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label="موجودی قابل فروش" name="sell_count">
                <NumberFormat />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label="قیمت قبل 9%" name="price_9">
                <NumberFormat />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"درصد افزایشی"} name="add_percent">
                <Input readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"MRP فصل "} name={"mrp"}>
                <Input type="text" />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"تعداد خرید "} name={"buy_count"}>
                <NumberFormat />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"قيمت خريد-با10%"} name={"price"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط خرید"}>
                <NumberFormat readOnly />
              </Item>
            </div>
          </div>
        </Card>
        <Card className="mt_3" title="اطلاعات قیمت گذاری" bodyStyle={{ padding: 15 }}>
          <div className="row">
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"قيمت فروش فعلي-با10%"} name={"sell_price"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"تاریخ قیمت گذاری"}>
                <Input readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"حاشیه سود فعلی"} name={"percent"}>
                <Input readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط مصوب-با ۱۷٪"} name={"price_17"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط مصوب-با ۲۰٪"} name={"price_20"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط مصوب-با ۲۵٪"} name={"price_25"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط مصوب-با ۳۰٪"} name={"price_30"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط مصوب-با ۳۵٪"} name={"price_35"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط مصوب-با ۴۰٪"} name={"price_40"}>
                <NumberFormat readOnly />
              </Item>
            </div>
          </div>
        </Card>
        <Card className="mt_3" title="نظر بازاریابی - فروش و تصمیم مدیریت" bodyStyle={{ padding: 15 }}>
          <div className="row">
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"قیمت پیشنهادی بازاریابی"} name={"inquiry_price"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"قیمت پیشنهادی فروش"} name={"suggested_selling_price"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"شرایط فروش"} name={"sale_period"}>
                <Input readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"قیمت پیشنهادی بازرگانی"} name={"supply_manager_price"}>
                <NumberFormat readOnly />
              </Item>
            </div>
            <div className="col-lg-2 col-md-3 col-sm-3">
              <Item label={"قیمت نهایی مدیریت"} name={"ceo_price"}>
                <NumberFormat readOnly />
              </Item>
            </div>
          </div>
        </Card>
        <Card title="استعلام قیمت بازاریابی" className="mt_3" bodyStyle={{ padding: 15 }}>
          <Table bordered dataSource={inquiries} columns={columns} pagination={false} />
        </Card>
        <Card title="محاسبه سود بازرگانی" className="mt_3" bodyStyle={{ padding: 15 }}>
          <Button type="default" htmlType="button" size="large" className="hide_print" onClick={handleProfitPrice}>
            استعلام سود
          </Button>
          <div className="row mt_3">
            <div className="col-md-6">
              <Item label={"بر اساس قیمت مدیر تامین(درصد)"} name={"supply_profit_price"}>
                <Input readOnly />
              </Item>
            </div>
            <div className="col-md-6">
              <Item label={"بر اساس قیمت مدیر عامل(درصد)"} name={"ceo_profit_price"}>
                <Input readOnly />
              </Item>
            </div>
          </div>
        </Card>
        {model["price_analysis_accept"] && model["price_analysis_accept"]?.length ? (
          <div className="mt_3 mb-5">
            <h5 className="bold">تایید کنندگان</h5>
            <div className="d-flex justify-content-start gap-5">
              {model["price_analysis_accept"].map((item) => (
                <div className="border p-2 bold">
                  {item["name"]} ({item["date"]}) {item["ceo"] == 1 ? "(تایید نهایی)" : ""}
                </div>
              ))}
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="d-flex gap-5 justify-content-center mt-5 hide_print">
          <Form.Item className="m-0 mx-2">
            <Button type="primary" htmlType="submit" size="large" disabled={!model["show_accept"]}>
              ذخیره
            </Button>
          </Form.Item>

          {checkAccess(auth.roles, [517]) ? (
            <Button
              type="primary"
              className={`btn ${model["show_accept"] ? "btn-success" : ""}`}
              onClick={() => handleAccept(true)}
              disabled={!model["show_accept"]}
            >
              امضا و تایید نهایی مدیر عامل ( بستن خود اظهاری )
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="button"
              size="large"
              onClick={() => handleAccept(false)}
              disabled={!model["show_accept"]}
              // disabled={false}
            >
              امضا و تایید
            </Button>
          )}

          <Button type="default" htmlType="button" size="large" onClick={handlePrice}>
            استعلام قیمت
          </Button>
        </div>
      </Form>
    </div>
  );
}
