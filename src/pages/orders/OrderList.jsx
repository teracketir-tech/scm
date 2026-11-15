import { Button, Divider, Table, Tag, message, Modal, Card, Badge, Space, Row, Col, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { 
  DollarOutlined, 
  CreditCardOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { numberFormat, request } from "../../module/util";
import dayjs from "dayjs";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/colors/green.css";

const { RangePicker } = DatePicker;

export default function OrderList() {
  const { auth, navigate } = useAuthContext();
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(null);
  
  // فیلترهای اضافی
  const [statusFilter, setStatusFilter] = useState(null);
  const [payStatusFilter, setPayStatusFilter] = useState(null);
  const [payStatusEnabled, setPayStatusEnabled] = useState(false);
  const [orderTypeFilter, setOrderTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null); // برای ذخیره تاریخ شمسی
  
  // مودال جزئیات سفارش
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // مودال به‌روزرسانی وضعیت
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // supplier_id از auth
  const supplierId = auth?.id || 0;

  // تبدیل تاریخ شمسی به میلادی برای ارسال به API
  const convertPersianToGregorian = (date) => {
    if (!date) return null;
    // date از نوع DatePicker است
    const gregorianDate = date.toDate(); // تبدیل به شی Date میلادی
    return dayjs(gregorianDate).format("YYYY-MM-DD");
  };

  // وضعیت‌های سفارش
  const statusMap = {
    0: { text: "معلق", color: "default" },
    1: { text: "ثبت شده", color: "blue" },
    2: { text: "تایید کارشناس", color: "cyan" },
    3: { text: "ارسال به فروش", color: "green" },
    4: { text: "رد کارشناس", color: "red" }
  };

  // نوع پرداخت (نقدی/اعتباری)
  const payTypeMap = {
    1: { text: "نقدی", color: "green", icon: <DollarOutlined /> },
    2: { text: "اعتباری", color: "orange", icon: <CreditCardOutlined /> }
  };

  // ستون‌های جدول اصلی
  const columns = [
    {
      title: "شماره سفارش",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: true,
    },
    {
      title: "تاریخ سفارش",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => dayjs(date).format("YYYY/MM/DD HH:mm"),
      sorter: true,
    },
    {
      title: "شناسه کاربر",
      dataIndex: "user_id",
      key: "user_id",
      width: 100,
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
      sorter: true,
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
      title: "وضعیت سفارش",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusInfo = statusMap[status] || { text: "نامشخص", color: "default" };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: "تعداد اقلام",
      dataIndex: "items_count",
      key: "items_count",
      width: 90,
      align: "center",
      render: (count) => <Badge count={count} showZero />,
    },
    {
      title: "عملیات",
      key: "action",
      width: 120,
      fixed: 'right',
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

  // دریافت داده‌ها از API
  const getData = (searchParams) => {
    setLoading(true);
    
    // ساخت URL با فیلترها
    let url = `/order-api?supplier_id=${supplierId}&pageSize=20`;
    
    if (searchParams) {
      url += `&${searchParams}`;
    }
    
    // اضافه کردن فیلترهای اضافی
    if (statusFilter !== null && statusFilter !== "") {
      url += `&status=${statusFilter}`;
    }
    if (payStatusEnabled && payStatusFilter !== null && payStatusFilter !== "") {
      url += `&pay_status=${payStatusFilter}`;
    }
    if (orderTypeFilter) {
      url += `&pay_type=${orderTypeFilter}`;
    }
    
    // اضافه کردن فیلتر تاریخ شمسی (تبدیل شده به میلادی)
    if (dateRange && dateRange.length === 2) {
      const fromDate = convertPersianToGregorian(dateRange[0]);
      const toDate = convertPersianToGregorian(dateRange[1]);
      if (fromDate) url += `&date_from=${fromDate}`;
      if (toDate) url += `&date_to=${toDate}`;
    }
    
    request(url)
      .then((res) => {
        if (res["success"]) {
          setData(res["data"]["orders"] || []);
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

  // تغییر صفحه
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(params || "");
    newParams.set("page", page);
    setParams(newParams.toString());
  };

  // بازنشانی فیلترها
  const resetFilters = () => {
    setStatusFilter(null);
    setPayStatusFilter(null);
    setPayStatusEnabled(false);
    setOrderTypeFilter(null);
    setDateRange(null);
    setParams(null);
  };

  useEffect(() => {
    if (supplierId > 0) {
      getData(params);
    }
  }, [params, statusFilter, payStatusFilter, payStatusEnabled, orderTypeFilter, dateRange, supplierId]);

  // گزینه‌های وضعیت برای فیلتر
  const statusOptions = [
    { value: 0, label: "معلق" },
    { value: 1, label: "ثبت شده" },
    { value: 2, label: "تایید کارشناس" },
    { value: 3, label: "ارسال به فروش" },
    { value: 4, label: "رد کارشناس" }
  ];

  // گزینه‌های نوع سفارش (نقدی/اعتباری)
  const orderTypeOptions = [
    { value: 1, label: "نقدی", icon: <DollarOutlined /> },
    { value: 2, label: "اعتباری", icon: <CreditCardOutlined /> }
  ];

  return (
    <>
      <div className="flexible-header" style={{ textAlign: 'right' }}>
        <br/>
        <div className="flexible-header">
          {/* عنوان و فیلترها */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <h3 style={{ margin: 0 }}>
              <CreditCardOutlined /> لیست سفارشات تامین‌کننده
              <Tag color="blue" style={{ marginRight: 8 }}>کد تامین‌کننده: {supplierId}</Tag>
            </h3>
            
            <Space wrap>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => resetFilters()}
              >
                بازنشانی فیلترها
              </Button>
            </Space>
          </div>

          <br/>

          {/* فیلترهای سریع */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
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
            <Col span={12}>
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

          <br/>
          
          {/* فیلترهای پیشرفته */}
          <Filters fields={[]} getData={getData} setParams={setParams} />
        </div>
      </div>
      
      <Divider />
      
      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          style={{ textAlign: "center" }}
          className="ant-border-space"
          rowKey="id"
          scroll={{ x: 1200 }}
        />
      </div>
      
      <Pagination all={pages} total={total} onChange={handlePageChange} />

      {/* مودال جزئیات سفارش */}
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
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={1000}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>در حال بارگذاری...</div>
        ) : selectedOrder ? (
          <>
            {/* اطلاعات اصلی سفارش */}
            <Card size="small" style={{ marginBottom: 20, backgroundColor: "#f5f5f5" }}>
              <Row gutter={16}>
                <Col span={6}>
                  <div><span style={{ color: "#666" }}>شماره سفارش:</span><br/><strong>{selectedOrder.id}</strong></div>
                </Col>
                <Col span={6}>
                  <div><span style={{ color: "#666" }}>شناسه کاربر:</span><br/><strong>{selectedOrder.user_id}</strong></div>
                </Col>
                <Col span={6}>
                  <div><span style={{ color: "#666" }}>تاریخ ثبت:</span><br/><strong>{dayjs(selectedOrder.date).format("YYYY/MM/DD HH:mm")}</strong></div>
                </Col>
                <Col span={6}>
                  <div><span style={{ color: "#666" }}>نوع سفارش:</span><br/>
                    <Tag color={payTypeMap[selectedOrder.pay_type]?.color} icon={payTypeMap[selectedOrder.pay_type]?.icon}>
                      {payTypeMap[selectedOrder.pay_type]?.text || "نامشخص"}
                    </Tag>
                  </div>
                </Col>
              </Row>
              <Divider style={{ margin: "12px 0" }} />
              <Row gutter={16}>
                <Col span={24}>
                  <div><span style={{ color: "#666" }}>توضیحات:</span><br/>{selectedOrder.note || "---"}</div>
                </Col>
              </Row>
            </Card>

            {/* اقلام سفارش */}
            <div style={{ marginBottom: 16 }}>
              <strong>اقلام سفارش ({selectedOrder.items_count} قلم)</strong>
            </div>
            <Table
              dataSource={selectedOrder.items}
              pagination={false}
              size="small"
              rowKey="id"
              columns={[
                { title: "شناسه", dataIndex: "id", width: 70 },
                { title: "کد محصول", dataIndex: "product_id", width: 100 },
                { title: "نام محصول", dataIndex: "product_name", width: 200, ellipsis: true },
                { title: "تعداد سفارش", dataIndex: "qty", width: 80, align: "center", render: (qty) => <Tag color="blue">{numberFormat(qty)} عدد</Tag> },
               { title: "تعداد دریافتی", dataIndex: "qty_received", width: 80, align: "center", render: (qty_received) => <Tag color="red">{numberFormat(qty_received)} عدد</Tag> },
               
                { title: "قیمت واحد", dataIndex: "price", width: 120, render: (price) => numberFormat(price) + " تومان" },
                { title: "قیمت نهایی", dataIndex: "final_price", width: 130, render: (price) => <span style={{ color: "#52c41a" }}>{numberFormat(price)} تومان</span> },
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