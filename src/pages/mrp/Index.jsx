import { Button, Divider, Table, Tooltip, Modal, Upload, message, Tag } from "antd";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { EditOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import { checkAccess, request } from "../../module/util";
import { SaveMrp } from "./save";

const { Dragger } = Upload;

export default function Mrp() {
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "نام محصول",
      dataIndex: "name",
      key: "name",
      width: 280,
    },
    {
      title: "اولویت",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      render: (value) => value ? <Tag color="orange">{value}</Tag> : '-',
    },
    {
      title: "فصلی",
      dataIndex: "seasonal",
      key: "seasonal",
      width: 90,
      render: (value) => value ? <Tag color="purple">{value}</Tag> : '-',
    },
    {
      title: "واحد",
      dataIndex: "unit",
      key: "unit",
      width: 80,
    },
    {
      title: "فروردین",
      dataIndex: "m1",
      key: "m1",
      width: 80,
    },
    {
      title: "اردیبهشت",
      dataIndex: "m2",
      key: "m2",
      width: 80,
    },
    {
      title: "خرداد",
      dataIndex: "m3",
      key: "m3",
      width: 80,
    },
    {
      title: "تیر",
      dataIndex: "m4",
      key: "m4",
      width: 80,
    },
    {
      title: "مرداد",
      dataIndex: "m5",
      key: "m5",
      width: 80,
    },
    {
      title: "شهریور",
      dataIndex: "m6",
      key: "m6",
      width: 80,
    },
    {
      title: "مهر",
      dataIndex: "m7",
      key: "m7",
      width: 80,
    },
    {
      title: "آبان",
      dataIndex: "m8",
      key: "m8",
      width: 80,
    },
    {
      title: "آذر",
      dataIndex: "m9",
      key: "m9",
      width: 80,
    },
    {
      title: "دی",
      dataIndex: "m10",
      key: "m10",
      width: 80,
    },
    {
      title: "بهمن",
      dataIndex: "m11",
      key: "m11",
      width: 80,
    },
    {
      title: "اسفند",
      dataIndex: "m12",
      key: "m12",
      width: 80,
    },
    {
      title: "جمع ماه ها",
      dataIndex: "m13",
      key: "m13",
      width: 100,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "برنامه فروش کلی",
      dataIndex: "m14",
      key: "m14",
      width: 130,
      render: (value) => <Tag color="green">{value}</Tag>,
    },
    {
      title: "عملیات",
      key: "action",
      dataIndex: "action",
      width: 120,
      fixed: 'right',
    },
  ];

  const months = [
    "فروردین", "اردیبهشت", "خرداد",
    "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
  ];

  const { auth } = useAuthContext();
  const [model, setModel] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  // State for modals
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedMrpId, setSelectedMrpId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mrpData, setMrpData] = useState([]);
  const [mrpExtra, setMrpExtra] = useState({ unit: '', priority: null, seasonal: null, total: 0 });

  const getData = (params = "") => {
    request(`https://portalapi.dinapart.ir/api/list-mrp?${params}`, 'GET', null, false, true).then((res) => {
      if (res?.success) {
        setModel(res.data);
        setPages(res.pages);
        setTotal(res.pagination.page_count);
        setCurrentPage(res.pagination.current_page);
        setPageCount(10);
      }
    });
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    let newData = [];

    model.map((item, k) => {
      const mrpArray = JSON.parse(item?.data ?? '[]');
      // محاسبه جمع 12 ماه (فروردین تا اسفند = ایندکس 1 تا 12)
      const monthlySum = mrpArray.slice(1, 13).reduce((sum, val) => sum + (Number(val) || 0), 0);
      
      newData.push({
        key: ++k,
        id: <span>{item.id}</span>,
        name: <span>{item?.name}</span>,
        priority: mrpArray[14] ?? null,
        seasonal: mrpArray[15] ?? null,
        unit: <span>{mrpArray[0] || ''}</span>,
        m1: <span>{mrpArray[1] || '0'}</span>,
        m2: <span>{mrpArray[2] || '0'}</span>,
        m3: <span>{mrpArray[3] || '0'}</span>,
        m4: <span>{mrpArray[4] || '0'}</span>,
        m5: <span>{mrpArray[5] || '0'}</span>,
        m6: <span>{mrpArray[6] || '0'}</span>,
        m7: <span>{mrpArray[7] || '0'}</span>,
        m8: <span>{mrpArray[8] || '0'}</span>,
        m9: <span>{mrpArray[9] || '0'}</span>,
        m10: <span>{mrpArray[10] || '0'}</span>,
        m11: <span>{mrpArray[11] || '0'}</span>,
        m12: <span>{mrpArray[12] || '0'}</span>,
        m13: <span>{monthlySum}</span>,
        m14: <span>{mrpArray[13] || '0'}</span>,
        action: (
          <div style={{ display: 'flex', gap: '8px' }}>
            {checkAccess(auth.roles, [1502]) ? (
              <Tooltip placement="top" title={"ویرایش"} color="#1890ff">
                <button 
                  onClick={() => handleEdit(item.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <EditOutlined className="text-primary" />
                </button>
              </Tooltip>
            ) : null}
            
            <Tooltip placement="top" title={"نمایش"} color="#52c41a">
              <button 
                onClick={() => handleView(item.id)}
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <EyeOutlined className="text-success" />
              </button>
            </Tooltip>
          </div>
        ),
      });
    });

    setData(newData);
  }, [model]);

  const handleEdit = (mrpId) => {
    setSelectedMrpId(mrpId);
    setSaveModalVisible(true);
  };

  const handleView = async (mrpId) => {
    try {
      const response = await request(
        `https://portalapi.dinapart.ir/api/mrp-search-product?id=${mrpId}`,
        'GET', null, false, true
      );
      if (response.success && response.product) {
        const parsed = JSON.parse(response.product.data || '[]');
        setMrpData(parsed);
        setMrpExtra({
          unit: parsed[0] || '-',
          priority: parsed[14] ?? null,
          seasonal: parsed[15] ?? null,
          total: parsed[13] ?? 0,
        });
        setViewModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching MRP data:', error);
      message.error('خطا در دریافت اطلاعات MRP');
    }
  };

  const showUploadModal = () => setUploadModalVisible(true);
  
  const handleUploadCancel = () => {
    setUploadModalVisible(false);
    setFileList([]);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('لطفا یک فایل انتخاب کنید');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileList[0]);
    setUploading(true);

    try {
      const response = await request(
        `https://portalapi.dinapart.ir/api/upload-mrp`, 
        "POST", formData, false, true, 'multipart/form-data'
      );
      
      if (response.success) {
        message.success(response.message || 'فایل با موفقیت آپلود شد');
        handleUploadCancel();
        getData();
      } else {
        message.error(response.message || 'خطایی در آپلود فایل رخ داده است');
      }
    } catch (error) {
      message.error('خطایی در آپلود فایل رخ داده است');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveModalSuccess = () => {
    setSaveModalVisible(false);
    getData();
  };

  const handleSaveModalCancel = () => {
    setSaveModalVisible(false);
    setSelectedMrpId(null);
  };

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
    setMrpData([]);
    setMrpExtra({ unit: '', priority: null, seasonal: null, total: 0 });
  };

  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  const getMrpItem = (arr, index) => {
    if (arr && arr.length > index) {
      return arr[index];
    }
    return "";
  };

  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    { name: "name", type: "text", label: "نام محصول" },
  ];

  return (
    <>
      <div className="flexible-header">
        <h5>مدیریت MRP</h5>
        <div className="flexible-header">
          <Filters fields={filters} getData={getData} />
          {checkAccess(auth.roles, [1501]) ? (
            <Button
              type="primary"
              className="AZ-primary-btn gap-1"
              icon={<InboxOutlined />}
              onClick={showUploadModal}
            >
              آپلود از اکسل
            </Button>
          ) : null}
        </div>
      </div>
     
      <Divider />
     
      <div className="table-responsive">
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false} 
          className="ant-border-space"
          scroll={{ x: 1700 }}
        />
      </div>

      <Pagination all={total} currentPage={currentPage} pageSize={pageCount} getData={getData} />

      {/* Save MRP Modal */}
      <SaveMrp
        visible={saveModalVisible}
        onCancel={handleSaveModalCancel}
        onSuccess={handleSaveModalSuccess}
        mrpId={selectedMrpId}
      />

      {/* View MRP Modal */}
      <Modal
        title="نمایش اطلاعات MRP"
        open={viewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="back" onClick={handleViewModalCancel}>بستن</Button>,
        ]}
        width={700}
      >
        {/* اطلاعات تکمیلی */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="orange">اولویت: {mrpExtra.priority ?? '-'}</Tag>
          <Tag color="purple">فصلی: {mrpExtra.seasonal ?? '-'}</Tag>
          <Tag color="blue">برنامه فروش کلی: {mrpExtra.total ?? '-'}</Tag>
          <Tag color="default">واحد: {mrpExtra.unit}</Tag>
        </div>

        <Table
          dataSource={months.map((month, index) => ({
            key: index,
            month,
            quantity: getMrpItem(mrpData, index + 1),
            unit: getMrpItem(mrpData, 0)
          }))}
          columns={[
            { title: 'ماه', dataIndex: 'month', key: 'month' },
            { title: 'تعداد', dataIndex: 'quantity', key: 'quantity' },
            { title: 'واحد', dataIndex: 'unit', key: 'unit' },
          ]}
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0}>جمع ماه ها</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  {mrpData.slice(1, 13).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{getMrpItem(mrpData, 0)}</Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row style={{ fontWeight: 'bold', color: '#52c41a' }}>
                <Table.Summary.Cell index={0}>برنامه فروش کلی</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>{getMrpItem(mrpData, 13)}</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{getMrpItem(mrpData, 0)}</Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Modal>

      {/* Upload Excel Modal */}
      <Modal
        title="آپلود فایل اکسل MRP"
        open={uploadModalVisible}
        onCancel={handleUploadCancel}
        footer={[
          <Button key="back" onClick={handleUploadCancel}>انصراف</Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploading}
            onClick={handleUpload}
            disabled={fileList.length === 0}
          >
            آپلود
          </Button>,
        ]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">برای انتخاب فایل کلیک یا آن را به اینجا بکشید</p>
          <p className="ant-upload-hint">از فایل‌های با فرمت xlsx یا xls استفاده کنید</p>
        </Dragger>
      </Modal>
    </>
  );
}