import { Button, Divider, Form, Input, InputNumber, Checkbox, message, AutoComplete, Card, Row, Col, Tag } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { request } from "../../module/util";
import moment from "moment";

export default function CreateSupplieInventory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // State برای جستجوی محصول
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearchValue, setProductSearchValue] = useState("");
  
  // برای نمایش/عدم نمایش فیلدهای اعتباری
  const [isCredit, setIsCredit] = useState(false);

  // بررسی اگر در حالت ویرایش هستیم
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setIsEdit(true);
      setEditId(id);
      fetchData(id);
    }
  }, [location]);

  const fetchData = async (id) => {
    setLoading(true);
    try {
      const res = await request(`/supplier-inventory/${id}`, "GET");
      if (res["success"]) {
        const data = res["data"];
        
        // بررسی آیا محصول اعتباری دارد
        const hasCredit = data["has_credit"] === 1 || data["has_credit"] === 2;
        setIsCredit(hasCredit);
        
        form.setFieldsValue({
          product_id: data["product_id"],
          product_name: data["product_name"],
          price: data["price"],
          price_valid_day: data["price_valid_day"],
          price_product_day: data["price_product_day"],
          product_count: data["product_count"],
          // فیلدهای اعتباری
          credit_price: data["credit_price"],
          credit_price_valid_day: data["credit_price_valid_day"],
          credit_due_date: data["credit_due_date"],
          credit_product_count: data["credit_product_count"],
          credit_product_day: data["credit_product_day"],
        });
        setProductSearchValue(data["product_id"]);
      } else {
        message.error("خطا در دریافت اطلاعات");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // جستجوی محصول از API خارجی
  const searchProduct = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setProducts([]);
      return;
    }

    setSearching(true);
    try {
      const res = await request(
        `https://portalapi.dinapart.ir/api/scm-search-products?s=${searchText}`,
        "GET",
        null,
        true,
        true
      );
      
      if (res?.data && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
    } finally {
      setSearching(false);
    }
  };

  // انتخاب محصول از لیست
  const handleSelectProduct = (value, option) => {
    const product = products.find(p => p.code.toString() === value);
    if (product) {
      setSelectedProduct(product);
      setProductSearchValue(product.code.toString());
      
      form.setFieldsValue({
        product_id: product.code.toString(),
        product_name: product.label,
      });
      
      // پر کردن قیمت پیشنهادی
      if (product.LastPrice && !isEdit) {
        form.setFieldsValue({
          price: product.LastPrice,
        });
      }
    }
  };

  // جستجو هنگام تایپ
  const handleSearch = (value) => {
    setProductSearchValue(value);
    if (value && value.length >= 2) {
      searchProduct(value);
    } else {
      setProducts([]);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let url = "/supplier-inventory";
      let method = "POST";
      
      const submitData = {
        product_id: values.product_id,
        product_name: values.product_name,
        has_credit: isCredit ? 2 : 0,  // 2 = هر دو نوع، 0 = فقط نقدی
        // اطلاعات نقدی (همیشه ارسال می‌شه)
        price: values.price,
        price_valid_day: values.price_valid_day || 0,
        price_product_day: values.price_product_day || 0,
        product_count: values.product_count || 0,
      };
      
      // اگر اعتباری فعال بود، اطلاعات اعتباری رو هم اضافه کن
      if (isCredit) {
        submitData.credit_price = values.credit_price || 0;
        submitData.credit_price_valid_day = values.credit_price_valid_day || 0;
        submitData.credit_due_date = values.credit_due_date || 0;
        submitData.credit_product_count = values.credit_product_count || 0;
        submitData.credit_product_day = values.credit_product_day || 0;
      }
      
      if (isEdit && editId) {
        url = `/supplier-inventory/${editId}`;
        method = "PUT";
        delete submitData.product_name;
      }
      
      const res = await request(url, method, submitData);
      if (res["success"]) {
        message.success(isEdit ? "محصول با موفقیت ویرایش شد" : "محصول با موفقیت ثبت شد");
        navigate("/supplier-inventory/list");
      } else {
        message.error(res["message"] || "خطا در ثبت اطلاعات");
      }
    } catch (error) {
      console.error("Submit error:", error);
      message.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // گزینه‌های AutoComplete
  const options = products.map(product => ({
    label: `${product.code} - ${product.label}`,
    value: product.code.toString(),
    product: product
  }));

  return (
    <>
      <div className="flexible-header" style={{textAlign:'right',padding:'10px'}}>
        <h5>{isEdit ? "ویرایش محصول" : "ثبت محصول جدید"}</h5>
      </div>
      
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* کد محصول - فقط در حالت ثبت جدید فعال است */}
        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="product_id"
              label="کد محصول"
              rules={[{ required: true, message: "لطفاً کد محصول را وارد کنید" }]}
            >
              <AutoComplete
                options={options}
                onSearch={handleSearch}
                onSelect={handleSelectProduct}
                placeholder="کد محصول را وارد کنید... (حداقل 2 کاراکتر)"
                value={productSearchValue}
                onChange={setProductSearchValue}
                notFoundContent={searching ? "در حال جستجو..." : "محصولی یافت نشد"}
                allowClear
                style={{ width: '100%' }}
                disabled={isEdit}
              />
            </Form.Item>
          </div>

          <div className="col-md-6">
            <Form.Item
              name="product_name"
              label="نام محصول"
              rules={[{ required: true, message: "لطفاً نام محصول را وارد کنید" }]}
            >
              <Input 
                placeholder="نام محصول" 
                readOnly
                disabled={isEdit}
              />
            </Form.Item>
          </div>
        </div>

        {/* اطلاعات نقدی */}
        <Card title=" اطلاعات فروش نقدی" style={{ marginBottom: 16 }}>
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="price"
                label="قیمت نقدی (تومان)"
                rules={[{ required: true, message: "لطفاً قیمت نقدی را وارد کنید" }]}
              >
                <InputNumber 
                  className="w-100" 
                  placeholder="قیمت نقدی" 
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/,/g, '')}
                />
              </Form.Item>
            </div>
            
            <div className="col-md-6">
              <Form.Item
                name="product_count"
                label="تعداد موجودی نقدی"
                rules={[{ required: true, message: "لطفاً تعداد موجودی را وارد کنید" }]}
              >
                <InputNumber 
                  className="w-100" 
                  placeholder="تعداد موجودی" 
                  min={0}
                />
              </Form.Item>
            </div>
            
            <div className="col-md-6">
              <Form.Item
                name="price_valid_day"
                label="تعداد روز اعتبار قیمت"
                rules={[{ required: true, message: "لطفاً تعداد روز اعتبار قیمت را وارد کنید" }]}
              >
                <InputNumber 
                  className="w-100" 
                  placeholder="تعداد روز اعتبار قیمت" 
                  min={0}
                />
              </Form.Item>
            </div>
            
            <div className="col-md-6">
              <Form.Item
                name="price_product_day"
                label="زمان تحویل (روز)"
                rules={[{ required: true, message: "لطفاً زمان تحویل را وارد کنید" }]}
              >
                <InputNumber 
                  className="w-100" 
                  placeholder="زمان تحویل بر حسب روز" 
                  min={0}
                />
              </Form.Item>
            </div>
          </div>
        </Card>

        {/* چک باکس فروش اعتباری */}
        <div style={{textAlign:'right'}}>
           <Form.Item>
          <Checkbox 
            checked={isCredit} 
            onChange={(e) => setIsCredit(e.target.checked)}
          >
            <Tag color="orange"> ارائه فروش اعتباری</Tag>
          </Checkbox>
          <span style={{ marginRight: 8, color: '#666', fontSize: 12 }}>
            (در صورت فعال بودن، می‌توانید اطلاعات فروش اعتباری را وارد کنید)
          </span>
        </Form.Item>
        </div>

        {/* اطلاعات اعتباری - فقط در صورت فعال بودن نمایش داده می‌شود */}
        {isCredit && (
          <Card title=" اطلاعات فروش اعتباری" style={{ marginBottom: 16, backgroundColor: '#fff7e6' }}>
            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  name="credit_price"
                  label="قیمت اعتباری (تومان)"
                  rules={[{ required: true, message: "لطفاً قیمت اعتباری را وارد کنید" }]}
                >
                  <InputNumber 
                    className="w-100" 
                    placeholder="قیمت اعتباری" 
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/,/g, '')}
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="credit_product_count"
                  label="تعداد موجودی اعتباری"
                  rules={[{ required: true, message: "لطفاً موجودی اعتباری را وارد کنید" }]}
                >
                  <InputNumber 
                    className="w-100" 
                    placeholder="تعداد موجودی اعتباری" 
                    min={0}
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="credit_price_valid_day"
                  label="تعداد روز اعتبار قیمت اعتباری"
                  rules={[{ required: true, message: "لطفاً تعداد روز اعتبار قیمت اعتباری را وارد کنید" }]}
                >
                  <InputNumber 
                    className="w-100" 
                    placeholder="تعداد روز اعتبار قیمت اعتباری" 
                    min={0}
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="credit_due_date"
                  label="مهلت سررسید اعتبار (روز)"
                  rules={[{ required: true, message: "لطفاً مهلت سررسید اعتبار را وارد کنید" }]}
                  tooltip="مدت زمانی که خریدار فرصت دارد بدهی خود را پرداخت کند"
                >
                  <InputNumber 
                    className="w-100" 
                    placeholder="مهلت سررسید بر حسب روز" 
                    min={1}
                  />
                </Form.Item>
              </div>
              
              <div className="col-md-6">
                <Form.Item
                  name="credit_product_day"
                  label="زمان آماده‌سازی اعتباری (روز)"
                  rules={[{ required: true, message: "لطفاً زمان آماده‌سازی اعتباری را وارد کنید" }]}
                >
                  <InputNumber 
                    className="w-100" 
                    placeholder="زمان آماده‌سازی بر حسب روز" 
                    min={0}
                  />
                </Form.Item>
              </div>
            </div>
          </Card>
        )}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "ویرایش" : "ثبت"}
          </Button>
          <Button className="mr-2" onClick={() => navigate("/supplier-inventory/list")}>
            بازگشت
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}