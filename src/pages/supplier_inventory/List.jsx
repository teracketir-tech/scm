import { Button, Divider, Table, Tag, message, Modal, Descriptions, Timeline, Tabs, Card, Badge, Space, Tooltip,Row,Col } from "antd";
import { useEffect, useState } from "react";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HistoryOutlined, 
  DollarOutlined, 
  CreditCardOutlined,
  EyeOutlined 
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, confirm, numberFormat, request } from "../../module/util";

const { TabPane } = Tabs;

export default function List() {
  const { auth, navigate } = useAuthContext();
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(null);
  const [saleTypeFilter, setSaleTypeFilter] = useState(null); // null=همه، 0=نقدی، 1=اعتباری
  
  // State برای مودال تاریخچه
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logData, setLogData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [logActiveTab, setLogActiveTab] = useState("cash"); // cash یا credit

  // بررسی دسترسی برای عملیات
  const hasEditAccess = checkAccess(auth?.roles, [1601]);
  
  // گرفتن متن نوع فروش
  const getSaleTypeTag = (hasCredit) => {
    switch(hasCredit) {
      case 0:
        return <Tag color="blue">فقط نقدی</Tag>;
      case 1:
        return <Tag color="orange">فقط اعتباری</Tag>;
      case 2:
        return <Tag color="green">نقدی و اعتباری</Tag>;
      default:
        return <Tag color="default">نامشخص</Tag>;
    }
  };

  // ستون‌های جدول اصلی
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "کد محصول",
      dataIndex: "product_id",
      key: "product_id",
      width: 130,
    },
    {
      title: "نام محصول",
      dataIndex: "product_name",
      key: "product_name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "نوع فروش",
      dataIndex: "has_credit",
      key: "has_credit",
      width: 120,
      render: (hasCredit) => getSaleTypeTag(hasCredit),
    },
    {
      title: "قیمت نقدی",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price, record) => (
        record.has_credit !== 1 ? (
          <Tooltip title="قیمت فروش نقدی">
            <span style={{ color: '#1890ff' }}>
              {numberFormat(price)} تومان
            </span>
          </Tooltip>
        ) : <span className="text-muted">---</span>
      ),
    },
    {
      title: "موجودی نقدی",
      dataIndex: "product_count",
      key: "product_count",
      width: 100,
      render: (count, record) => (
        record.has_credit !== 1 ? (
          <Tag color={count > 0 ? "green" : "red"}>
            {numberFormat(count)} عدد
          </Tag>
        ) : <span className="text-muted">---</span>
      ),
    },
    {
      title: "قیمت اعتباری",
      dataIndex: "credit_price",
      key: "credit_price",
      width: 130,
      render: (price, record) => (
        record.has_credit !== 0 && price > 0 ? (
          <Tooltip title="قیمت فروش اعتباری">
            <span style={{ color: '#fa8c16' }}>
              {numberFormat(price)} تومان
            </span>
          </Tooltip>
        ) : <span className="text-muted">---</span>
      ),
    },
    {
      title: "موجودی اعتباری",
      dataIndex: "credit_product_count",
      key: "credit_product_count",
      width: 100,
      render: (count, record) => (
        record.has_credit !== 0 && count > 0 ? (
          <Tag color={count > 0 ? "gold" : "red"}>
            {numberFormat(count)} عدد
          </Tag>
        ) : <span className="text-muted">---</span>
      ),
    },
    {
      title: "تاریخ بروزرسانی",
      dataIndex: "update_date",
      key: "update_date",
      width: 110,
    },
    {
      title: "عملیات",
      key: "action",
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            className="text-info"
            icon={<HistoryOutlined />}
            onClick={() => handleShowLog(record)}
          >
            تاریخچه
          </Button>
          {hasEditAccess && (
            <>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => navigate(`/supplier-inventory/update?id=${record.id}`)}
              >
                ویرایش
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              >
                حذف
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // نمایش مودال تاریخچه
  const handleShowLog = async (record) => {
    setSelectedProduct(record);
    setLogModalVisible(true);
    setLogLoading(true);
    setLogActiveTab("cash");
    
    try {
      // دریافت لاگ‌های نقدی و اعتباری با هم
      const res = await request(`/product-inventory-log?supplier_inventory_id=${record.id}`, "GET");
      if (res["success"]) {
        setLogData(res["data"] || []);
      } else {
        message.error(res["message"] || "خطا در دریافت تاریخچه");
        setLogData([]);
      }
    } catch (error) {
      console.error("Log fetch error:", error);
      message.error("خطا در دریافت تاریخچه");
      setLogData([]);
    } finally {
      setLogLoading(false);
    }
  };

  // فیلتر کردن لاگ‌ها بر اساس نوع فروش
  const getFilteredLogs = (saleType) => {
    return logData.filter(log => log.sale_type === saleType);
  };

  const handleDelete = async (id) => {
    try {
      const isConfirmed = await confirm("آیا از حذف این محصول اطمینان دارید؟");
      if (isConfirmed) {
        const res = await request(`/supplier-inventory/${id}`, "DELETE");
        if (res["success"]) {
          message.success("محصول با موفقیت حذف شد");
          getData(params);
        } else {
          message.error(res["message"] || "خطا در حذف محصول");
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("خطا در حذف محصول");
    }
  };

  const getData = (searchParams) => {
    setLoading(true);
    let url = `/supplier-inventory?${searchParams || ""}`;
    
    // اضافه کردن فیلتر نوع فروش
    if (saleTypeFilter !== null) {
      url += `${searchParams ? "&" : ""}sale_type=${saleTypeFilter}`;
    }
    
    request(url)
      .then((res) => {
        if (res["success"]) {
          setData(res["data"]["list"] || []);
          setPages(res["data"]["pages"] || 0);
          setTotal(res["data"]["total"] || 0);
        } else {
          message.error(res["message"] || "خطا در دریافت اطلاعات");
        }
      })
      .catch((err) => {
        console.error("API error:", err);
        message.error("خطا در ارتباط با سرور");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // فیلترهای کامل با اضافه شدن فیلدهای اعتباری
  const filters = [
    { name: "id", type: "number", label: "شناسه" },
    { name: "product_id", type: "text", label: "کد محصول" },
    { name: "product_name", type: "text", label: "نام محصول" },
    { name: "price_from", type: "number", label: "قیمت نقدی از" },
    { name: "price_to", type: "number", label: "قیمت نقدی تا" },
    { name: "credit_price_from", type: "number", label: "قیمت اعتباری از" },
    { name: "credit_price_to", type: "number", label: "قیمت اعتباری تا" },
    { name: "product_count_from", type: "number", label: "موجودی نقدی از" },
    { name: "product_count_to", type: "number", label: "موجودی نقدی تا" },
    { name: "credit_product_count_from", type: "number", label: "موجودی اعتباری از" },
    { name: "credit_product_count_to", type: "number", label: "موجودی اعتباری تا" },
    { name: "price_valid_day_from", type: "number", label: "اعتبار قیمت نقدی از" },
    { name: "price_valid_day_to", type: "number", label: "اعتبار قیمت نقدی تا" },
    { name: "price_product_day_from", type: "number", label: "زمان تحویل نقدی از" },
    { name: "price_product_day_to", type: "number", label: "زمان تحویل نقدی تا" },
  ];

  useEffect(() => {
    getData(params);
  }, [params, saleTypeFilter]);

  // گرفتن رنگ و متن نوع لاگ
  const getLogTypeConfig = (type) => {
    switch(type) {
      case 1:
        return { color: "green", text: "ورود", dotColor: "green", icon: "+" };
      case 2:
        return { color: "red", text: "خروج", dotColor: "red", icon: "-" };
      case 3:
        return { color: "blue", text: "ثبت اولیه", dotColor: "blue", icon: "•" };
      default:
        return { color: "gray", text: "نامشخص", dotColor: "gray", icon: "?" };
    }
  };

  // رندر کردن لاگ‌ها در تایم‌لاین
  const renderLogTimeline = (logs) => {
    if (logs.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: 50, color: "#999" }}>
          هیچ تغییری در موجودی ثبت نشده است.
        </div>
      );
    }

    return (
      <Timeline
        mode="left"
        items={logs.map((log) => {
          const config = getLogTypeConfig(log.log_type);
          return {
            color: config.dotColor,
            label: (
              <div style={{ fontWeight: "bold" }}>
                {log.created_date?.split(" ")[0]}
                <br />
                <small style={{ fontSize: "11px", color: "#666" }}>
                  {log.created_date?.split(" ")[1]}
                </small>
              </div>
            ),
            children: (
              <Card size="small" style={{ marginBottom: 8 }}>
                <div>
                  <Tag color={config.color} icon={config.icon}>
                    {config.text}
                  </Tag>
                  <div style={{ marginTop: 8 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <span style={{ color: "#666" }}>مقدار تغییر:</span>
                        <br />
                        <strong style={{ color: config.color }}>
                          {config.icon} {numberFormat(Math.abs(log.quantity_change))} عدد
                        </strong>
                      </Col>
                      <Col span={8}>
                        <span style={{ color: "#666" }}>موجودی قبل:</span>
                        <br />
                        <strong>{numberFormat(log.quantity_before)} عدد</strong>
                      </Col>
                      <Col span={8}>
                        <span style={{ color: "#666" }}>موجودی بعد:</span>
                        <br />
                        <strong>{numberFormat(log.quantity_after)} عدد</strong>
                      </Col>
                    </Row>
                    {log.note && (
                      <div style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
                        <span>توضیحات: {log.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ),
          };
        })}
      />
    );
  };

  return (
    <>
      <div className="flexible-header" style={{textAlign:'right'}}>
        {/*محصولات نقدی*/}
       <br/>
        <div className="flexible-header">
          {/* فیلتر نوع فروش */}
          <div style={{ marginLeft: 16, display: "flex", gap: 8 }}>
            <Button 
              type={saleTypeFilter === null ? "primary" : "default"}
              onClick={() => setSaleTypeFilter(null)}
            >
              همه
            </Button>
            <Button 
              type={saleTypeFilter === 0 ? "primary" : "default"}
              icon={<DollarOutlined />}
              onClick={() => setSaleTypeFilter(0)}
            >
              نقدی
            </Button>
            <Button 
              type={saleTypeFilter === 1 ? "primary" : "default"}
              icon={<CreditCardOutlined />}
              onClick={() => setSaleTypeFilter(1)}
            >
              اعتباری
            </Button>
          </div>
          <br/>
          <Filters fields={filters} getData={getData} setParams={setParams} />
          
          {hasEditAccess && (
            <Button
              type="primary"
              className="AZ-primary-btn gap-1"
              icon={<PlusOutlined />}
              onClick={() => navigate("/supplier-inventory/create")}
            >
              محصول جدید
            </Button>
          )}
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
          scroll={{ x: 1400 }}
        />
      </div>
      
      <Pagination all={pages} total={total} />

      {/* مودال تاریخچه موجودی با تب‌های نقدی و اعتباری */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <EyeOutlined />
            <span>تاریخچه موجودی</span>
            <Tag color="blue">{selectedProduct?.product_id}</Tag>
            <strong>{selectedProduct?.product_name}</strong>
          </div>
        }
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={null}
        width={900}
      >
        {logLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>در حال بارگذاری...</div>
        ) : (
          <>
            {/* خلاصه موجودی فعلی */}
            {selectedProduct && (
              <Card 
                title="اطلاعات فعلی محصول" 
                size="small" 
                style={{ marginBottom: 20, backgroundColor: "#f5f5f5" }}
              >
                <Row gutter={16}>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>کد محصول:</span>
                      <br />
                      <strong>{selectedProduct.product_id}</strong>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>نام محصول:</span>
                      <br />
                      <strong>{selectedProduct.product_name}</strong>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>موجودی نقدی:</span>
                      <br />
                      <Tag color={selectedProduct.product_count > 0 ? "green" : "red"}>
                        {numberFormat(selectedProduct.product_count)} عدد
                      </Tag>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>موجودی اعتباری:</span>
                      <br />
                      <Tag color={selectedProduct.credit_product_count > 0 ? "gold" : "red"}>
                        {numberFormat(selectedProduct.credit_product_count)} عدد
                      </Tag>
                    </div>
                  </Col>
                </Row>
                <Divider style={{ margin: "12px 0" }} />
                <Row gutter={16}>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>قیمت نقدی:</span>
                      <br />
                      <span style={{ color: "#1890ff" }}>
                        {numberFormat(selectedProduct.price)} تومان
                      </span>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>قیمت اعتباری:</span>
                      <br />
                      <span style={{ color: "#fa8c16" }}>
                        {numberFormat(selectedProduct.credit_price)} تومان
                      </span>
                    </div>
                  </Col>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>اعتبار قیمت نقدی:</span>
                      <br />
                      {selectedProduct.price_valid_day} روز
                    </div>
                  </Col>
                  <Col span={6}>
                    <div>
                      <span style={{ color: "#666" }}>مهلت سررسید اعتبار:</span>
                      <br />
                      {selectedProduct.credit_due_date || "---"} روز
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            {/* تب‌های تاریخچه نقدی و اعتباری */}
            <Tabs 
              activeKey={logActiveTab} 
              onChange={setLogActiveTab}
              type="card"
              items={[
                {
                  key: "cash",
                  label: (
                    <span>
                      <DollarOutlined style={{ color: "#1890ff" }} />
                      {" "}تاریخچه نقدی
                      <Badge 
                        count={getFilteredLogs(0).length} 
                        style={{ backgroundColor: "#1890ff", marginRight: 8 }} 
                      />
                    </span>
                  ),
                  children: renderLogTimeline(getFilteredLogs(0))
                },
                {
                  key: "credit",
                  label: (
                    <span>
                      <CreditCardOutlined style={{ color: "#fa8c16" }} />
                      {" "}تاریخچه اعتباری
                      <Badge 
                        count={getFilteredLogs(1).length} 
                        style={{ backgroundColor: "#fa8c16", marginRight: 8 }} 
                      />
                    </span>
                  ),
                  children: renderLogTimeline(getFilteredLogs(1))
                }
              ]}
            />
          </>
        )}
      </Modal>
    </>
  );
}