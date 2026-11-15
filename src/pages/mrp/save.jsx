import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, message, Modal, Tag } from 'antd';
import { useAuthContext } from "../../components/AuthProvider";
import { request } from "../../module/util";

export const SaveMrp = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  mrpId = null
}) => {
  const { setTitle } = useAuthContext();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState(null);
  
  const months = [
    "فروردین", "اردیبهشت", "خرداد", 
    "تیر", "مرداد", "شهریور", 
    "مهر", "آبان", "آذر", 
    "دی", "بهمن", "اسفند"
  ];

  useEffect(() => {
    if (visible && mrpId) {
      fetchProduct();
    } else {
      form.resetFields();
      setProduct(null);
    }
  }, [visible, mrpId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await request(
        `https://portalapi.dinapart.ir/api/mrp-search-product?id=${mrpId}`,
        'GET', null, false, true
      );
      
      if (response.success && response.product) {
        setProduct(response.product);
        setTitle(`ویرایش MRP: ${response.product.name}`);
        
        let mrpData = [];
        try {
          mrpData = JSON.parse(response.product.data || '[]');
        } catch (e) {
          console.error('Error parsing MRP data:', e);
          mrpData = ["عدد", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        // پر کردن 12 ماه از ایندکس 1 تا 12
        const formValues = {};
        months.forEach((month, index) => {
          formValues[`month_${index + 1}`] = mrpData[index + 1] ?? 0;
        });
        
        form.setFieldsValue(formValues);
      } else {
        message.error('محصول یافت نشد');
        handleCancel();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      message.error('خطا در دریافت اطلاعات محصول');
      handleCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    if (!mrpId) return;

    setSaving(true);
    try {
      const parsedData = product?.data ? JSON.parse(product.data) : [];

      // ساخت آرایه 16 عنصری سازگار با ساختار جدید
      // [0]=واحد, [1..12]=ماه‌ها, [13]=برنامه فروش کلی, [14]=اولویت, [15]=فصلی
      const mrpArray = [];
      mrpArray.push(parsedData[0] || "عدد");       // [0] واحد - حفظ شود
      
      for (let i = 1; i <= 12; i++) {              // [1..12] ماه‌ها از فرم
        mrpArray.push(Number(values[`month_${i}`]) || 0);
      }
      
      mrpArray.push(parsedData[13] || 0);          // [13] برنامه فروش کلی - حفظ شود
      mrpArray.push(parsedData[14] ?? null);       // [14] اولویت - حفظ شود
      mrpArray.push(parsedData[15] ?? null);       // [15] فصلی - حفظ شود

      const response = await request(
        'https://portalapi.dinapart.ir/api/mrp-update-product', 
        'POST', 
        { 
          id: mrpId,
          mrp: JSON.stringify(mrpArray)
        },
        false,
        true
      );

      if (response.success) {
        message.success('اطلاعات MRP با موفقیت به روز شد');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(response.message || 'خطا در ذخیره اطلاعات');
      }
    } catch (error) {
      console.error('Error saving MRP:', error);
      message.error('خطا در ذخیره اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setProduct(null);
    if (onCancel) {
      onCancel();
    }
  };

  // استخراج داده‌های اضافی برای نمایش
  const parsedExtra = product?.data ? (() => {
    try { return JSON.parse(product.data); } catch { return []; }
  })() : [];

  return (
    <Modal
      title={`ویرایش MRP - ${product ? `${product.id} - ${product.name}` : ''}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
      style={{ top: 20 }}
      loading={loading}
    >
      {/* نمایش فیلدهای جدید (فقط خواندنی) */}
      {product && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag color="orange">اولویت: {parsedExtra[14] ?? '-'}</Tag>
          <Tag color="purple">فصلی: {parsedExtra[15] ?? '-'}</Tag>
          <Tag color="blue">برنامه فروش کلی: {parsedExtra[13] ?? '-'}</Tag>
          <Tag color="default">واحد: {parsedExtra[0] ?? '-'}</Tag>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        <Row gutter={[16, 16]}>
          {months.map((month, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Form.Item
                name={`month_${index + 1}`}
                label={month}
                rules={[
                  { 
                    required: true, 
                    message: `لطفا مقدار ${month} را وارد کنید` 
                  },
                  {
                    pattern: /^\d+$/,
                    message: 'لطفا فقط عدد وارد کنید'
                  }
                ]}
              >
                <Input 
                  type="number" 
                  min="0" 
                  placeholder={`مقدار ${month}`}
                />
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Form.Item style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            size="large"
            loading={saving}
            style={{ width: '200px' }}
          >
            ذخیره تغییرات
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SaveMrp;