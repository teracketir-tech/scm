import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Button, 
  Row, 
  Col, 
  Radio, 
  message,
  Divider,
  InputNumber
} from "antd";
import { useEffect, useState } from "react";
import { request, rules } from "../../module/util";
import AntdSelect from "../../components/AntdSelect";
import { NumberFormat } from "../../components/NumberFormat";
import Datepicker from "../../components/DatePicker";
import {
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  SyncOutlined,
} from "@ant-design/icons";
const { Item, useForm } = Form;

// ماه‌های سال
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

export default function ProductOrderModal({ open, onClose, product, onSuccess }) {
  const [form] = useForm();
  // ✅ Watch فیلدهای ماه و مقدار نیاز
const firstMonthId = Form.useWatch("first_month_id", form);
const firstMonthValue = Form.useWatch("first_month_value", form);
const secondMonthId = Form.useWatch("second_month_id", form);
const secondMonthValue = Form.useWatch("second_month_value", form);
const thirdMonthId = Form.useWatch("third_month_id", form);
const thirdMonthValue = Form.useWatch("third_month_value", form);
  const [loading, setLoading] = useState(false);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [loadingLastData, setLoadingLastData] = useState(false);
  // داده‌های کمکی
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [carTypes, setCarTypes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [types, setTypes] = useState([]);
  const [packings, setPackings] = useState([]);
  const [warrantyStatuses, setWarrantyStatuses] = useState([]);
  const [placeDeliveries, setPlaceDeliveries] = useState([]);
 const [mrpData, setMrpData] = useState([]);

// در useEffect وقتی مودال باز میشه
useEffect(() => {
  if (open) {
    getFormData();
    getSuppliers();
    getUnits();

    if (product) {
      form.setFieldsValue({
        product_id: product.id,
        product_desc: product.name,
        product_serial: product.trackcode || product.id,
        price: product.LastPrice || 0,
      });

      fetchLastProductOrderData();
      fetchMrpData(); // ✅ این خط
    }
  }
}, [open, product]);

// ✅ دریافت MRP
const fetchMrpData = async () => {
  if (!product?.id) return;

  try {
    const res = await request(`/declaration-of-need/last?id=${product.id}&expand=supplier`);

    if (res) {
      // ✅ parse امن MRP
      setMrpData(parseMrpSafe(res?.mrp));
    }
  } catch (error) {
    console.error("Error fetching MRP:", error);
    setMrpData([]);
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

/**
 * دریافت آخرین خوداظهاری و اعلام نیاز کاربر برای این محصول
 */
const fetchLastProductOrderData = async () => {
  if (!product) return;

  setLoadingLastData(true);
  try {
    let url = `/order-api/last-product-order-data?product_id=${product.id}`;

    if (product.trackcode) {
      url += `&trackcode=${encodeURIComponent(product.trackcode)}`;
    }
    if (product.name) {
      url += `&product_name=${encodeURIComponent(product.name)}`;
    }

    const res = await request(url, "GET");

    if (res?.success && res?.data) {
      const { self_declaration, declaration_of_need } = res.data;

      // ✅ 1. پر کردن فیلدهای خوداظهاری از آخرین رکورد
      if (self_declaration) {
        const selfData = {};

        if (self_declaration.car_type) selfData.car_type = self_declaration.car_type;
        if (self_declaration.type) selfData.type = self_declaration.type;
        if (self_declaration.price) selfData.price = self_declaration.price;
        if (self_declaration.brand) selfData.brand = self_declaration.brand;
        if (self_declaration.country) selfData.country = self_declaration.country;
        if (self_declaration.capacity) selfData.capacity = self_declaration.capacity;
        if (self_declaration.delivery_time) selfData.delivery_time = self_declaration.delivery_time;
        if (self_declaration.technical_number) selfData.technical_number = self_declaration.technical_number;

        // فیلدهای اضافی (در صورت وجود در فرم)
        if (self_declaration.warranty_status) selfData.warranty_status = self_declaration.warranty_status;
        if (self_declaration.warranty_time) selfData.warranty_time = self_declaration.warranty_time;
        if (self_declaration.price_validity_time) selfData.price_validity_time = self_declaration.price_validity_time;
        if (self_declaration.number_per_month) selfData.number_per_month = self_declaration.number_per_month;
        if (self_declaration.packaging_method) selfData.packaging_method = self_declaration.packaging_method;
        if (self_declaration.place_delivery_id) selfData.place_delivery_id = self_declaration.place_delivery_id;
        if (self_declaration.payment_method) selfData.payment_method = self_declaration.payment_method;
        if (self_declaration.payment_terms) selfData.payment_terms = self_declaration.payment_terms;
        if (self_declaration.grade) selfData.grade = self_declaration.grade;

        form.setFieldsValue(selfData);
      }

      // ✅ 2. پر کردن فیلدهای اعلام نیاز از آخرین رکورد
      if (declaration_of_need) {
        const needData = {};

        // تامین‌کننده - از آخرین رکورد
        if (declaration_of_need.supplier_id) {
          needData.supplier_id = declaration_of_need.supplier_id;
        }

        // واحد
        if (declaration_of_need.unit_id) {
          needData.unit_id = declaration_of_need.unit_id;
        }

        // ماه اول و مقدارش
        if (declaration_of_need.first_month_id) {
          needData.first_month_id = declaration_of_need.first_month_id;
        }
        if (declaration_of_need.first_month_value) {
          needData.first_month_value = declaration_of_need.first_month_value;
        }

        // ماه دوم و مقدارش
        if (declaration_of_need.second_month_id) {
          needData.second_month_id = declaration_of_need.second_month_id;
        }
        if (declaration_of_need.second_month_value) {
          needData.second_month_value = declaration_of_need.second_month_value;
        }

        // ماه سوم و مقدارش
        if (declaration_of_need.third_month_id) {
          needData.third_month_id = declaration_of_need.third_month_id;
        }
        if (declaration_of_need.third_month_value) {
          needData.third_month_value = declaration_of_need.third_month_value;
        }

        // توضیحات اعلام نیاز
        if (declaration_of_need.desc) {
          needData.need_desc = declaration_of_need.desc;
        }

        form.setFieldsValue(needData);
      }

      // ✅ 3. نمایش پیام
      if (res.data.has_self_declaration || res.data.has_declaration_of_need) {
        const messages = [];
        if (res.data.has_self_declaration) messages.push('خوداظهاری');
        if (res.data.has_declaration_of_need) messages.push('اعلام نیاز');

        message.info({
          content: `اطلاعات ${messages.join(' و ')} قبلی برای این محصول بارگذاری شد`,
          duration: 3,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching last product order data:", error);
  } finally {
    setLoadingLastData(false);
  }
};
  // ✅ دریافت تمام داده‌های فرم یکجا از یک endpoint
  const getFormData = async () => {
    setLoadingFormData(true);
    try {
      const res = await request(`/self-declarations/form-data`, "GET");
      
      if (res?.success && res?.data) {
        // نگاشت داده‌ها به stateهای مربوطه
        setCarTypes(res.data.car_types || []);
        setCountries(res.data.country || []);
        setTypes(res.data.type || []);
        setPackings(res.data.packing || []);
        setWarrantyStatuses(res.data.warranty_status || []);
        setPlaceDeliveries(res.data.place_delivery || []);
        
        // اگر status هم نیاز بود
        // setStatuses(res.data.status || []);
      }
    } catch (error) {
      console.error("Error loading form data:", error);
      message.error("خطا در دریافت اطلاعات فرم");
    } finally {
      setLoadingFormData(false);
    }
  };

  const getSuppliers = async (query = "") => {
    try {
      const res = await request(`/users/get-suppliers?query=${query}`, "GET");
      if (res?.success) {
       
        setSuppliers(res.data.map((s) => ({ 
          label: `${s.first_name}  ${s.last_name}  - ${s.company_name} - کد : ${s.id}`, 
          value: s.id 
        })));
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const getUnits = async (name = "") => {
    try {
      const res = await request(`/unit?name=${name}`, "GET");
      if (res?.success) {
        setUnits(res.data.map((b) => ({ label: b.name, value: b.id })));
      }
    } catch (error) {
      console.error("Error loading units:", error);
    }
  };

   const handleSubmit = async (values) => {
  setLoading(true);
  try {
    // ✅ دیباگ — این رو موقتاً بذار
    console.log('📤 values:', values);
    console.log('📤 supplier_id:', values.supplier_id);
    console.log('📤 months:', {
      first: { id: values.first_month_id, value: values.first_month_value },
      second: { id: values.second_month_id, value: values.second_month_value },
      third: { id: values.third_month_id, value: values.third_month_value },
    });

    // 1️⃣ ثبت خوداظهاری
    const selfData = {
      car_type: values.car_type,
      product_desc: values.product_desc,
      product_serial: values.product_serial,
      price: values.price,
      type: values.type,
      brand: values.brand,
      country: values.country,
      capacity: values.capacity,
      delivery_time: values.delivery_time,
      technical_number: values.technical_number,
      supplier_id: values.supplier_id,  // ✅ اضافه شد
    };

    console.log('📤 selfData:', selfData);

    const selfRes = await request(`/self-declarations`, "POST", selfData);
    
    if (!selfRes?.success) {
      message.error(selfRes?.message || "خطا در ثبت خوداظهاری");
      setLoading(false);
      return;
    }

    // 2️⃣ ثبت اعلام نیاز
    const items = [
      {
        _id: Date.now(),
        id: product.id,
        name: product.name,
        unit_id: values.unit_id,
        // ✅ مطمئن شو undefined به null تبدیل نشه
        first_month_id: values.first_month_id ?? null,
        first_month_value: values.first_month_value ?? 0,
        second_month_id: values.second_month_id ?? null,
        second_month_value: values.second_month_value ?? 0,
        third_month_id: values.third_month_id ?? null,
        third_month_value: values.third_month_value ?? 0,
        desc: values.need_desc || "",
      }
    ];

    const needData = {
      supplier_id: values.supplier_id,
      date: values.date,
      items: JSON.stringify(items),
    };

    console.log('📤 needData:', needData);
    console.log('📤 items JSON:', needData.items);

    const needRes = await request(`/declaration-of-need/create`, "POST", needData);
    
    if (!needRes?.success) {
      message.error(needRes?.message || "خطا در ثبت اعلام نیاز");
      setLoading(false);
      return;
    }

    // 3️⃣ تغییر وضعیت
    const markRes = await request(
      `/order-api/reorder-points/mark-ordered`,
      "POST",
      { product_id: product.id }
    );

    if (markRes?.success) {
      message.success("درخواست با موفقیت ثبت شد");
    } else {
      message.warning("درخواست ثبت شد اما وضعیت محصول به‌روزرسانی نشد");
    }

    form.resetFields();
    if (onSuccess) onSuccess();
    onClose();
    
  } catch (error) {
    console.error(error);
    message.error("خطا در ارتباط با سرور");
  } finally {
    setLoading(false);
  }
};
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1000}
      title={
        <div>
          <span>ثبت درخواست برای محصول: </span>
          <span style={{ color: "#1890ff" }}>{product?.name}</span>
          <span style={{ marginRight: 8, color: "#666" }}>({product?.id})</span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose}>
          انصراف
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={() => form.submit()}
        >
          ثبت درخواست
        </Button>,
      ]}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "calc(90vh - 150px)", overflow: "auto" }}
    >
      {/* اطلاعات محصول */}
      <div style={{ 
        padding: 12, 
        background: "#f5f5f5", 
        borderRadius: 6, 
        marginBottom: 20,
        display: "flex",
        gap: 24,
        flexWrap: "wrap"
      }}>
        <div>
          <span style={{ color: "#666" }}>کد محصول: </span>
          <strong>{product?.id}</strong>
        </div>
        <div>
          <span style={{ color: "#666" }}>نام: </span>
          <strong>{product?.name}</strong>
        </div>
        <div>
          <span style={{ color: "#666" }}>شناسه کالا: </span>
          <strong>{product?.trackcode || "-"}</strong>
        </div>
        <div>
          <span style={{ color: "#666" }}>قیمت آخرین: </span>
          <strong style={{ color: "#1890ff" }}>
            {product?.LastPrice?.toLocaleString()} تومان
          </strong>
        </div>
        <div>
          <span style={{ color: "#666" }}>موجودی: </span>
          <strong style={{ color: product?.Mojodi > 0 ? "#52c41a" : "#ff4d4f" }}>
            {product?.Mojodi?.toLocaleString()}
          </strong>
        </div>
      </div>
    {loadingLastData && (
      <div style={{ 
        textAlign: "center", 
        padding: 12, 
        background: "#e6f7ff", 
        border: "1px solid #91d5ff",
        borderRadius: 6,
        marginBottom: 16 
      }}>
        <SyncOutlined spin style={{ marginRight: 8 }} />
        در حال بارگذاری اطلاعات قبلی...
      </div>
    )}
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        {/* ============ بخش خوداظهاری ============ */}
        <Divider orientation="right" style={{ margin: "0 0 16px 0" }}>
          <span style={{ color: "#1890ff", fontWeight: "bold" }}>📋 اطلاعات خوداظهاری</span>
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Item 
              name="car_type" 
              label="نوع خودرو" 
              rules={rules("نوع خودرو")}
            >
              <AntdSelect
                options={carTypes}
                placeholder="انتخاب کنید ..."
                loading={loadingFormData}
              />
            </Item>
          </Col>
          <Col span={8}>
            <Item 
              name="type" 
              label="نوع" 
              rules={rules("نوع")}
            >
              <AntdSelect
                options={types}
                placeholder="انتخاب کنید ..."
                loading={loadingFormData}
              />
            </Item>
          </Col>
          <Col span={8}>
            <Item 
              name="price" 
              label="قیمت" 
              rules={rules("قیمت")}
            >
              <NumberFormat />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item 
              name="product_desc" 
              label="شرح قطعه" 
              rules={rules("شرح قطعه")}
            >
              <Input />
            </Item>
          </Col>
          <Col span={12}>
            <Item 
              name="product_serial" 
              label="سریال قطعه" 
              rules={rules("سریال قطعه")}
            >
              <Input />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Item name="brand" label="برند" rules={rules("برند")}>
              <Input />
            </Item>
          </Col>
          <Col span={8}>
            <Item name="country" label="کشور">
              <AntdSelect
                options={countries}
                placeholder="انتخاب کنید ..."
                loading={loadingFormData}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Item>
          </Col>
          <Col span={8}>
            <Item 
              name="capacity" 
              label="ظرفیت تامین در ماه" 
              rules={rules("ظرفیت تامین در ماه")}
            >
              <Input />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item name="delivery_time" label="زمان تحویل (ماه)">
              <Input />
            </Item>
          </Col>
          <Col span={12}>
            <Item name="technical_number" label="شماره فنی تامین‌کننده">
              <Input />
            </Item>
          </Col>
        </Row>

        {/* ============ بخش اعلام نیاز ============ */}
        <Divider orientation="right" style={{ margin: "16px 0" }}>
          <span style={{ color: "#52c41a", fontWeight: "bold" }}>📦 اطلاعات اعلام نیاز</span>
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Item 
              name="supplier_id" 
              label="تامین‌کننده" 
              rules={rules("تامین‌کننده")}
            >
              <AntdSelect
                options={suppliers}
                placeholder="انتخاب کنید ..."
                showSearch
                onSearch={(e) => {
                  if (e.length > 1) getSuppliers(e);
                }}
                filterOption={false}
              />
            </Item>
          </Col>
          <Col span={12}>
            <Item name="date" label="تاریخ اعلام نیاز">
              <Datepicker type="text" placeholder="تاریخ" />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Item 
              name="unit_id" 
              label="واحد" 
              rules={rules("واحد")}
            >
              <AntdSelect
                options={units}
                placeholder="انتخاب کنید ..."
                showSearch
                onSearch={(name) => {
                  if (name.length > 1) getUnits(name);
                }}
                filterOption={false}
              />
            </Item>
          </Col>
        </Row>

        <Row gutter={16}>
  <Col span={8}>
    <Item name="first_month_id" label="ماه اول">
      <Select
        options={months}
        placeholder="انتخاب کنید ..."
        allowClear
      />
    </Item>
  </Col>
  <Col span={8}>
    <Item name="second_month_id" label="ماه دوم">
      <Select
        options={months}
        placeholder="انتخاب کنید ..."
        allowClear
      />
    </Item>
  </Col>
  <Col span={8}>
    <Item name="third_month_id" label="ماه سوم">
      <Select
        options={months}
        placeholder="انتخاب کنید ..."
        allowClear
      />
    </Item>
  </Col>
</Row>
<Row gutter={16}>
  <Col span={8}>
    <Item name="first_month_value" label="نیاز ماه اول">
      <InputNumber
        style={{ width: "100%" }}
        placeholder="تعداد"
        min={0}
      />
    </Item>
    {/* ✅ خارج از Form.Item */}
    {firstMonthId && mrpData.length > 0 && (
      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '-16px', marginBottom: '8px' }}>
        MRP: {getMrpItem(mrpData, firstMonthId) || "-"}
      </div>
    )}
    {checkMrp(firstMonthId, firstMonthValue, mrpData)}
  </Col>

  <Col span={8}>
    <Item name="second_month_value" label="نیاز ماه دوم">
      <InputNumber
        style={{ width: "100%" }}
        placeholder="تعداد"
        min={0}
      />
    </Item>
    {secondMonthId && mrpData.length > 0 && (
      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '-16px', marginBottom: '8px' }}>
        MRP: {getMrpItem(mrpData, secondMonthId) || "-"}
      </div>
    )}
    {checkMrp(secondMonthId, secondMonthValue, mrpData)}
  </Col>

  <Col span={8}>
    <Item name="third_month_value" label="نیاز ماه سوم">
      <InputNumber
        style={{ width: "100%" }}
        placeholder="تعداد"
        min={0}
      />
    </Item>
    {thirdMonthId && mrpData.length > 0 && (
      <div style={{ fontSize: '12px', color: '#1890ff', marginTop: '-16px', marginBottom: '8px' }}>
        MRP: {getMrpItem(mrpData, thirdMonthId) || "-"}
      </div>
    )}
    {checkMrp(thirdMonthId, thirdMonthValue, mrpData)}
  </Col>
</Row>

        <Item name="need_desc" label="توضیحات اعلام نیاز">
          <Input.TextArea
            rows={3}
            placeholder="توضیحات اضافی..."
            maxLength={500}
            showCount
          />
        </Item>
      </Form>
    </Modal>
  );
}