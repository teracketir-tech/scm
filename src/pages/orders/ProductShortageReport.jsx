import { Button, Divider, Table, Tag, message, Card, Badge, Space, Row, Col, Select, Input, Progress, Tooltip } from "antd";
import { useEffect, useState } from "react";
import {
  WarningOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import Pagination from "../../components/Pagination";
import { numberFormat, request } from "../../module/util";
import dayjs from "dayjs";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from "react-date-object";
import { useLocation, useNavigate } from "react-router-dom";
import "react-multi-date-picker/styles/colors/green.css";

const { Option } = Select;

export default function ProductShortageReport() {
  const { auth } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // فیلترها
  const [productIdFilter, setProductIdFilter] = useState(null);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  // گزینه‌های محصول
  const [productOptions, setProductOptions] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [productSearchTimeout, setProductSearchTimeout] = useState(null);

  // خلاصه آمار
  const [summary, setSummary] = useState({
    total_products: 0,
    total_quantity: 0,
    total_quantity_received: 0,
    total_shortage: 0,
    total_orders: 0,
  });

  // خواندن صفحه از URL
  const getPageFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const p = parseInt(params.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  };

  // تبدیل/نمایش تاریخ — اگر میلادی بود به شمسی، اگر شمسی بود خودش
  const toJalali = (date, withTime = false) => {
    if (!date) return "-";

    if (typeof date === "string") {
      const yearMatch = date.match(/^(\d{4})[\/\-]/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1], 10);
        if (year < 1900) {
          return date;
        }
      }
    }

    try {
      const d = dayjs(date);
      if (!d.isValid()) return "-";

      if (d.year() < 1900) {
        return withTime ? d.format("YYYY/MM/DD HH:mm") : d.format("YYYY/MM/DD");
      }

      return new DateObject({
        date: d.toDate(),
        calendar: persian,
        locale: persian_fa,
      }).format(withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD");
    } catch (e) {
      return "-";
    }
  };

  // تبدیل تاریخ شمسی به میلادی
  const convertPersianToGregorian = (date) => {
    if (!date) return null;
    const gregorianDate = date.toDate();
    return dayjs(gregorianDate).format("YYYY-MM-DD");
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

  // ستون‌های جدول
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
      title: "تعداد کل سفارش",
      dataIndex: "total_qty",
      key: "total_qty",
      width: 130,
      align: "center",
      sorter: true,
      render: (qty) => (
        <Tag color="blue">{numberFormat(qty)} عدد</Tag>
      ),
    },
    {
      title: "تعداد دریافتی",
      dataIndex: "total_qty_received",
      key: "total_qty_received",
      width: 130,
      align: "center",
      sorter: true,
      render: (qty) => (
        <Tag color="green">{numberFormat(qty)} عدد</Tag>
      ),
    },
    {
      title: "مجموع کسری",
      dataIndex: "total_shortage_qty",
      key: "total_shortage_qty",
      width: 130,
      align: "center",
      sorter: true,
      render: (qty) => (
        <Tag color="red" icon={<WarningOutlined />} style={{ fontSize: 14, padding: "4px 8px" }}>
          {numberFormat(qty)} عدد
        </Tag>
      ),
    },
    {
      title: "درصد کسری",
      dataIndex: "shortage_percentage",
      key: "shortage_percentage",
      width: 150,
      align: "center",
      sorter: true,
      render: (percentage) => {
        let color = "#52c41a";
        if (percentage >= 50) color = "#ff4d4f";
        else if (percentage >= 20) color = "#fa8c16";
        else if (percentage >= 5) color = "#faad14";

        return (
          <Tooltip title={`${percentage}%`}>
            <Progress
              percent={percentage}
              strokeColor={color}
              size="small"
              format={(p) => `${p}%`}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "تعداد فاکتور",
      dataIndex: "order_count",
      key: "order_count",
      width: 110,
      align: "center",
      sorter: true,
      render: (count) => <Tag color="orange">{count} فاکتور</Tag>,
    },
    {
      title: "تعداد مشتری",
      dataIndex: "user_count",
      key: "user_count",
      width: 110,
      align: "center",
      sorter: true,
      render: (count) => (
        <Tag color="purple" icon={<UserOutlined />}>
          {count} نفر
        </Tag>
      ),
    },
    {
      title: "آخرین کسری",
      dataIndex: "last_shortage_date",
      key: "last_shortage_date",
      width: 120,
      render: (date) => toJalali(date, false),
    },
  ];

  // ساخت URL (بدون supplier_id)
  const buildUrl = (page = 1) => {
    let url = `/order-api/product-shortage-report?page=${page}&pageSize=20`;

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

    return url;
  };

  // دریافت داده‌ها
  const getData = (page = 1) => {
    setLoading(true);
    const url = buildUrl(page);

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

  // تغییر صفحه: URL را عوض می‌کند تا useEffect دوباره داده بگیرد
  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
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

  // هر بار URL عوض شد، دیتا بگیر
  useEffect(() => {
    const page = getPageFromUrl();
    setCurrentPage(page);
    getData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
              <WarningOutlined style={{ color: "#faad14" }} /> گزارش کسری محصولات
            </h3>

            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => resetFilters()}>
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

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={5}>
          <Card size="small" style={{ backgroundColor: "#e6f7ff", borderColor: "#91d5ff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCartOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>تعداد محصولات</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#1890ff" }}>
                  {numberFormat(summary.total_products)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarOutlined style={{ fontSize: 24, color: "#52c41a" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>مجموع سفارش</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}>
                  {numberFormat(summary.total_quantity)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CreditCardOutlined style={{ fontSize: 24, color: "#52c41a" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>مجموع دریافتی</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}>
                  {numberFormat(summary.total_quantity_received)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ backgroundColor: "#fff1f0", borderColor: "#ffa39e" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <WarningOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />
              <div>
                <div style={{ color: "#666", fontSize: 12 }}>مجموع کسری</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#ff4d4f" }}>
                  {numberFormat(summary.total_shortage)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ backgroundColor: "#f9f0ff", borderColor: "#d3adf7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ExclamationCircleOutlined style={{ fontSize: 24, color: "#722ed1" }} />
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
          rowKey="product_id"
          scroll={{ x: 1300 }}
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