import { Button, Divider, Table, Tag, message, Card, Badge, Space, Row, Col, Select, Input } from "antd";
import { useEffect, useState } from "react";
import {
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import Pagination from "../../components/Pagination";
import { numberFormat, request } from "../../module/util";
import dayjs from "dayjs";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/colors/green.css";

const { Option } = Select;

export default function ProductOrderReport() {
  const { auth } = useAuthContext();
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    total_products: 0,
    total_quantity: 0,
    total_price: 0,
    total_orders: 0,
  });

  // فیلترها
  const [productIdFilter, setProductIdFilter] = useState(null);
  const [userIdFilter, setUserIdFilter] = useState(""); // فیلد متنی برای شخص سفارش‌دهنده
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // گزینه‌های محصول برای Select
  const [productOptions, setProductOptions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [productSearchTimeout, setProductSearchTimeout] = useState(null);

  const supplierId = auth?.id || 0;

  // تبدیل تاریخ شمسی به میلادی
  const convertPersianToGregorian = (date) => {
    if (!date) return null;
    const gregorianDate = date.toDate();
    return dayjs(gregorianDate).format("YYYY-MM-DD");
  };

  // وضعیت‌های سفارش
  const statusMap = {
    0: { text: "معلق", color: "default" },
    1: { text: "ثبت شده", color: "blue" },
    2: { text: "تایید کارشناس", color: "cyan" },
    3: { text: "ارسال به فروش", color: "green" },
    4: { text: "رد کارشناس", color: "red" },
  };

  // ستون‌های جدول گزارش
  const columns = [
    {
      title: "کد محصول",
      dataIndex: "product_id",
      key: "product_id",
      width: 120,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "نام محصول",
      dataIndex: "product_name",
      key: "product_name",
      width: 250,
      ellipsis: true,
    },
    {
  title: "شخص سفارش‌دهنده",
  dataIndex: "user_name",
  key: "user_name",
  width: 220,
  render: (user_name, record) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Tag color="purple" icon={<UserOutlined />} style={{ margin: 0, width: "fit-content" }}>
        {user_name || "نامشخص"} - کد :  {record.user_customer_code}
      </Tag>
      
      
    </div>
  ),
},
    {
      title: "تعداد کل سفارش",
      dataIndex: "total_qty",
      key: "total_qty",
      width: 130,
      align: "center",
      render: (qty) => (
        <Badge
          count={qty}
          showZero
          overflowCount={999999}
          style={{ backgroundColor: "#52c41a" }}
        />
      ),
    },
    {
      title: "مبلغ کل",
      dataIndex: "total_price",
      key: "total_price",
      width: 150,
      render: (price) => (
        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
          {numberFormat(price)} تومان
        </span>
      ),
    },
    {
      title: "تعداد فاکتور",
      dataIndex: "order_count",
      key: "order_count",
      width: 110,
      align: "center",
      render: (count) => <Tag color="orange">{count} فاکتور</Tag>,
    },
    {
      title: "اولین سفارش",
      dataIndex: "first_order_date",
      key: "first_order_date",
      width: 120,
      render: (date) => (date ? dayjs(date).format("YYYY/MM/DD") : "-"),
    },
    {
      title: "آخرین سفارش",
      dataIndex: "last_order_date",
      key: "last_order_date",
      width: 120,
      render: (date) => (date ? dayjs(date).format("YYYY/MM/DD") : "-"),
    },
  ];

  // تابع جستجوی محصولات (با debounce)
  const handleProductSearch = (value) => {
    // پاک کردن تایمر قبلی
    if (productSearchTimeout) {
      clearTimeout(productSearchTimeout);
    }

    // اگر مقدار خالی بود، گزینه‌ها را خالی کن
    if (!value || value.trim() === "") {
      setProductOptions([]);
      return;
    }

    // تنظیم تایمر جدید برای جستجو
    const timeout = setTimeout(async () => {
      setProductSearchLoading(true);
      try {
        const res = await request(`/supplier-inventory/product-list?name=${encodeURIComponent(value)}&search_type=shortage`);
        
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
    }, 500); // 500 میلی‌ثانیه تاخیر

    setProductSearchTimeout(timeout);
  };

  // دریافت داده‌های گزارش
  const getData = (page = 1) => {
    setLoading(true);
 
    let url = `/order-api/product-report?page=${page}&pageSize=20`;

    if (productIdFilter) {
      url += `&product_id=${productIdFilter}`;
    }
    if (userIdFilter && userIdFilter.trim() !== "") {
      url += `&user_id=${userIdFilter.trim()}`;
    }
    if (statusFilter !== null && statusFilter !== "") {
      url += `&status=${statusFilter}`;
    }
    if (dateRange && dateRange.length === 2) {
      const fromDate = convertPersianToGregorian(dateRange[0]);
      const toDate = convertPersianToGregorian(dateRange[1]);
      if (fromDate) url += `&date_from=${fromDate}`;
      if (toDate) url += `&date_to=${toDate}`;
    }

    request(url)
      .then((res) => {
        if (res["success"]) {
          setData(res["data"]["reports"] || []);
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

  // بازنشانی فیلترها
  const resetFilters = () => {
    setProductIdFilter(null);
    setUserIdFilter("");
    setStatusFilter(null);
    setDateRange(null);
    setProductOptions([]);
    setCurrentPage(1);
    getData(1);
  };

  // تغییر صفحه
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getData(page);
  };

  useEffect(() => {
    if (supplierId > 0) {
      getData(1);
    }
  }, [supplierId]);

  // گزینه‌های وضعیت
  const statusOptions = [
    { value: 0, label: "معلق" },
    { value: 1, label: "ثبت شده" },
    { value: 2, label: "تایید کارشناس" },
    { value: 3, label: "ارسال به فروش" },
    { value: 4, label: "رد کارشناس" },
  ];

  return (
    <>
      <div className="flexible-header" style={{ textAlign: "right" }}>
        <br />
        <div className="flexible-header">
          {/* عنوان */}
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
              <FileTextOutlined /> گزارش سفارشات بر اساس محصول و مشتری
               
            </h3>

            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                بازنشانی فیلترها
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => getData(1)}
              >
                اعمال فیلتر
              </Button>
            </Space>
          </div>

          <br />

          {/* فیلترها */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
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
                filterOption={false} // غیرفعال کردن فیلتر محلی چون از API می‌آید
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
              <div style={{ marginBottom: 4 }}>شخص سفارش‌دهنده (کد کاربر):</div>
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
            <Col span={6}>
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
        </div>
      </div>

      <Divider />

      {/* کارت‌های خلاصه */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" style={{ backgroundColor: "#e6f7ff", borderColor: "#91d5ff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCartOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>تعداد محصولات</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#1890ff" }}>
                  {summary.total_products}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge
                count={summary.total_quantity}
                showZero
                overflowCount={999999}
                style={{ backgroundColor: "#52c41a", fontSize: 14, height: 24, lineHeight: "24px", minWidth: 24, borderRadius: 12 }}
              />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>مجموع تعداد</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#52c41a" }}>
                  {numberFormat(summary.total_quantity)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ backgroundColor: "#fff7e6", borderColor: "#ffd591" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarOutlined style={{ fontSize: 24, color: "#fa8c16" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>مجموع مبلغ</div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: "#fa8c16" }}>
                  {numberFormat(summary.total_price)} تومان
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ backgroundColor: "#f9f0ff", borderColor: "#d3adf7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined style={{ fontSize: 24, color: "#722ed1" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>تعداد فاکتورها</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#722ed1" }}>
                  {numberFormat(summary.total_orders)}
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
          rowKey={(record) => `${record.product_id}-${record.user_id}`}
          scroll={{ x: 1200 }}
        />
      </div>

      <Pagination
        all={pages}
        total={total}
        onChange={handlePageChange}
        current={currentPage}
      />
    </>
  );
}