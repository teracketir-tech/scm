import { Button, Divider, Table, Tag, message, Card, Space, Row, Col, Select, Input, Switch, Progress, Tooltip } from "antd";
import { useEffect, useState } from "react";
import {
  WarningOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AlertOutlined,
  FileExcelOutlined,
  SendOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import Pagination from "../../components/Pagination";
import { numberFormat, request } from "../../module/util";
import dayjs from "dayjs";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/colors/green.css";
import ProductOrderModal from "./ProductOrderModal";

export default function ReorderPoints() {
  const { auth } = useAuthContext();
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  // فیلترها
  const [productIdFilter, setProductIdFilter] = useState("");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [trackcodeFilter, setTrackcodeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [statusLevelFilter, setStatusLevelFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [includeNear, setIncludeNear] = useState(false);

  // Stateهای مودال سفارش
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState(null);

  // آمار
  const [statistics, setStatistics] = useState({
    total_products_with_min_qty: 0,
    out_of_stock_count: 0,
    critical_count: 0,
    near_threshold_count: 0,
    healthy_count: 0,
    ordered_count: 0,
    restocked_count: 0,
  });

  // ✅ گزینه‌های وضعیت (6 حالت)
  const statusLevelOptions = [
    { value: "out_of_stock", label: "ناموجود", color: "red" },
    { value: "critical", label: "بحرانی", color: "volcano" },
    { value: "near", label: "نزدیک به نقطه سفارش", color: "orange" },
    { value: "healthy", label: "سالم", color: "green" },
    { value: "ordered", label: "ارسال شده به تامین‌کننده", color: "blue" },
    { value: "restocked", label: "موجود شد", color: "cyan" },
  ];

  // گزینه‌های وضعیت فعال/غیرفعال محصول
  const statusOptions = [
    { value: 1, label: "فعال" },
    { value: 0, label: "غیرفعال" },
  ];

  // تبدیل تاریخ شمسی به میلادی
  const convertPersianToGregorian = (date) => {
    if (!date) return null;
    const gregorianDate = date.toDate();
    return dayjs(gregorianDate).format("YYYY-MM-DD");
  };
const calculateDaysAgo = (date) => {
  if (!date) return 0;
  const now = dayjs();
  const targetDate = dayjs(date);
  return now.diff(targetDate, 'day');
};
  // توابع مودال سفارش
  const handleOrderClick = (record) => {
    setSelectedProductForOrder(record);
    setOrderModalVisible(true);
  };

  const handleCloseOrderModal = () => {
    setOrderModalVisible(false);
    setSelectedProductForOrder(null);
  };

  const handleOrderSuccess = () => {
    message.success("درخواست با موفقیت ثبت شد");
    getData("");
    getStatistics();
  };

  // ستون‌های جدول
  const columns = [
    {
      title: "کد محصول",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: "شناسه کالا",
      dataIndex: "trackcode",
      key: "trackcode",
      width: 150,
      render: (trackcode) => trackcode || "-",
    },
    {
      title: "نام محصول",
      dataIndex: "name",
      key: "name",
      width: 280,
      ellipsis: true,
    },
    {
      title: "موجودی فعلی",
      dataIndex: "Mojodi",
      key: "Mojodi",
      width: 120,
      align: "center",
      render: (mojodi) => {
        const color = mojodi <= 0 ? "red" : mojodi <= 10 ? "volcano" : "blue";
        return <Tag color={color}>{numberFormat(mojodi)} عدد</Tag>;
      },
    },
    {
      title: "نقطه سفارش",
      dataIndex: "MinQty",
      key: "MinQty",
      width: 120,
      align: "center",
      render: (minQty) => <Tag color="purple">{numberFormat(minQty)} عدد</Tag>,
    },
    {
      title: "کسری تا نقطه سفارش",
      dataIndex: "shortage_amount",
      key: "shortage_amount",
      width: 150,
      align: "center",
      render: (amount, record) => {
        if (record.Mojodi > record.MinQty) {
          return <Tag color="green">تأمین شده</Tag>;
        }
        return (
          <Tag color="red" icon={<WarningOutlined />} style={{ fontSize: 13, padding: "4px 8px" }}>
            {numberFormat(amount)} عدد
          </Tag>
        );
      },
    },
    {
      title: "درصد کسری",
      dataIndex: "shortage_ratio",
      key: "shortage_ratio",
      width: 180,
      align: "center",
      render: (ratio, record) => {
        if (record.Mojodi > record.MinQty) {
          return <Tag color="green">-</Tag>;
        }

        let color = "#faad14";
        if (ratio >= 100) color = "#ff4d4f";
        else if (ratio >= 50) color = "#fa8c16";
        else if (ratio >= 20) color = "#faad14";
        else color = "#52c41a";

        const displayRatio = Math.min(ratio, 100);

        return (
          <Tooltip title={`${ratio}% کسری`}>
            <Progress
              percent={displayRatio}
              strokeColor={color}
              size="small"
              format={() => `${ratio}%`}
            />
          </Tooltip>
        );
      },
    },
    // ✅ ستون وضعیت - با پشتیبانی از وضعیت‌های سفارش
    {
      title: "وضعیت",
      dataIndex: "status_level",
      key: "status_level",
      width: 180,
      align: "center",
      render: (level, record) => {
        // ✅ اول وضعیت سفارش رو چک کن (اولویت داره)
        if (record.order_status === "ordered") {
          return (
            <Tooltip title={`موجودی در زمان سفارش: ${numberFormat(record.last_mojodi || 0)} عدد`}>
              <Tag color="blue" icon={<SendOutlined />} style={{ fontSize: 13, padding: "4px 8px" }}>
                ارسال شده به تامین‌کننده
              </Tag>
            </Tooltip>
          );
        }
        if (record.order_status === "restocked") {
          return (
            <Tag color="cyan" icon={<SyncOutlined />} style={{ fontSize: 13, padding: "4px 8px" }}>
              موجود شد
            </Tag>
          );
        }

        // بعد وضعیت عادی (بر اساس Mojodi و MinQty)
        if (level === "out_of_stock") {
          return <Tag color="red" icon={<CloseCircleOutlined />}>ناموجود</Tag>;
        }
        if (level === "critical") {
          return <Tag color="volcano" icon={<ExclamationCircleOutlined />}>بحرانی</Tag>;
        }
        if (level === "near") {
          return <Tag color="orange" icon={<AlertOutlined />}>نزدیک</Tag>;
        }
        if (level === "healthy") {
          return <Tag color="green" icon={<CheckCircleOutlined />}>سالم</Tag>;
        }
        return <Tag>-</Tag>;
      },
    },
    {
      title: "قیمت آخرین",
      dataIndex: "LastPrice",
      key: "LastPrice",
      width: 130,
      render: (price) => (
        <span style={{ color: "#1890ff" }}>{numberFormat(price)} تومان</span>
      ),
    },
    {
      title: "تاریخ بروزرسانی",
      dataIndex: "UpdateTime",
      key: "UpdateTime",
      width: 120,
      render: (date) => date || "-",
    },

    // بعد از ستون "تاریخ بروزرسانی":
{
  title: "تاریخ رسیدن به نقطه سفارش",
  dataIndex: "reach_reorder_point_date_fa",
  key: "reach_reorder_point_date_fa",
  width: 150,
  align: "center",
  render: (date, record) => {
    if (!date) return <Tag color="default">-</Tag>;
    
    // محاسبه تعداد روز گذشته
    const daysAgo = calculateDaysAgo(record.reach_reorder_point_date);
    const color = daysAgo > 30 ? "red" : daysAgo > 7 ? "orange" : "blue";
    
    return (
      <Tooltip title={`${daysAgo} روز پیش`}>
        <Tag color={color}>{date}</Tag>
      </Tooltip>
    );
  },
},
{
  title: "تاریخ ارسال به تامین‌کننده",
  dataIndex: "send_to_supplier_date_fa",
  key: "send_to_supplier_date_fa",
  width: 160,
  align: "center",
  render: (date, record) => {
    if (!date) return <Tag color="default">-</Tag>;
    
    const daysAgo = calculateDaysAgo(record.send_to_supplier_date);
    const color = daysAgo > 30 ? "red" : daysAgo > 7 ? "orange" : "blue";
    
    return (
      <Tooltip title={`${daysAgo} روز پیش`}>
        <Tag color={color}>{date}</Tag>
      </Tooltip>
    );
  },
},
{
  title: "تاریخ تامین کالا",
  dataIndex: "supply_date_fa",
  key: "supply_date_fa",
  width: 140,
  align: "center",
  render: (date, record) => {
    if (!date) return <Tag color="default">-</Tag>;
    
    const daysAgo = calculateDaysAgo(record.supply_date);
    
    return (
      <Tooltip title={`${daysAgo} روز پیش`}>
        <Tag color="green">{date}</Tag>
      </Tooltip>
    );
  },
},
    // ✅ ستون عملیات - دکمه سفارش (غیرفعال اگر قبلاً سفارش داده شده)
    {
      title: "عملیات",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => {
        const isAlreadyOrdered = record.status_mojodi === 1;
        
        return (
          <Tooltip 
            title={isAlreadyOrdered ? "این محصول قبلاً سفارش داده شده است" : ""}
          >
            <Button
              type="primary"
              size="small"
              icon={<ShoppingCartOutlined />}
              onClick={() => handleOrderClick(record)}
              disabled={isAlreadyOrdered}
            >
              سفارش
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  // دریافت آمار
  const getStatistics = () => {
    request("/order-api/reorder-points-statistics")
      .then((res) => {
        if (res["success"]) {
          setStatistics(res["data"] || {});
        }
      })
      .catch((err) => {
        console.error("Statistics error:", err);
      });
  };

  // ساخت URL با فیلترها
  const buildUrl = (params = "", excel = 0) => {
    let filterParams = "";
    if (productIdFilter && productIdFilter.trim() !== "") {
      filterParams += `&product_id=${productIdFilter.trim()}`;
    }
    if (productNameFilter && productNameFilter.trim() !== "") {
      filterParams += `&product_name=${encodeURIComponent(productNameFilter.trim())}`;
    }
    if (trackcodeFilter && trackcodeFilter.trim() !== "") {
      filterParams += `&trackcode=${trackcodeFilter.trim()}`;
    }
    if (statusFilter !== null && statusFilter !== "") {
      filterParams += `&status=${statusFilter}`;
    }
    if (statusLevelFilter) {
      filterParams += `&status_level=${statusLevelFilter}`;
    }
    if (dateRange && dateRange.length === 2) {
      const fromDate = convertPersianToGregorian(dateRange[0]);
      const toDate = convertPersianToGregorian(dateRange[1]);
      if (fromDate) filterParams += `&date_from=${fromDate}`;
      if (toDate) filterParams += `&date_to=${toDate}`;
    }
    filterParams += `&include_near=${includeNear ? "true" : "false"}`;
    filterParams += `&pageSize=20`;
    filterParams += `&excel=${excel}`;

    const pageParam = params && params.trim() !== "" ? params : "page=1";
    return `/order-api/reorder-points?${pageParam}${filterParams}`;
  };

  // دریافت داده‌ها
  const getData = (params = "") => {
    setLoading(true);
    const url = buildUrl(params, 0);

    request(url)
      .then((res) => {
        if (res["success"]) {
          setData(res["data"]["products"] || []);
          setPages(res["data"]["pagination"]["totalPages"] || 0);
          setTotal(res["data"]["pagination"]["totalCount"] || 0);
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
    const url = buildUrl("page=1", 1);

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

  // بازنشانی فیلترها
  const resetFilters = () => {
    setProductIdFilter("");
    setProductNameFilter("");
    setTrackcodeFilter("");
    setStatusFilter(null);
    setStatusLevelFilter(null);
    setDateRange(null);
    setIncludeNear(false);
    setTimeout(() => getData(""), 50);
  };

  // بارگذاری اولیه
  useEffect(() => {
    getData("");
    getStatistics();
  }, []);

  // وقتی includeNear عوض شد، دوباره لود کن
  useEffect(() => {
    getData("");
  }, [includeNear]);

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
              <AlertOutlined style={{ color: "#faad14" }} /> نقطه سفارش محصولات
            </h3>

            <Space wrap>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>نمایش محصولات نزدیک به نقطه سفارش:</span>
                <Switch
                  checked={includeNear}
                  onChange={(checked) => setIncludeNear(checked)}
                />
              </div>
              <Button icon={<ReloadOutlined />} onClick={() => resetFilters()}>
                بازنشانی
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => getData("")}
              >
                اعمال فیلتر
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

          {/* فیلترها */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>کد محصول:</div>
              <Input
                placeholder="کد محصول"
                value={productIdFilter}
                onChange={(e) => setProductIdFilter(e.target.value)}
                onPressEnter={() => getData("")}
                allowClear
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>نام محصول:</div>
              <Input
                placeholder="نام محصول"
                value={productNameFilter}
                onChange={(e) => setProductNameFilter(e.target.value)}
                onPressEnter={() => getData("")}
                allowClear
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>شناسه کالا:</div>
              <Input
                placeholder="شناسه کالا"
                value={trackcodeFilter}
                onChange={(e) => setTrackcodeFilter(e.target.value)}
                onPressEnter={() => getData("")}
                allowClear
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 4 }}>وضعیت محصول:</div>
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

          {/* ردیف دوم فیلترها */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <div style={{ marginBottom: 4 }}>وضعیت نقطه سفارش:</div>
              <Select
                placeholder="همه"
                allowClear
                style={{ width: "100%" }}
                value={statusLevelFilter}
                onChange={setStatusLevelFilter}
                options={statusLevelOptions}
                optionRender={(option) => (
                  <Space>
                    <Tag color={option.data.color} style={{ margin: 0 }}>
                      {option.data.label}
                    </Tag>
                  </Space>
                )}
              />
            </Col>
            <Col span={16}>
              <div style={{ marginBottom: 4 }}>بازه تاریخ بروزرسانی (شمسی):</div>
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

      {/* کارت‌های آماری - 7 کارت */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#f0f5ff", borderColor: "#adc6ff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShoppingCartOutlined style={{ fontSize: 20, color: "#2f54eb" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>کل محصولات</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#2f54eb" }}>
                  {numberFormat(statistics.total_products_with_min_qty)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#fff1f0", borderColor: "#ffa39e" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CloseCircleOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>ناموجود</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#ff4d4f" }}>
                  {numberFormat(statistics.out_of_stock_count)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#fff2e8", borderColor: "#ffbb96" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ExclamationCircleOutlined style={{ fontSize: 20, color: "#fa541c" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>بحرانی</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#fa541c" }}>
                  {numberFormat(statistics.critical_count)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#fff7e6", borderColor: "#ffd591" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>نزدیک به نقطه سفارش</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#fa8c16" }}>
                  {numberFormat(statistics.near_threshold_count)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#f6ffed", borderColor: "#b7eb8f" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>سالم</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#52c41a" }}>
                  {numberFormat(statistics.healthy_count)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        {/* ✅ کارت جدید: ارسال شده به تامین‌کننده */}
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#e6f7ff", borderColor: "#91d5ff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SendOutlined style={{ fontSize: 20, color: "#1890ff" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>ارسال به تامین‌کننده</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                  {numberFormat(statistics.ordered_count || 0)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        {/* ✅ کارت جدید: موجود شد */}
        <Col span={3}>
          <Card size="small" style={{ backgroundColor: "#e6fffb", borderColor: "#87e8de" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SyncOutlined style={{ fontSize: 20, color: "#13c2c2" }} />
              <div>
                <div style={{ color: "#666", fontSize: 11 }}>موجود شد</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#13c2c2" }}>
                  {numberFormat(statistics.restocked_count || 0)}
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
          scroll={{ x: 1600 }}
          rowClassName={(record) => {
            // ✅ اگر وضعیت سفارش داره، رنگ متفاوت
            if (record.order_status === "ordered") return "ordered-row";
            if (record.order_status === "restocked") return "restocked-row";
            if (record.status_level === "out_of_stock") return "out-of-stock-row";
            if (record.status_level === "critical") return "critical-row";
            if (record.status_level === "near") return "near-row";
            return "";
          }}
        />
      </div>

      <Pagination all={pages} getData={getData} no_url={true} />

      <ProductOrderModal
        open={orderModalVisible}
        onClose={handleCloseOrderModal}
        product={selectedProductForOrder}
        onSuccess={handleOrderSuccess}
      />
    </>
  );
}