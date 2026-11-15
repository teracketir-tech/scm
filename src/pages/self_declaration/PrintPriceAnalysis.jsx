import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Table, Typography } from "antd";
import { getParams, numberFormat, request } from "../../module/util";

const { Title } = Typography;

export default function PrintPriceAnalysis() {
  const location = useLocation();

  const [model, setModel] = useState({});
  const [product, setProduct] = useState({});
  const [inquiries, setInquiries] = useState([]);
  const [sellPrice, setSellPrice] = useState(0);

  useEffect(() => {
    getData();
  }, [location]);

  const handleProfitPrice = () => {
    const { price, supply_manager_price, ceo_price } = model;
    const parsedPrice = price ? parseInt(price) : 0;

    const price1 = supply_manager_price ? (((supply_manager_price - parsedPrice) / parsedPrice) * 100).toFixed(2) : 0;
    const price2 = ceo_price ? ((ceo_price - parsedPrice) / parsedPrice).toFixed(2) : 0;

    setModel((prevModel) => ({
      ...prevModel,
      supply_profit_price: `${parseFloat(price1)} %`,
      ceo_profit_price: parseFloat(price2),
    }));
  };

  const getData = async () => {
    const id = await getParams(location.search, "id");
    if (id) {
      const data = await request(`/self-declarations/price-analysis?id=${id}`, "GET");
      if (data["success"]) {
        const _data = data["data"];
        setModel(_data);
        const productData = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=${_data["product_serial"]}`, "GET", null, true, true);
        if (productData["data"] && productData["data"][0]) {
          const p = productData["data"][0];
          setProduct(p);
          handleProfitPrice();

          if (p && p["LastPrice"]) {
            setSellPrice(parseInt(p["LastPrice"]));
          } else {
            setSellPrice(0);
          }
        }

        let inquiry = await request(`/self-declarations/inquiry/${id}`, "GET");
        setInquiries(inquiry.data);
        window.print();
      }
    }
  };

  const columnsManagement = [
    {
      title: "کد کالا",
      dataIndex: "product_serial",
      key: "product_serial",
    },
    {
      title: "برند",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "کشور",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "شرح کالا",
      dataIndex: "product_desc",
      key: "product_desc",
    },
    {
      title: "موجودی قابل فروش",
      dataIndex: "sell_count",
      key: "sell_count",
    },
    {
      title: "قیمت قبل 9%",
      dataIndex: "price_9",
      key: "price_9",
    },
    {
      title: "درصد افزایشی",
      dataIndex: "add_percent",
      key: "add_percent",
    },
    {
      title: "MRP فصل",
      dataIndex: "mrp",
      key: "mrp",
    },
    {
      title: "تعداد خرید",
      dataIndex: "buy_count",
      key: "buy_count",
    },
    {
      title: "قیمت تمام شده خرید-با10%",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "شرایط خرید",
      dataIndex: "buy_condition",
      key: "buy_condition",
    },
  ];

  const columnsPricing = [
    {
      title: "قيمت فروش فعلي-با10%",
      dataIndex: "suggested_selling_price",
      key: "suggested_selling_price",
      render: (_, item) => sellPrice?.toLocaleString(),
    },
    {
      title: "تاریخ قیمت گذاری",
      dataIndex: "price_date",
      key: "price_date",
    },
    {
      title: "حاشیه سود فعلی",
      dataIndex: "percent",
      key: "percent",
      render: (_, item) => {
        const price = sellPrice / item.price - 1;

        return Math.round(price * 100) / 100;
      },
    },
    {
      title: "شرایط مصوب-با ۱۷٪",
      dataIndex: "price_17",
      key: "price_17",
      render: (_, item) => (item.price * 1.17)?.toLocaleString(),
    },
    {
      title: "شرایط مصوب-با ۲۰٪",
      dataIndex: "price_20",
      key: "price_20",
      render: (_, item) => (item.price * 1.2)?.toLocaleString(),
    },
    {
      title: "شرایط مصوب-با ۲۵٪",
      dataIndex: "price_25",
      key: "price_25",
      render: (_, item) => (item.price * 1.25)?.toLocaleString(),
    },
    {
      title: "شرایط مصوب-با ۳۰٪",
      dataIndex: "price_30",
      key: "price_30",
      render: (_, item) => (item.price * 1.3)?.toLocaleString(),
    },
    {
      title: "شرایط مصوب-با ۳۵٪",
      dataIndex: "price_35",
      key: "price_35",
      render: (_, item) => (item.price * 1.35)?.toLocaleString(),
    },
    {
      title: "شرایط مصوب-با ۴۰٪",
      dataIndex: "price_40",
      key: "price_40",
      render: (_, item) => (item.price * 1.4)?.toLocaleString(),
    },
  ];

  const columnsMarketing = [
    {
      title: "قیمت پیشنهادی بازاریابی",
      dataIndex: "inquiry_price",
      key: "inquiry_price",
    },
    {
      title: "قیمت پیشنهادی فروش",
      dataIndex: "suggested_selling_price",
      key: "suggested_selling_price",
    },
    {
      title: "شرایط فروش",
      dataIndex: "sale_period",
      key: "sale_period",
    },
    {
      title: "قیمت پیشنهادی بازرگانی",
      dataIndex: "supply_manager_price",
      key: "supply_manager_price",
    },
    {
      title: "قیمت نهایی مدیریت",
      dataIndex: "ceo_price",
      key: "ceo_price",
    },
  ];

  const columnsCommercial = [
    {
      title: "بر اساس قیمت مدیر تامین",
      dataIndex: "supply_profit_price",
      key: "supply_profit_price",
    },
    {
      title: "بر اساس قیمت مدیر عامل",
      dataIndex: "ceo_profit_price",
      key: "ceo_profit_price",
    },
  ];

  const columnsMarketingPrice = [
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
    <div className="pa-3 analysis__form" dir="rtl">
      <Title className="my-2" level={5}>
        مدیریت تامین
      </Title>
      <Table columns={columnsManagement} dataSource={[model]} bordered pagination={false} rowKey="product_serial" size="small" />

      <Title className="my-2" level={5}>
        اطلاعات قیمت گذاری
      </Title>
      <Table columns={columnsPricing} dataSource={[model]} bordered pagination={false} rowKey="price_date" size="small" />

      <Title className="my-2" level={5}>
        نظر بازاریابی - فروش و تصمیم مدیریت
      </Title>
      <Table columns={columnsMarketing} dataSource={[model]} bordered pagination={false} rowKey="sale_period" size="small" />

      <Title className="my-2" level={5}>
        محاسبه سود بازرگانی
      </Title>
      <Table columns={columnsCommercial} dataSource={[model]} bordered pagination={false} rowKey="supply_profit_price" size="small" />

      <Title className="my-2" level={5}>
        استعلام قیمت بازاریابی
      </Title>
      <Table bordered dataSource={inquiries} columns={columnsMarketingPrice} pagination={false} size="small" />

      {model.price_analysis_accept && model.price_analysis_accept.length ? (
        <div className="mt-3 mb-5">
          <Title className="my-2" level={5}>
            تایید کنندگان
          </Title>
          <div className="d-flex justify-content-start gap-5">
            {model.price_analysis_accept.map((item) => (
              <div key={item.id} className="border p-2 bold">
                {item.name} ({item.date}) {item.ceo === 1 ? "(تایید نهایی)" : ""}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
