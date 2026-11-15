import { Button, Col, Form, Input, Modal, Row, Upload, message, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../components/AuthProvider";
import { request } from "../../module/util";
import AntdSelect from "../../components/AntdSelect";
import { DeleteOutlined, PlusCircleOutlined, InboxOutlined } from "@ant-design/icons";
import Datepicker from "../../components/DatePicker";

const { Item, useForm } = Form;
const { Dragger } = Upload;

export const SaveDeclarationOfNeed = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  declarationId = null,
  mode = "create" 
}) => {
  const { setTitle } = useAuthContext();
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [lastDeclarations, setLastDeclarations] = useState({});
  const [lastDeclarationsModal, setLastDeclarationsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});
  const [mrp, setMrp] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isModalMrpOpen, setIsModalMrpOpen] = useState(false);

  const [items, setItems] = useState([
    {
      _id: Date.now(),
      id: null,
      name: "",
      unit_id: "",
      first_month_id: null,
      first_month_value: 0,
      second_month_id: null,
      second_month_value: 0,
      third_month_id: null,
      third_month_value: 0,
      invalid: false,
      desc: "",
      mrp: [],
      qty: 0,
      showLast: false,
    },
  ]);

  const months = [
    { label: "فروردین", value: 1 },
    { label: "اردیبهشت", value: 2 },
    { label: "خرداد", value: 3 },
    { label: "تیر", value: 4 },
    { label: "مرداد", value: 5 },
    { label: "شهریور", value: 6 },
    { label: "مهر", value: 7 },
    { label: "آبان", value: 8 },
    { label: "آذر", value: 9 },
    { label: "دی", value: 10 },
    { label: "بهمن", value: 11 },
    { label: "اسفند", value: 12 },
  ];

  const monthList = [
    "فروردین", "اردیبهشت", "خرداد",
    "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
  ];

  useEffect(() => {
    if (visible) {
      getUnits();
      getProducts();
      getSuppliers();
      if (mode === "edit" && declarationId) {
        getData();
      } else {
        form.resetFields();
        setItems([{
          _id: Date.now(),
          id: null,
          name: "",
          unit_id: "",
          first_month_id: null,
          first_month_value: 0,
          second_month_id: null,
          second_month_value: 0,
          third_month_id: null,
          third_month_value: 0,
          invalid: false,
          desc: "",
          mrp: [],
          qty: 0,
          showLast: false,
        }]);
      }
    }
  }, [visible, mode, declarationId]);

  const getData = async () => {
    if (declarationId) {
      const res = await request(`/declaration-of-need/view?id=${declarationId}`, "GET");
      if (res?.success) {
        const data = res.data;
        form.setFieldsValue({ 
          supplier_id: data.supplier_id, 
          date: data.date 
        });
        setItems(JSON.parse(data.items));
        setTitle(`ویرایش اعلام نیاز: ${data.id}`);
      }
    }
  };

  const getSuppliers = async (query = "") => {
    const res = await request(`/users/get-suppliers?query=${query}`, "GET");
    if (res?.success) setSuppliers(res.data.map((s) => ({ label: `${s.supplier_code} - ${s.company_name}`, value: s.id })));
  };

  const getUnits = async (name = "") => {
    const res = await request(`/unit?name=${name}`, "GET");
    if (res?.success) setUnits(res.data.map((b) => ({ label: b.name, value: b.id })));
  };

  const getProducts = async (id = "") => {
    try {
      const res = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=${id}`, "GET", null, true, true);
      if (res?.data) {
        setProducts(res.data.map(({ label, value, Mojodi }) => ({ label, value, Mojodi })));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleAddItem = () => {
    const firstMonthId = items?.[0]?.first_month_id || null;
    const secondMonthId = items?.[0]?.second_month_id || null;
    const thirdMonthId = items?.[0]?.third_month_id || null;
    
    setItems((prev) => [
      ...prev,
      {
        _id: Date.now(),
        id: null,
        name: "",
        unit_id: "",
        first_month_id: firstMonthId,
        first_month_value: 0,
        second_month_id: secondMonthId,
        second_month_value: 0,
        third_month_id: thirdMonthId,
        third_month_value: 0,
        desc: "",
        mrp: [],
        qty: 0,
        showLast: false,
      },
    ]);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const data = { ...values, items };
      const method = mode === "create" ? "POST" : "PUT";
      const url = mode === "create" ? "/declaration-of-need/create" : `/declaration-of-need/update?id=${declarationId}`;

      const res = await request(url, method, data);

      if (res?.success) {
        message.success(mode === "create" ? "اعلام نیاز با موفقیت ایجاد شد" : "اعلام نیاز با موفقیت ویرایش شد");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error("خطا در ذخیره اطلاعات");
      }
    } catch (error) {
      console.error("Error saving declaration:", error);
      message.error("خطا در ذخیره اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setItems([{
      _id: Date.now(),
      id: null,
      name: "",
      unit_id: "",
      first_month_id: null,
      first_month_value: 0,
      second_month_id: null,
      second_month_value: 0,
      third_month_id: null,
      third_month_value: 0,
      invalid: false,
      desc: "",
      mrp: [],
      qty: 0,
      showLast: false,
    }]);
    if (onCancel) {
      onCancel();
    }
  };

  // Excel Upload Functions
  const showModal = () => setIsModalOpen(true);
  
  const handleCancelUpload = () => {
    setIsModalOpen(false);
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
      const response = await request(`/declaration-of-need/import-excel`, "POST", formData, false, null, 'multipart/form-data');
      
      if (response.success) {
        message.success(response.data.message || 'فایل با موفقیت آپلود شد');
        setIsModalOpen(false);
        setFileList([]);
        
        // Process imported data
        if (response.data && Array.isArray(response.data)) {
          for (const need of response.data) {
            if (Number(need.id) > 0 && !hasDuplicateProduct(-1, Number(need.id))) {
              await processImportedProduct(need);
            }
          }
        }
      } else {
        message.error(response.data?.message || 'خطایی در آپلود فایل رخ داده است');
      }
    } catch (error) {
      message.error('خطایی در آپلود فایل رخ داده است');
    } finally {
      setUploading(false);
    }
  };

  const processImportedProduct = async (need) => {
    try {
      const responseProduct = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=${need.id}`, "GET", null, true, true);
      if (responseProduct?.data?.[0]) {
        const product = responseProduct.data[0];
        const res = await request(`/declaration-of-need/last?id=${Number(need.id)}&expand=supplier`);

        const newItem = {
          _id: Date.now(),
          id: Number(need.id),
          name: product.label || "",
          unit_id: Number(need.unit) || "",
          first_month_id: Number(need.m1) || null,
          first_month_value: Number(need.n1) || 0,
          second_month_id: Number(need.m2) || null,
          second_month_value: Number(need.n2) || 0,
          third_month_id: Number(need.m3) || null,
          third_month_value: Number(need.n3) || 0,
          mrp: JSON.parse(res?.mrp ?? '[]'),
          desc: need.description || "",
          qty: product.Mojodi || 0,
          showLast: res?.data?.length > 0,
        };

        setItems(prev => [...prev, newItem]);
        if (res?.data) {
          setLastDeclarations(prev => ({ ...prev, [Number(need.id)]: res.data }));
        }
      }
    } catch (error) {
      console.error("Error processing imported product:", error);
    }
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

  // Helper Functions
  const hasDuplicateProduct = (currentIndex, currentId) => {
    return items.some((item, index) => index !== currentIndex && Number(item.id) > 0 && item.id === currentId);
  };

  const getMrpItem = (arr, index) => {
    if (arr && arr.length > index) {
      return arr[index];
    }
    return "";
  };

  const handleShowModalMrp = (item) => {
    setMrp(Array.isArray(item.mrp) ? item.mrp : JSON.parse(item.mrp || '[]'));
    setIsModalMrpOpen(true);
  };

  const handleCancelMrp = () => setIsModalMrpOpen(false);

  const handleOpenLastDeclarationsModal = (item) => {
    setSelectedItem(item);
    setLastDeclarationsModal(true);
  };

  const checkMrp = (month, qty, mrp) => {
    if (!month || !mrp || !Array.isArray(mrp)) return "";

    const monthIndex = month;
    if (monthIndex >= 1 && monthIndex <= mrp.length) {
      if (qty > mrp[monthIndex]) {
        return (
          <div style={{ color: 'red', textAlign: 'right', fontSize: '12px', marginTop: '4px' }}>
            تعداد بیشتر از حد است
          </div>
        );
      }
    }
    return "";
  };

  const checkValidMrp = (month, qty, mrp) => {
    if (!month || !mrp || !Array.isArray(mrp)) return true;
    const monthIndex = month;
    if (monthIndex >= 1 && monthIndex <= mrp.length) {
      return qty <= mrp[monthIndex];
    }
    return true;
  };

  return (
    <Modal
      title={mode === "create" ? "ثبت اعلام نیاز جدید" : "ویرایش اعلام نیاز"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1400}
      style={{ top: 20 }}
    >
      <Form 
        form={form}
        onFinish={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
          }
        }}
        layout="vertical"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Item name="supplier_id" label="تامین کننده" rules={[{ required: true, message: "تامین کننده را انتخاب کنید" }]}>
              <AntdSelect
                options={suppliers}
                placeholder="انتخاب کنید ..."
                onClear={getSuppliers}
                onSearch={(e) => {
                  if (e.length > 1) getSuppliers(e);
                }}
              />
            </Item>
          </Col>
          <Col xs={24} md={8}>
            <Item label="تاریخ" name="date" rules={[{ required: true, message: "تاریخ را وارد کنید" }]}>
              <Datepicker type="text" placeholder="تاریخ" />
            </Item>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ paddingTop: '29px' }}>
              <Button type="default" icon={<PlusCircleOutlined />} onClick={showModal}>
                وارد کردن از اکسل
              </Button>
            </div>
          </Col>
        </Row>

        <Row style={{ marginTop: '20px', marginBottom: '20px' }}>
          <div className="d-flex align-items-center gap-3">
            <p className="m-0 font-bold">لیست کالا ها</p>
            <Button icon={<PlusCircleOutlined />} onClick={handleAddItem}>
              افزودن کالا جدید
            </Button>
          </div>
        </Row>

        {items.map((item, index) => (
          <div key={item._id} style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              {/* کد کالا */}
              <Col xs={24} md={6}>
                <Item label="کد کالا">
                  <AntdSelect
                    options={products.map(({ value }) => ({ label: value.toString(), value }))}
                    value={item.id}
                    placeholder="انتخاب کنید ..."
                    onClear={getProducts}
                    onChange={async (id) => {
                      if (hasDuplicateProduct(index, id)) {
                        message.error("این کالا قبلا انتخاب شده");
                        return;
                      }
                      
                      const res = await request(`/declaration-of-need/last?id=${id}&expand=supplier`);
                      const product = products.find(p => p.value == id);
                      
                      setItems(prev =>
                        prev.map((p, i) =>
                          i === index
                            ? {
                                ...p,
                                id,
                                name: product?.label || "",
                                qty: product?.Mojodi || 0,
                                mrp: JSON.parse(res?.mrp ?? '[]'),
                                showLast: res?.data?.length > 0,
                              }
                            : p
                        )
                      );
                      if (res?.data) setLastDeclarations(prev => ({ ...prev, [id]: res.data }));
                    }}
                    onSearch={(id) => {
                      if (id.length > 1) getProducts(id);
                    }}
                  />
                </Item>
                
                {item?.id && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <span>موجودی: </span>
                      <b>{item.qty}</b>
                    </div>
                    
                    {item.showLast && (
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleOpenLastDeclarationsModal(item)}
                        style={{ padding: 0, fontSize: '12px', height: 'auto' }}
                      >
                        اعلام نیازهای 90 روز گذشته
                      </Button>
                    )}

                    {item.mrp && item.mrp.length > 2 && (
                      <>
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                          <span>خرید از ابتدای دوره: </span>
                          <b>{getMrpItem(Array.isArray(item.mrp) ? item.mrp : JSON.parse(item.mrp), 13)}</b>
                          <span> {getMrpItem(Array.isArray(item.mrp) ? item.mrp : JSON.parse(item.mrp), 0)}</span>
                        </div>
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => handleShowModalMrp(item)}
                          style={{ padding: 0, fontSize: '12px', height: 'auto' }}
                        >
                          نمایش اطلاعات MRP
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </Col>

              {/* نام کالا */}
              <Col xs={24} md={6}>
                <Item label="نام کالا">
                  <Input value={item.name} disabled />
                </Item>
              </Col>

              {/* واحد */}
              <Col xs={24} md={6}>
                <Item label="واحد">
                  <AntdSelect
                    options={units}
                    value={item.unit_id}
                    placeholder="انتخاب کنید ..."
                    onChange={(unit_id) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, unit_id } : p)))}
                    onSearch={(unit_id) => {
                      if (unit_id.length > 1) getUnits(unit_id);
                    }}
                  />
                </Item>
              </Col>

              {/* ماه اول */}
              <Col xs={24} md={6}>
                <Item label="ماه اول">
                  <AntdSelect
                    options={months}
                    value={item.first_month_id}
                    placeholder="انتخاب کنید ..."
                    onChange={(first_month_id) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, first_month_id } : p)))}
                  />
                </Item>
              </Col>

              {/* نیاز ماه اول */}
              <Col xs={24} md={6}>
                <Item label="نیاز ماه اول">
                  <Input
                    type="number"
                    value={item.first_month_value}
                    onChange={(e) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, first_month_value: e.target.value } : p)))}
                  />
                  {checkMrp(item.first_month_id, item.first_month_value, item.mrp)}
                </Item>
              </Col>

              {/* ماه دوم */}
              <Col xs={24} md={6}>
                <Item label="ماه دوم">
                  <AntdSelect
                    options={months}
                    value={item.second_month_id}
                    placeholder="انتخاب کنید ..."
                    onChange={(second_month_id) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, second_month_id } : p)))}
                  />
                </Item>
              </Col>

              {/* نیاز ماه دوم */}
              <Col xs={24} md={6}>
                <Item label="نیاز ماه دوم">
                  <Input
                    type="number"
                    value={item.second_month_value}
                    onChange={(e) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, second_month_value: e.target.value } : p)))}
                  />
                  {checkMrp(item.second_month_id, item.second_month_value, item.mrp)}
                </Item>
              </Col>

              {/* ماه سوم */}
              <Col xs={24} md={6}>
                <Item label="ماه سوم">
                  <AntdSelect
                    options={months}
                    value={item.third_month_id}
                    placeholder="انتخاب کنید ..."
                    onChange={(third_month_id) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, third_month_id } : p)))}
                  />
                </Item>
              </Col>

              {/* نیاز ماه سوم */}
              <Col xs={24} md={6}>
                <Item label="نیاز ماه سوم">
                  <Input
                    type="number"
                    value={item.third_month_value}
                    onChange={(e) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, third_month_value: e.target.value } : p)))}
                  />
                  {checkMrp(item.third_month_id, item.third_month_value, item.mrp)}
                </Item>
              </Col>

              {/* توضیحات */}
              <Col xs={24} md={12}>
                <Item label="توضیحات">
                  <Input.TextArea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => setItems(prev => prev.map((p, i) => (i === index ? { ...p, desc: e.target.value } : p)))}
                  />
                </Item>
              </Col>

              {/* دکمه حذف */}
              <Col xs={24} md={12}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', height: '100%' }}>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => setItems(prev => prev.filter((p, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        ))}

        <Row style={{ marginTop: '20px' }}>
          <Col xs={24} style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              style={{ width: '200px' }}
              loading={loading}
            >
              {mode === "create" ? "ثبت اعلام نیاز" : "ویرایش اعلام نیاز"}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* MRP Modal */}
      <Modal
        title="اطلاعات MRP"
        open={isModalMrpOpen}
        onCancel={handleCancelMrp}
        footer={[
          <Button key="back" onClick={handleCancelMrp}>بستن</Button>,
        ]}
      >
        <Table
          dataSource={monthList.map((month, index) => ({
            key: index,
            month,
            quantity: getMrpItem(mrp, index + 1),
            unit: getMrpItem(mrp, 0)
          }))}
          columns={[
            { title: 'ماه', dataIndex: 'month', key: 'month' },
            { title: 'تعداد', dataIndex: 'quantity', key: 'quantity' },
            { title: 'واحد', dataIndex: 'unit', key: 'unit' },
          ]}
          pagination={false}
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row style={{ fontWeight: 'bold' }}>
                <Table.Summary.Cell index={0}>جمع ماه ها</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  {mrp.slice(1).reduce((sum, val) => sum + (Number(val) || 0), 0)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{getMrpItem(mrp, 0)}</Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row style={{ fontWeight: 'bold', color: '#52c41a' }}>
                <Table.Summary.Cell index={0}>خرید از ابتدای دوره</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>{getMrpItem(mrp, 13)}</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{getMrpItem(mrp, 0)}</Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Modal>

      {/* Excel Upload Modal */}
      <Modal
        title="ایمپورت اعلام نیاز از فایل اکسل"
        open={isModalOpen}
        onCancel={handleCancelUpload}
        footer={[
          <Button key="back" onClick={handleCancelUpload}>انصراف</Button>,
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

      {/* Last Declarations Modal */}
      <Modal
        width={1000}
        footer={false}
        title={`اعلام نیازهای 90 روز گذشته : ${selectedItem?.name}`}
        open={lastDeclarationsModal}
        onCancel={() => setLastDeclarationsModal(false)}
      >
        {/* Last declarations content */}
      </Modal>
    </Modal>
  );
};

export default SaveDeclarationOfNeed;