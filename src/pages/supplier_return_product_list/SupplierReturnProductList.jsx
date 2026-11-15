import { Button, Divider, Table, Tag, message, Modal, Card, Badge, Space, Row, Col, Select, Switch, Spin, Descriptions, Input } from "antd";
import { useEffect, useState } from "react";
import { 
  EyeOutlined, 
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
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

const { TextArea } = Input;

export default function SupplierReturnProductList() {
  const { auth, navigate } = useAuthContext();
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(null);
  
  // فیلترهای اضافی
  const [statusFilter, setStatusFilter] = useState(null);
  const [productIdFilter, setProductIdFilter] = useState('');
  const [folderIdFilter, setFolderIdFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  
  // مودال جزئیات
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // مودال تغییر وضعیت
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
    const [supplier, setSupplier] = useState({});


  // supplier_id از auth (برای تامین‌کننده لاگین شده)
  const supplierId = auth?.id || 0;

  // تبدیل تاریخ شمسی به میلادی
  const convertPersianToGregorian = (date) => {
    if (!date) return null;
    const gregorianDate = date.toDate();
    return dayjs(gregorianDate).format("YYYY-MM-DD");
  };

  // وضعیت‌های تخصیص
  const statusMap = {
    1: { text: "در انتظار بررسی", color: "warning", icon: <ClockCircleOutlined /> },
    2: { text: "تایید شده", color: "success", icon: <CheckOutlined /> },
    '-1': { text: "رد شده", color: "error", icon: <CloseOutlined /> }
  };

  // ستون‌های جدول اصلی
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: true,
    },
    {
      title: "کد محصول",
      dataIndex: "product_id",
      key: "product_id",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "شماره پرونده",
      dataIndex: "folder_id",
      key: "folder_id",
      width: 100,
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (quantity) => (
        <span style={{ fontWeight: "bold", fontSize: "16px", color: "#1890ff" }}>
          {numberFormat(quantity)}
        </span>
      ),
      sorter: true,
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => {
        const statusInfo = statusMap[status] || { text: "نامشخص", color: "default", icon: null };
        return (
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "تاریخ ثبت",
      dataIndex: "create_date_fa",
      key: "create_date_fa",
      width: 150,
      render: (date) => dayjs(date).format("YYYY/MM/DD"),
      sorter: true,
    },
    {
      title: "تاریخ به‌روزرسانی",
      dataIndex: "update_date_fa",
      key: "update_date_fa",
      width: 150,
      render: (date) => dayjs(date).format("YYYY/MM/DD"),
    },
    {
      title: "عملیات",
      key: "action",
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleShowDetail(record)}
          >
            جزئیات
          </Button>
          {record.status == 1 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleOpenStatusModal(record)}
              style={{ color: '#52c41a' }}
            >
              تغییر وضعیت
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // نمایش جزئیات تخصیص
  const handleShowDetail = (record) => {
    setDetailModalVisible(true);
    setSelectedAllocation(record);
  };

  // باز کردن مودال تغییر وضعیت
  const handleOpenStatusModal = (record) => {
    setSelectedItem(record);
    setNewStatus(null);
    setStatusNote('');
    setStatusModalVisible(true);
  };

  // تغییر وضعیت تخصیص
  const handleUpdateStatus = async () => {
    if (!selectedItem || newStatus === null) {
      message.warning("لطفاً وضعیت جدید را انتخاب کنید");
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await request(
        `/supplier-return-product/update-status`,
        'POST',
        {
          id: selectedItem.id,
          status: newStatus,
          note: statusNote || undefined
        }
      );

      if (response.success) {
        message.success(response.message || "وضعیت با موفقیت به‌روزرسانی شد");
        setStatusModalVisible(false);
        // به‌روزرسانی لیست
        getData(params);
      } else {
        message.error(response.message || "خطا در تغییر وضعیت");
      }
    } catch (error) {
      console.error('Status update error:', error);
      message.error("خطا در ارتباط با سرور");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // دریافت داده‌ها از API
  const getData = (searchParams) => {
    if (!supplierId) return;
    
    setLoading(true);
    
    // ساخت URL با فیلترها
    let url = `/supplier-return-product/get-list?supplier_id=${supplierId}&page_size=20`;
    
    if (searchParams) {
      url += `&${searchParams}`;
    }
    
    // اضافه کردن فیلترهای اضافی
    if (statusFilter !== null && statusFilter !== "") {
      url += `&status=${statusFilter}`;
    }
    if (productIdFilter) {
      url += `&product_id=${productIdFilter}`;
    }
    if (folderIdFilter) {
      url += `&folder_id=${folderIdFilter}`;
    }
    
    // اضافه کردن فیلتر تاریخ
    if (dateRange && dateRange.length === 2) {
      const fromDate = convertPersianToGregorian(dateRange[0]);
      const toDate = convertPersianToGregorian(dateRange[1]);
      if (fromDate) url += `&from_date=${fromDate}`;
      if (toDate) url += `&to_date=${toDate}`;
    }
    
    console.log('Request URL:', url);
    
    request(url)
      .then((res) => {
        if (res.success) {
          setData(res.data.allocations || []);
          setSupplier(res.data.supplier || {});
          setPages(res.data.pagination?.total_pages || 0);
          setTotal(res.data.pagination?.total || 0);
        } else {
          message.error(res.message || "خطا در دریافت اطلاعات");
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
    setProductIdFilter('');
    setFolderIdFilter('');
    setDateRange(null);
    setParams(null);
  };

  useEffect(() => {
    if (supplierId > 0) {
      getData(params);
    }
  }, [params, statusFilter, productIdFilter, folderIdFilter, dateRange, supplierId]);

  // گزینه‌های وضعیت برای فیلتر
  const statusOptions = [
    { value: 1, label: "در انتظار بررسی" },
    { value: 2, label: "تایید شده" },
    { value: -1, label: "رد شده" }
  ];

  // گزینه‌های وضعیت برای تغییر
  const changeStatusOptions = [
    { value: 2, label: "تایید شده", color: "success" },
    { value: -1, label: "رد شده", color: "error" }
  ];

  return (
    <>
      <div className="flexible-header" style={{ textAlign: 'right' }}>
        <br/>
        <div className="flexible-header">
          {/* عنوان و فیلترها */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <h3 style={{ margin: 0 }}>
              <ShopOutlined /> لیست تخصیص‌های تامین‌کننده
              <Tag color="blue" style={{ marginRight: 8 }}> {supplier?.first_name}  {supplier?.last_name}    - کد : {supplierId}</Tag>
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
            <Col span={5}>
              <div style={{ marginBottom: 4 }}>وضعیت تخصیص:</div>
              <Select
                placeholder="همه"
                allowClear
                style={{ width: "100%" }}
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
            </Col>
            <Col span={5}>
              <div style={{ marginBottom: 4 }}>کد محصول:</div>
              <Input
                placeholder="جستجوی کد محصول..."
                value={productIdFilter}
                onChange={(e) => setProductIdFilter(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={5}>
              <div style={{ marginBottom: 4 }}>شماره پرونده:</div>
              <Input
                placeholder="جستجوی شماره پرونده..."
                value={folderIdFilter}
                onChange={(e) => setFolderIdFilter(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={9}>
              <div style={{ marginBottom: 4 }}>محدوده تاریخ</div>
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
      
      {/* خلاصه آمار */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 6 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666', fontSize: 12 }}>تعداد کل</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>{numberFormat(total)}</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666', fontSize: 12 }}>در انتظار بررسی</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                {numberFormat(data.filter(item => item.status == 1).length)}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666', fontSize: 12 }}>تایید شده</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                {numberFormat(data.filter(item => item.status == 2).length)}
              </div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#666', fontSize: 12 }}>رد شده</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                {numberFormat(data.filter(item => item.status == -1).length)}
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
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

      {/* مودال جزئیات تخصیص */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FileTextOutlined />
            <span>جزئیات تخصیص #{selectedAllocation?.id}</span>
            {selectedAllocation && (
              <Tag color={statusMap[selectedAllocation.status]?.color}>
                {statusMap[selectedAllocation.status]?.text}
              </Tag>
            )}
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            بستن
          </Button>
        ]}
        width={700}
      >
        {selectedAllocation ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="شناسه تخصیص">
              {selectedAllocation.id}
            </Descriptions.Item>
            <Descriptions.Item label="شناسه تامین‌کننده">
              {selectedAllocation.supplier_id}
            </Descriptions.Item>
            <Descriptions.Item label="کد محصول">
              <Tag color="blue">{selectedAllocation.product_id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="شماره پرونده">
              <Tag color="cyan">{selectedAllocation.folder_id}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="شناسه محصول بازگشتی">
              {selectedAllocation.returned_product_id}
            </Descriptions.Item>
            <Descriptions.Item label="تعداد">
              <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
                {numberFormat(selectedAllocation.quantity)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="وضعیت">
              <Tag color={statusMap[selectedAllocation.status]?.color}>
                {statusMap[selectedAllocation.status]?.text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="تاریخ ثبت">
              {dayjs(selectedAllocation.create_date_fa).format("YYYY/MM/DD HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="تاریخ به‌روزرسانی">
              {dayjs(selectedAllocation.update_date_fa).format("YYYY/MM/DD HH:mm")}
            </Descriptions.Item>

              <Descriptions.Item label=" توضیحات  ">
              {selectedAllocation.description}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: "center", padding: 50, color: "#999" }}>
            اطلاعاتی برای نمایش وجود ندارد.
          </div>
        )}
      </Modal>

      {/* مودال تغییر وضعیت */}
      <Modal
        title="تغییر وضعیت تخصیص"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleUpdateStatus}
        confirmLoading={updatingStatus}
        okText="تایید تغییر"
        cancelText="انصراف"
        width={600}
      >
        {selectedItem && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div><span style={{ color: '#666' }}>شناسه تخصیص:</span> <strong>{selectedItem.id}</strong></div>
                </Col>
                <Col span={12}>
                  <div><span style={{ color: '#666' }}>کد محصول:</span> <strong>{selectedItem.product_id}</strong></div>
                </Col>
                <Col span={12}>
                  <div><span style={{ color: '#666' }}>تعداد:</span> <strong>{numberFormat(selectedItem.quantity)}</strong></div>
                </Col>
                <Col span={12}>
                  <div>
                    <span style={{ color: '#666' }}>وضعیت فعلی:</span>{' '}
                    <Tag color={statusMap[selectedItem.status]?.color}>
                      {statusMap[selectedItem.status]?.text}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>وضعیت جدید:</label>
              <Select
                placeholder="انتخاب وضعیت جدید"
                style={{ width: '100%' }}
                value={newStatus}
                onChange={setNewStatus}
                options={changeStatusOptions}
                optionRender={(option) => (
                  <Space>
                    {option.data.value == 2 ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CloseOutlined style={{ color: '#ff4d4f' }} />}
                    {option.data.label}
                  </Space>
                )}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>توضیحات (اختیاری):</label>
              <TextArea
                rows={3}
                placeholder="توضیحات مربوط به تغییر وضعیت..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}