import { Button, Divider, Table, Tag, message, Modal, Card, Badge, Space, Row, Col, Select, Input } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DollarOutlined,
  CreditCardOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import Pagination from "../../components/Pagination";
import { numberFormat, request } from "../../module/util";
import dayjs from "dayjs";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import "react-multi-date-picker/styles/colors/green.css";

const { Option } = Select;

export default function OrderShortages() {
  const { auth } = useAuthContext();
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // فیلترها
  const [statusFilter, setStatusFilter] = useState(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [productIdFilter, setProductIdFilter] = useState(null);
  const [orderIdFilter, setOrderIdFilter] = useState("");

  // گزینه‌های محصول برای Select
  const [productOptions, setProductOptions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [productSearchTimeout, setProductSearchTimeout] = useState(null);


  // داخل کامپوننت:
  const location = useLocation();
  const navigate = useNavigate();

  // خلاصه آمار
  const [summary, setSummary] = useState({
    total_orders: 0,
    total_shortage_items: 0,
    total_shortage_qty: 0,
  });

  // مودال جزئیات سفارش
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

 // تبدیل/نمایش تاریخ — اگر میلادی بود به شمسی تبدیل می‌کند، اگر شمسی بود خودش را برمی‌گرداند
const toJalali = (date, withTime = true) => {
  if (!date) return "-";

  // اگر ورودی رشته شمسی بود (مثلاً "1403/08/15" یا "1403-08-15")
  if (typeof date === "string") {
    // استخراج سال از ابتدای رشته (با / یا -)
    const yearMatch = date.match(/^(\d{4})[\/\-]/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      // اگر سال زیر 1900 بود → از قبل شمسی است، همان را برگردان
      if (year < 1900) {
        return date;
      }
    }
    // اگر رشته معتبر نبود یا میلادی بود، ادامه بده تا تبدیل شود
  }

  try {
    const d = dayjs(date);
    if (!d.isValid()) return "-";

    // اگر ورودی Date یا timestamp بود، سالش را بررسی کن
    if (d.year() < 1900) {
      // یعنی از قبل شمسی است، فقط فرمت کن
      return withTime
        ? d.format("YYYY/MM/DD HH:mm")
        : d.format("YYYY/MM/DD");
    }

    // میلادی است → تبدیل به شمسی
    return new DateObject({
      date: d.toDate(),
      calendar: persian,
      locale: persian_fa,
    }).format(withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD");
  } catch (e) {
    return "-";
  }
};

  // تبدیل تاریخ شمسی (DateObject) به میلادی برای ارسال به API
  const convertPersianToGregorian = (date) => {
    if (!date) return null;
    const gregorianDate = date.toDate();
    return dayjs(gregorianDate).format("YYYY-MM-DD");
  };

  // خواندن صفحه از URL
  const getPageFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const p = parseInt(params.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  };
  // هر بار URL عوض شد، دوباره دیتا بگیر
  useEffect(() => {
    const page = getPageFromUrl();
    setCurrentPage(page);
    getData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // وضعیت‌های سفارش
  const statusMap = {
    0: { text: "معلق", color: "default" },
    1: { text: "ثبت شده", color: "blue" },
    2: { text: "تایید کارشناس", color: "cyan" },
    3: { text: "ارسال به فروش", color: "green" },
    4: { text: "رد کارشناس", color: "red" },
  };

  // نوع پرداخت
  const payTypeMap = {
    1: { text: "نقدی", color: "green", icon: <DollarOutlined /> },
    2: { text: "اعتباری", color: "orange", icon: <CreditCardOutlined /> },
  };

  // جستجوی محصولات با debounce
  const handleProductSearch = (value) => {
    if (productSearchTimeout) {
      clearTimeout(productSearchTimeout);
    }

    if (!value || value.trim() === "") {
      setProductOptions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setProductSearchLoading(true);
      try {
        const res = await request(
          `/supplier-inventory/product-list?name=${encodeURIComponent(value)}&search_type=shortage`
        );

        if (res && res.products) {
          const options = res.products.map((p) => ({
            value: p.code || p.id,
            label: `${p.name} | کد: ${p.code || p.id}`,
          }));
          setProductOptions(options);
        } else {
          setProductOptions([]);
        }
      } catch (error) {
        console.error("Product search error:", error);
        setProductOptions([]);
      } finally {
        setProductSearchLoading(false);
      }
    }, 500);

    setProductSearchTimeout(timeout);
  };

  // ستون‌های جدول اصلی
  const columns = [
    {
      title: "شماره سفارش",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: true,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "تاریخ سفارش",
      dataIndex: "date",
      key: "date",
      width: 160,
      render: (date) => toJalali(date, true),
    },
    {
      title: "کاربر",
      dataIndex: "user_info",
      key: "user_info",
      width: 220,
      render: (userInfo, record) => {
        if (!userInfo) {
          return <Tag color="default">کاربر {record.user_id}</Tag>;
        }

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Tag
              color="purple"
              icon={<UserOutlined />}
              style={{ margin: 0, width: "fit-content" }}
            >
              {userInfo.name_and_fam || "نامشخص"} - کد : {userInfo.customer_code || ""}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "مبلغ کل",
      dataIndex: "total",
      key: "total",
      width: 130,
      render: (total) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {numberFormat(total || 0)} تومان
        </span>
      ),
    },
    {
      title: "نوع سفارش",
      dataIndex: "pay_type",
      key: "pay_type",
      width: 100,
      render: (payType) => {
        const typeInfo = payTypeMap[payType] || { text: "نامشخص", color: "default" };
        return (
          <Tag color={typeInfo.color} icon={typeInfo.icon}>
            {typeInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status) => {
        const statusInfo = statusMap[status] || { text: "نامشخص", color: "default" };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "تعداد اقلام کسری",
      dataIndex: "shortage_items_count",
      key: "shortage_items_count",
      width: 130,
      align: "center",
      render: (count) => (
        <Badge
          count={count}
          showZero
          style={{ backgroundColor: "#ff4d4f" }}
          overflowCount={999}
        />
      ),
    },
    {
      title: "مجموع کسری (عدد)",
      dataIndex: "total_shortage_qty",
      key: "total_shortage_qty",
      width: 140,
      align: "center",
      render: (qty) => (
        <Tag color="red" icon={<WarningOutlined />}>
          {numberFormat(qty)} عدد
        </Tag>
      ),
    },
    {
      title: "عملیات",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleShowDetail(record.id)}
          >
            جزئیات
          </Button>
        </Space>
      ),
    },
  ];

  // نمایش جزئیات سفارش
  const handleShowDetail = async (orderId) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    setSelectedOrder(null);

    try {
      const res = await request(`/order-api/${orderId}`, "GET");
      if (res["success"]) {
        setSelectedOrder(res["data"]["order"]);
      } else {
        message.error(res["message"] || "خطا در دریافت جزئیات سفارش");
      }
    } catch (error) {
      console.error("Detail fetch error:", error);
      message.error("خطا در دریافت جزئیات سفارش");
    } finally {
      setDetailLoading(false);
    }
  };

  // ساخت URL با فیلترها (بدون supplier_id)
  const buildUrl = (page = 1, excel = 0) => {
    let url = `/order-api/shortages?page=${page}&pageSize=20&excel=${excel}`;

    if (statusFilter !== null && statusFilter !== "") {
      url += `&status=${statusFilter}`;
    }
    if (orderTypeFilter) {
      url += `&pay_type=${orderTypeFilter}`;
    }
    if (userIdFilter && userIdFilter.trim() !== "") {
      url += `&user_id=${userIdFilter.trim()}`;
    }
    if (productIdFilter) {
      url += `&product_id=${productIdFilter}`;
    }
    if (orderIdFilter && orderIdFilter.trim() !== "") {
      url += `&order_id=${orderIdFilter.trim()}`;
    }
    if (dateRange && dateRange.length === 2) {
      const fromDate = convertPersianToGregorian(dateRange[0]);
      const toDate = convertPersianToGregorian(dateRange[1]);
      if (fromDate) url += `&date_from=${fromDate}`;
      if (toDate) url += `&date_to=${toDate}`;
    }

    return url;
  };

  // دریافت داده‌ها از API
  const getData = (page = 1) => {
    setLoading(true);
    const url = buildUrl(page, 0);

    request(url)
      .then((res) => {
        if (res["success"]) {
          setData(res["data"]["orders"] || []);
          setPages(res["data"]["pagination"]["totalPages"] || 0);
          setTotal(res["data"]["pagination"]["totalCount"] || 0);
          setSummary(res["data"]["summary"] || {});
          setCurrentPage(page);
        } else {
          message.error(res["message"] || "خطا در دریافت اطلاعات");
          setData([]);
        }
      })
      .catch((err) => {
        console.error("API error:", err);
        message.error("خطا در ارتباط با سرور");
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // خروجی اکسل
  const handleExportExcel = () => {
    setLoading(true);
    const url = buildUrl(1, 1);

    request(url)
      .then((res) => {
        if (res["success"] && res["data"]["excel"]) {
          const fileUrl = res["data"]["excel"]["file"];
          if (fileUrl) {
            window.location.href = fileUrl;
            message.success("فایل اکسل با موفقیت آماده شد");
          } else {
            message.warning("فایل اکسل آماده نشد");
          }
        } else {
          message.error(res["message"] || "خطا در دریافت خروجی اکسل");
        }
      })
      .catch((err) => {
        console.error("Excel error:", err);
        message.error("خطا در ارتباط با سرور");
      })
      .finally(() => {
        setLoading(false);
      });
  };

 const handlePageChange = (page) => {
  const params = new URLSearchParams(location.search);
  params.set("page", page);
  navigate({ search: params.toString() });
};

  // بازنشانی فیلترها
  const resetFilters = () => {
    setStatusFilter(null);
    setOrderTypeFilter(null);
    setDateRange(null);
    setUserIdFilter("");
    setProductIdFilter(null);
    setOrderIdFilter("");
    setProductOptions([]);
    setCurrentPage(1);
    getData(1);
  };

  // بارگذاری اولیه — بدون وابستگی به supplierId
  useEffect(() => {
    getData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // گزینه‌های وضعیت
  const statusOptions = [
    { value: 0, label: "معلق" },
    { value: 1, label: "ثبت شده" },
    { value: 2, label: "تایید کارشناس" },
    { value: 3, label: "ارسال به فروش" },
    { value: 4, label: "رد کارشناس" },
  ];

  // گزینه‌های نوع سفارش
  const orderTypeOptions = [
    { value: 1, label: "نقدی", icon: <DollarOutlined /> },
    { value: 2, label: "اعتباری", icon: <CreditCardOutlined /> },
  ];

  return (
    <>
      <div className="flexible-header" style={{ textAlign: "right" }}>
        <br />
        <div className="flexible-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <h3 style={{ margin: 0 }}>
              <WarningOutlined style={{ color: "#faad14" }} /> گزارش کسری سفارشات
            </h3>

            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => resetFilters()}>
                بازنشانی فیلترها
              </Button>
              <Button
                type="default"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                style={{ backgroundColor: "#52c41a", color: "white", borderColor: "#52c41a" }}
              >
                خروجی اکسل
              </Button>
            </Space>
          </div>

          <br />

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>شماره سفارش:</div>
              <Input
                placeholder="شماره سفارش را وارد کنید"
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
                onPressEnter={() => getData(1)}
                allowClear
                prefix={<EyeOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>شناسه کاربر:</div>
              <Input
                placeholder="کد کاربر را وارد کنید"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                onPressEnter={() => getData(1)}
                allowClear
                prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>کد محصول:</div>
              <Select
                showSearch
                allowClear
                placeholder="جستجوی محصول (تایپ کنید...)"
                style={{ width: "100%" }}
                value={productIdFilter}
                onChange={setProductIdFilter}
                onSearch={handleProductSearch}
                loading={productSearchLoading}
                filterOption={false}
                notFoundContent={productSearchLoading ? "در حال جستجو..." : "محصولی یافت نشد"}
              >
                {productOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>وضعیت سفارش:</div>
              <Select
                placeholder="همه"
                allowClear
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>نوع سفارش (نقدی/اعتباری):</div>
              <Select
                placeholder="همه"
                allowClear
                style={{ width: "100%" }}
                value={orderTypeFilter}
                onChange={setOrderTypeFilter}
                options={orderTypeOptions}
                optionRender={(option) => (
                  <Space>
                    {option.data.icon}
                    {option.data.label}
                  </Space>
                )}
              />
            </Col>
            <Col span={18}>
              <div style={{ marginBottom: 4 }}>محدوده تاریخ (شمسی):</div>
              <DatePicker
                range
                calendar={persian}
                locale={persian_fa}
                value={dateRange}
                onChange={setDateRange}
                format="YYYY/MM/DD"
                placeholder={["از تاریخ", "تا تاریخ"]}
                style={{
                  width: "100%",
                  height: 32,
                  border: "1px solid #d9d9d9",
                  borderRadius: 6,
                  padding: "4px 11px",
                  fontSize: 14,
                }}
                className="green"
                rangeHover
                showOtherDays
              />
            </Col>
          </Row>

          <br />

          <div style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={() => getData(1)}>
              اعمال فیلتر
            </Button>
          </div>
        </div>
      </div>

      <Divider />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small" style={{ backgroundColor: "#fff1f0", borderColor: "#ffa39e" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WarningOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>تعداد سفارشات کسری</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#ff4d4f" }}>
                  {numberFormat(summary.total_orders)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ backgroundColor: "#fff7e6", borderColor: "#ffd591" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>تعداد اقلام کسری</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#fa8c16" }}>
                  {numberFormat(summary.total_shortage_items)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ backgroundColor: "#f9f0ff", borderColor: "#d3adf7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge
                count={summary.total_shortage_qty}
                showZero
                overflowCount={999999}
                style={{
                  backgroundColor: "#722ed1",
                  fontSize: 14,
                  height: 24,
                  lineHeight: "24px",
                  minWidth: 24,
                  borderRadius: 12,
                }}
              />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>مجموع کسری (عدد)</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#722ed1" }}>
                  {numberFormat(summary.total_shortage_qty)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          style={{ textAlign: "center" }}
          className="ant-border-space"
          rowKey="id"
          scroll={{ x: 1500 }}
          rowClassName={() => "shortage-row"}
        />
      </div>

      {/* Pagination — هم onChange هم onPageChange پاس داده شد برای سازگاری */}
     <Pagination
  all={pages}
  total={total}
  current={currentPage}
  onChange={handlePageChange}
/>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <EyeOutlined />
            <span>جزئیات سفارش #{selectedOrder?.id}</span>
            {selectedOrder && (
              <Tag color={statusMap[selectedOrder.status]?.color}>
                {statusMap[selectedOrder.status]?.text}
              </Tag>
            )}
            {selectedOrder && (
              <Tag color="red" icon={<WarningOutlined />}>
                دارای کسری
              </Tag>
            )}
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1100}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>در حال بارگذاری...</div>
        ) : selectedOrder ? (
          <>
            <Card size="small" style={{ marginBottom: 20, backgroundColor: "#f5f5f5" }}>
              <Row gutter={16}>
                <Col span={6}>
                  <div>
                    <span style={{ color: "#666" }}>شماره سفارش:</span>
                    <br />
                    <strong>{selectedOrder.id}</strong>
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <span style={{ color: "#666" }}>کاربر:</span>
                    <br />
                    <strong>
                      {selectedOrder.user_info?.name_and_fam || `کاربر ${selectedOrder.user_id}`}
                    </strong>
                    {selectedOrder.user_info?.customer_code && (
                      <div style={{ fontSize: 11, color: "#666" }}>
                        کد مشتری: {selectedOrder.user_info.customer_code}
                      </div>
                    )}
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <span style={{ color: "#666" }}>تاریخ ثبت:</span>
                    <br />
                    <strong>{toJalali(selectedOrder.date, true)}</strong>
                  </div>
                </Col>
                <Col span={6}>
                  <div>
                    <span style={{ color: "#666" }}>نوع سفارش:</span>
                    <br />
                    <Tag
                      color={payTypeMap[selectedOrder.pay_type]?.color}
                      icon={payTypeMap[selectedOrder.pay_type]?.icon}
                    >
                      {payTypeMap[selectedOrder.pay_type]?.text || "نامشخص"}
                    </Tag>
                  </div>
                </Col>
              </Row>
              <Divider style={{ margin: "12px 0" }} />
              <Row gutter={16}>
                <Col span={24}>
                  <div>
                    <span style={{ color: "#666" }}>توضیحات:</span>
                    <br />
                    {selectedOrder.note || "---"}
                  </div>
                </Col>
              </Row>
            </Card>

            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <WarningOutlined style={{ color: "#ff4d4f" }} />
              <strong>
                اقلام دارای کسری (
                {selectedOrder.items?.filter(
                  (item) => (item.qty_received || 0) < item.qty
                ).length || 0}{" "}
                قلم)
              </strong>
            </div>
            <Table
              dataSource={
                selectedOrder.items?.filter(
                  (item) => (item.qty_received || 0) < item.qty
                ) || []
              }
              pagination={false}
              size="small"
              rowKey="id"
              columns={[
                { title: "شناسه", dataIndex: "id", width: 70 },
                {
                  title: "کد محصول",
                  dataIndex: "product_id",
                  width: 110,
                  render: (id) => <Tag color="blue">{id}</Tag>,
                },
                {
                  title: "نام محصول",
                  dataIndex: "product_name",
                  width: 200,
                  ellipsis: true,
                },
                {
                  title: "تعداد سفارش",
                  dataIndex: "qty",
                  width: 90,
                  align: "center",
                  render: (qty) => <Tag color="blue">{numberFormat(qty)}</Tag>,
                },
                {
                  title: "تعداد دریافتی",
                  dataIndex: "qty_received",
                  width: 100,
                  align: "center",
                  render: (qty) => <Tag color="green">{numberFormat(qty)}</Tag>,
                },
                {
                  title: "کسری",
                  key: "shortage",
                  width: 90,
                  align: "center",
                  render: (_, record) => {
                    const shortage = (record.qty || 0) - (record.qty_received || 0);
                    return (
                      <Tag color="red" icon={<ExclamationCircleOutlined />}>
                        {numberFormat(shortage)}
                      </Tag>
                    );
                  },
                },
                {
                  title: "قیمت واحد",
                  dataIndex: "price",
                  width: 120,
                  render: (price) => numberFormat(price) + " تومان",
                },
              ]}
            />

            <div style={{ marginTop: 24, marginBottom: 16 }}>
              <strong>همه اقلام سفارش ({selectedOrder.items_count} قلم)</strong>
            </div>
            <Table
              dataSource={selectedOrder.items}
              pagination={false}
              size="small"
              rowKey="id"
              columns={[
                { title: "شناسه", dataIndex: "id", width: 70 },
                {
                  title: "کد محصول",
                  dataIndex: "product_id",
                  width: 110,
                  render: (id) => <Tag color="blue">{id}</Tag>,
                },
                {
                  title: "نام محصول",
                  dataIndex: "product_name",
                  width: 200,
                  ellipsis: true,
                },
                {
                  title: "تعداد سفارش",
                  dataIndex: "qty",
                  width: 90,
                  align: "center",
                  render: (qty) => <Tag color="blue">{numberFormat(qty)}</Tag>,
                },
                {
                  title: "تعداد دریافتی",
                  dataIndex: "qty_received",
                  width: 100,
                  align: "center",
                  render: (qty, record) => (
                    <Tag color={(qty || 0) < record.qty ? "red" : "green"}>
                      {numberFormat(qty)}
                    </Tag>
                  ),
                },
                {
                  title: "قیمت واحد",
                  dataIndex: "price",
                  width: 120,
                  render: (price) => numberFormat(price) + " تومان",
                },
                {
                  title: "قیمت نهایی",
                  dataIndex: "final_price",
                  width: 130,
                  render: (price) => (
                    <span style={{ color: "#52c41a" }}>
                      {numberFormat(price)} تومان
                    </span>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 50, color: "#999" }}>
            اطلاعاتی برای نمایش وجود ندارد.
          </div>
        )}
      </Modal>
    </>
  );
}