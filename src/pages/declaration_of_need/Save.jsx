import { Button, Col, Form, Input, Modal, Row, Upload, message, Table } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { getParams, request, rules } from "../../module/util";
import AntdSelect from "../../components/AntdSelect";
import { DeleteOutlined, PlusCircleOutlined, InboxOutlined } from "@ant-design/icons";
import Datepicker from "../../components/DatePicker";
import { NumberFormat } from "../../components/NumberFormat";

const { Item, useForm } = Form;
const { Dragger } = Upload;

export default function SaveDeclarationOfNeed() {
  const [form] = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [lastDeclarations, setLastDeclarations] = useState({});
  const [lastDeclarationsModal, setLastDeclarationsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  // ✅ State برای MRP Modal
  const [mrp, setMrp] = useState([]);
  const [isModalMrpOpen, setIsModalMrpOpen] = useState(false);

  //modal upload excel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

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
      desc: "",
      mrp: [],       // ✅ اضافه شد
      qty: 0,        // ✅ اضافه شد
      showLast: false, // ✅ اضافه شد
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
    getData();
    getUnits();
    getProducts();
    getSuppliers();
  }, [location]);

  const getData = async () => {
    const id = await getParams(location.search, "id");

    if (id) {
      const res = await request(`/declaration-of-need/view?id=${id}`, "GET");

      if (res?.success) {
        const data = res.data;

        form.setFieldsValue({ supplier_id: data.supplier_id, date: data.date });

        // ✅ هندل کردن هر دو حالت (آرایه یا رشته JSON)
        let parsedItems = data.items;

        try {
          if (typeof parsedItems === "string") {
            parsedItems = JSON.parse(parsedItems);
          }
          if (typeof parsedItems === "string") {
            parsedItems = JSON.parse(parsedItems);
          }
        } catch (e) {
          console.error("Error parsing items:", e);
          parsedItems = [];
        }

        if (!Array.isArray(parsedItems)) {
          parsedItems = [];
        }

        if (parsedItems.length === 0) {
          parsedItems = [
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
              desc: "",
              mrp: [],
              qty: 0,
              showLast: false,
            },
          ];
        }

        // ✅ برای هر آیتم، MRP رو هم بگیر
        for (let i = 0; i < parsedItems.length; i++) {
          if (parsedItems[i].id && !parsedItems[i].mrp) {
            try {
              const mrpRes = await request(`/declaration-of-need/last?id=${parsedItems[i].id}&expand=supplier`);
              parsedItems[i].mrp = parseMrpSafe(mrpRes?.mrp);
            } catch (e) {
              parsedItems[i].mrp = [];
            }
          }
        }

        setItems(parsedItems);
        getSuppliers(data.supplier_id);
      }
    }
  };

  // ✅ تابع کمکی برای parse امن MRP
  const parseMrpSafe = (mrp) => {
    if (Array.isArray(mrp)) return mrp;

    let parsed = mrp;
    try {
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {
      return [];
    }

    return Array.isArray(parsed) ? parsed : [];
  };

  // ✅ تابع کمکی برای دریافت مقدار از MRP
  const getMrpItem = (arr, index) => {
    const parsed = parseMrpSafe(arr);
    if (parsed.length > index) {
      return parsed[index];
    }
    return "";
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
    const res = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=${id}`, "GET", null, true, true);

    if (res?.data) setProducts(res.data.map(({ label, value, Mojodi }) => ({ label, value, Mojodi })));
  };

  const handleAddItem = () => {
    const { first_month_id, second_month_id, third_month_id } = items?.[0];
    setItems((prev) => [
      ...prev,
      {
        _id: Date.now(),
        id: null,
        name: "",
        unit_id: "",
        first_month_id,
        first_month_value: 0,
        second_month_id,
        second_month_value: 0,
        third_month_id,
        third_month_value: 0,
        desc: "",
        mrp: [],
        qty: 0,
        showLast: false,
      },
    ]);
  };

  const handleSubmit = async (values) => {
    const data = { ...values, items };

    try {
      const create = location.pathname === "/declaration-of-need/create";
      const method = create ? "POST" : "PUT";
      const id = await getParams(location.search, "id");
      const url = create ? "/declaration-of-need/create" : `/declaration-of-need/update?id=${id}`;

      let res = await request(url, method, data);

      if (res?.success) {
        navigate(`/declaration-of-need`);
      }
    } catch (error) {}
  };

  const handleOpenLastDeclarationsModal = async (item) => {
    setSelectedItem(item);
    setLastDeclarationsModal(true);
  };

  // ✅ نمایش مودال MRP
  const handleShowModalMrp = (item) => {
    setMrp(parseMrpSafe(item.mrp));
    setIsModalMrpOpen(true);
  };

  const handleCancelMrp = () => setIsModalMrpOpen(false);

  //-------- > modal upload excel
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFileList([]);
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('لطفا یک فایل انتخاب کنید');
      return;
    }
    const formData = new FormData();
    formData.append('file', fileList[0]);

    setUploading(true);

    const response = request(`/declaration-of-need/import-excel`, "POST", formData, false, null, 'multipart/form-data').then(response => {
      setUploading(false);
      if (response.success) {
        message.success(response.data.message || 'فایل با موفقیت آپلود شد');
        setIsModalOpen(false);
        setFileList([]);
        response.data.forEach((need) => {
          if (Number(need.id) > 0) {
            if (!hasDuplicateProduct(-1, Number(need.id))) {
              const product = products.find(p => p.value == Number(need.id));
              setItems((prev) => [
                ...prev,
                {
                  _id: Date.now(),
                  id: Number(need.id),
                  name: need?.name || '',
                  unit_id: Number(need.unit),
                  first_month_id: Number(need.m1),
                  first_month_value: Number(need.n1),
                  second_month_id: Number(need.m2),
                  second_month_value: Number(need.n2),
                  third_month_id: Number(need.m3),
                  third_month_value: Number(need.n3),
                  desc: need.description,
                  mrp: [],
                  qty: product?.Mojodi || 0,
                  showLast: false,
                },
              ]);
            }
          }
        });
      } else {
        message.error(response.data.message || 'خطایی در آپلود فایل رخ داده است');
      }
    })
    .catch(error => {
      setUploading(false);
      message.error('خطایی در آپلود فایل رخ داده است');
    });

    setUploading(false)
  }

  const props = {
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

  const hasDuplicateProduct = (currentIndex, currentId) => {
    return items.some((item, index) => index !== currentIndex && Number(item.id) > 0 && item.id === currentId);
  };

  // ✅ چک کردن MRP
  const checkMrp = (month, qty, mrp) => {
    if (!month || !mrp) return "";

    const mrpArray = parseMrpSafe(mrp);
    if (mrpArray.length === 0) return "";

    const monthIndex = Number(month);
    if (monthIndex >= 1 && monthIndex <= mrpArray.length) {
      if (Number(qty) > Number(mrpArray[monthIndex])) {
        return (
          <div style={{ color: 'red', textAlign: 'right', fontSize: '12px', marginTop: '4px' }}>
            تعداد بیشتر از حد است
          </div>
        );
      }
    }
    return "";
  };

  return (
    <div className="pa-3" style={{ minHeight: "80vh" }}>
      <Form form={form}
        onFinish={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddItem();
          }
        }}
        layout="vertical">
        <Row>
          <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
            <Item name="supplier_id" label="تامین کننده">
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
          <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
            <Item label="تاریخ" name="date">
              <Datepicker type="text" placeholder="تاریخ" />
            </Item>
          </Col>
          <Col>
            <Item label="وارد کردن فایل اکسل" name="importexcel">
              <Button type="success" htmlType="button" icon={<PlusCircleOutlined />} onClick={showModal}>
                انتخاب فایل
              </Button>
            </Item>
          </Col>
        </Row>
        <Row>
          <div className="d-flex align-items-center gap-5 my-3 pr-3">
            <p className="m-0 font-bold">لیست کالا ها</p>
            <Button icon={<PlusCircleOutlined />} onClick={handleAddItem}>
              افزودن کالا جدید
            </Button>
          </div>
        </Row>
        <Row className="">
          {items
            .sort((a, b) => b._id - a._id)
            .map((item, index) => (

              <Row key={index} className="w-100 pb-3 mb-5" style={{ borderBottom: "1px solid lightGray" }}>

                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
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

                        // ✅ دریافت MRP از API
                        const res = await request(`/declaration-of-need/last?id=${id}&expand=supplier`);
                        const product = products.find(p => p.value == id);

                        // ✅ parse امن MRP
                        const mrpArray = parseMrpSafe(res?.mrp);

                        setItems((prev) =>
                          prev.map((p, i) =>
                            i === index
                              ? {
                                  ...p,
                                  id,
                                  name: product?.label || "",
                                  qty: product?.Mojodi || 0,
                                  mrp: mrpArray,
                                  showLast: res?.data?.length > 0,
                                }
                              : p
                          )
                        );
                        if (res?.data) setLastDeclarations((prev) => ({ ...prev, [id]: res.data }));
                      }}
                      onSearch={(id) => {
                        if (id.length > 1) getProducts(id);
                      }}
                    />
                  </Item>

                  {hasDuplicateProduct(index, items[index].id) && (
                    <div style={{ color: 'red' }}>
                    </div>
                  )}

                  {item?.id && (
                    <>
                      <div className="d-flex justify-content-start gap-2" style={{ marginTop: "-1rem" }}>
                        <p>موجودی</p>
                        <p>:</p>
                        <p>{item.qty}</p>
                      </div>

                      {item?.showLast && (
                        <div className="d-flex justify-content-start gap-2" style={{ marginTop: "-1.2rem", marginRight: "-1rem" }}>
                          <Button type="link" onClick={() => handleOpenLastDeclarationsModal(item)}>
                            اعلام نیازهای 30 روز گذشته
                          </Button>
                        </div>
                      )}

                      {/* ✅ نمایش "خرید از ابتدای دوره" و دکمه MRP */}
                      {item.mrp && parseMrpSafe(item.mrp).length > 2 && (
                        <>
                          <div style={{ fontSize: '12px', marginTop: '8px',textAlign:'right' }}>
                            <span>خرید از ابتدای دوره: </span>
                            <b>{getMrpItem(item.mrp, 13)}</b>
                            <span> {getMrpItem(item.mrp, 0)}</span>

                          <Button type="primary" htmlType="button"  
             
                            onClick={() => handleShowModalMrp(item)}
                            style={{ padding: '0 5px',marginRight:'5px', fontSize: '12px', height: 'auto' }}
                          >
                            نمایش اطلاعات MRP
                          </Button>
                          </div>

                        </>
                      )}
                    </>
                  )}
                </Col>

                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="نام">
                    <Input disabled type="text" value={item.name} />
                  </Item>
                </Col>

                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="واحد">
                    <AntdSelect
                      notSort={true}
                      options={units}
                      value={item.unit_id}
                      placeholder="انتخاب کنید ..."
                      onClear={getUnits}
                      onChange={(unit_id) => setItems((prev) => prev.map((p, i) => (i === index ? { ...p, unit_id } : p)))}
                      onSearch={(unit_id) => {
                        if (unit_id.length > 1) getUnits(unit_id);
                      }}
                    />
                  </Item>
                </Col>

                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="ماه اول">
                    <AntdSelect
                      notSort={true}
                      options={months}
                      value={item.first_month_id}
                      placeholder="انتخاب کنید ..."
                      onChange={(first_month_id) => setItems((prev) => prev.map((p) => ({ ...p, first_month_id })))}
                    />
                  </Item>
                </Col>

                {/* ✅ نیاز ماه اول با MRP */}
                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="نیاز ماه اول">
                    <Input
                      placeholder="نیاز ماه اول"
                      value={item.first_month_value}
                      onChange={(e) => setItems((prev) => prev.map((p, i) => (i === index ? { ...p, first_month_value: e.target.value } : p)))}
                    />
                    {item.first_month_id && item.mrp && parseMrpSafe(item.mrp).length > 0 && (
                      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '4px' }}>
                        MRP: {getMrpItem(item.mrp, item.first_month_id) || "-"}
                      </div>
                    )}
                    {checkMrp(item.first_month_id, item.first_month_value, item.mrp)}
                  </Item>
                </Col>

                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="ماه دوم">
                    <AntdSelect
                      notSort={true}
                      options={months}
                      value={item.second_month_id}
                      placeholder="انتخاب کنید ..."
                      onChange={(second_month_id) => setItems((prev) => prev.map((p) => ({ ...p, second_month_id })))}
                    />
                  </Item>
                </Col>

                {/* ✅ نیاز ماه دوم با MRP */}
                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="نیاز ماه دوم">
                    <Input
                      placeholder="نیاز ماه دوم"
                      value={item.second_month_value}
                      onChange={(e) => setItems((prev) => prev.map((p, i) => (i === index ? { ...p, second_month_value: e.target.value } : p)))}
                    />
                    {item.second_month_id && item.mrp && parseMrpSafe(item.mrp).length > 0 && (
                      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '4px' }}>
                        MRP: {getMrpItem(item.mrp, item.second_month_id) || "-"}
                      </div>
                    )}
                    {checkMrp(item.second_month_id, item.second_month_value, item.mrp)}
                  </Item>
                </Col>

                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="ماه سوم">
                    <AntdSelect
                      notSort={true}
                      options={months}
                      value={item.third_month_id}
                      placeholder="انتخاب کنید ..."
                      onChange={(third_month_id) => setItems((prev) => prev.map((p) => ({ ...p, third_month_id })))}
                    />
                  </Item>
                </Col>

                {/* ✅ نیاز ماه سوم با MRP */}
                <Col className="pr-2" md={4} sm={24} xs={24} lg={4}>
                  <Item label="نیاز ماه سوم">
                    <Input
                      placeholder="نیاز ماه سوم"
                      value={item.third_month_value}
                      onChange={(e) => setItems((prev) => prev.map((p, i) => (i === index ? { ...p, third_month_value: e.target.value } : p)))}
                    />
                    {item.third_month_id && item.mrp && parseMrpSafe(item.mrp).length > 0 && (
                      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '4px' }}>
                        MRP: {getMrpItem(item.mrp, item.third_month_id) || "-"}
                      </div>
                    )}
                    {checkMrp(item.third_month_id, item.third_month_value, item.mrp)}
                  </Item>
                </Col>

                <Col className="pr-2" md={10} sm={24} xs={24} lg={10}>
                  <Item label="توضیحات">
                    <Input
                      type="text"
                      value={item.desc}
                      onChange={(e) => setItems((prev) => prev.map((p, i) => (i === index ? { ...p, desc: e.target.value } : p)))}
                    />
                  </Item>
                </Col>

                <Col className="pr-2" md={2} sm={24} xs={24} lg={2}>
                  <div className="w-100 d-flex align-items-start justify-content-end" style={{ marginTop: "1.8rem" }}>
                    <Button
                      icon={<DeleteOutlined />}
                      style={{ backgroundColor: "red", color: "white" }}
                      onClick={() => setItems((prev) => prev.filter((p, i) => i !== index))}
                    >
                      حذف
                    </Button>
                  </div>
                </Col>
              </Row>
            ))}
        </Row>
        <Form.Item className="text-center">
          <Button type="primary" htmlType="submit" size="large" style={{ width: "25%" }}>
            ذخیره
          </Button>
        </Form.Item>
      </Form>

      {/* ✅ مودال MRP */}
      <Modal
        title="اطلاعات MRP"
        open={isModalMrpOpen}
        onCancel={handleCancelMrp}
        footer={[
          <Button key="back" onClick={handleCancelMrp}>بستن</Button>,
        ]}
        width={600}
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
                  {parseMrpSafe(mrp).slice(1, 13).reduce((sum, val) => sum + (Number(val) || 0), 0)}
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

      {/* مودال اعلام نیازهای 30 روز گذشته */}
      <Modal
        width={1000}
        footer={false}
        title={`اعلام نیازهای 30 روز گذشته : ${selectedItem?.name}`}
        open={lastDeclarationsModal}
        onCancel={() => setLastDeclarationsModal(false)}
      >
        <Row className="pt-4 pr-3 rounded" style={{ backgroundColor: "#f3f3f3" }}>
          <Col xs={24} lg={12}>
            <p>تامین کننده</p>
          </Col>
          <Col xs={24} lg={4}>
            <p>ماه اول</p>
          </Col>
          <Col xs={24} lg={4}>
            <p>ماه دوم</p>
          </Col>
          <Col xs={24} lg={4}>
            <p>ماه سوم</p>
          </Col>
        </Row>
        {Array.isArray(lastDeclarations?.[selectedItem?.id]) &&
          lastDeclarations?.[selectedItem?.id]?.map((l, i) => (
            <Row key={i} className="pt-3 pr-3 mb-2" style={{ borderBottom: "1px solid #dbdbdb" }}>
              <Col xs={24} lg={12}>
                <p>{l?.supplier?.company_name}</p>
              </Col>
              <Col xs={24} lg={4}>
                <p className="d-flex align-items-center justify-content-start gap-1">
                  <span>{months.find((m) => m.value == l.items.first_month_id)?.label || "---"}</span>
                  <span>:</span>
                  <span>({l.items.first_month_value})</span>
                  <span>{units?.find((u) => u.value == l.items.unit_id)?.label}</span>
                </p>
              </Col>
              <Col xs={24} lg={4}>
                <p className="d-flex align-items-center justify-content-start gap-1">
                  <span>{months.find((m) => m.value == l.items.second_month_id)?.label || "---"}</span>
                  <span>:</span>
                  <span>({l.items.second_month_value})</span>
                  <span>{units?.find((u) => u.value == l.items.unit_id)?.label}</span>
                </p>
              </Col>
              <Col xs={24} lg={4}>
                <p className="d-flex align-items-center justify-content-start gap-1">
                  <span>{months.find((m) => m.value == l.items.third_month_id)?.label || "---"}</span>
                  <span>:</span>
                  <span>({l.items.third_month_value})</span>
                  <span>{units?.find((u) => u.value == l.items.unit_id)?.label}</span>
                </p>
              </Col>
            </Row>
          ))}
      </Modal>

      {/* مودال برای آپلود فایل */}
      <Modal
        title="ایمپورت اعلام نیاز از فایل اکسل"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            انصراف
          </Button>,
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
        <p>فایل اکسل اعلام نیاز را انتخاب کنید</p>
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">برای انتخاب فایل کلیک یا آن را به اینجا بکشید</p>
          <p className="ant-upload-hint">از فایل‌های با فرمت xlsx یا xls استفاده کنید</p>
        </Dragger>
      </Modal>
    </div>
  );
}