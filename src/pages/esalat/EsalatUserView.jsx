import React, { useEffect, useState } from "react";
import { Button, Spin, message, Modal, Form, Tag } from "antd";
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  UserOutlined, 
  FileTextOutlined 
} from "@ant-design/icons";
import { useAuthContext } from "../../components/AuthProvider";
import { checkAccess, request } from "../../module/util";
import { DetailCard } from "../../components/DetailCard";
import { DataTable } from "../../components/DataTable";
import { FloatingInput } from "../../components/FloatingInput";
import { FloatingSelect } from "../../components/FloatingSelect";

const { Item } = Form;

export const EsalatUserView = ({ visible, onCancel, userId }) => {
  const { setTitle, auth, handleDelete } = useAuthContext();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isWarrantyModalVisible, setIsWarrantyModalVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [warrantyForm] = Form.useForm();

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await request(`/users/esalat/${userId}`, "GET");
      if (response.data) {
        const { user, orders } = response.data;
        setUser(user);
        setOrders(orders || []);
        setTitle(`مشاهده اطلاعات کاربر: ${user.username}`);
      } else {
        message.error("خطایی در بارگذاری اطلاعات رخ داده است.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("خطا در بارگذاری اطلاعات.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    editForm.setFieldsValue({
      username: user.username,
      chassis_number: user.chassis_number,
      license_plate_number: user.license_plate_number,
      status: user.status,
    });
  };

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const response = await request(`/users/esalat/user/${userId}`, "PUT", values);
      if (response.success) {
        message.success("اطلاعات با موفقیت ویرایش شد.");
        setUser({ ...user, ...values });
        setIsEditing(false);
        fetchData();
      } else {
        message.error("ویرایش اطلاعات ناموفق بود.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleAddWarranty = async () => {
    try {
      const values = await warrantyForm.validateFields();
      const response = await request(`/users/esalat/user/${userId}/add-warranty`, "POST", values);
      if (response.success) {
        message.success("کد گارانتی با موفقیت افزوده شد.");
        setOrders([...orders, response.data]);
        setIsWarrantyModalVisible(false);
        warrantyForm.resetFields();
        fetchData();
      } else {
        message.error("افزودن کد گارانتی ناموفق بود.");
      }
    } catch (error) {
      console.error("Error adding warranty code:", error);
    }
  };

  useEffect(() => {
    if (visible && userId) fetchData();
    else { setUser(null); setOrders([]); }
  }, [visible, userId]);

  const orderColumns = [
    {
      title: "کد ضمانت",
      dataIndex: "warranty_code",
      key: "warranty_code",
      render: (text) => (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {text}
        </span>
      ),
    },
    { title: "نام محصول", dataIndex: "name", key: "name" },
    { title: "کد محصول", dataIndex: "product_code", key: "product_code" },
    { 
      title: "تاریخ شروع ضمانت", 
      dataIndex: "activation_start_date", 
      key: "activation_start_date",
      render: (date) => <span isfarsi="true">{date ? new Date(date).toLocaleDateString("fa-IR") : '-'}</span>,
    },
    { 
      title: "تاریخ پایان ضمانت", 
      dataIndex: "activation_end_date", 
      key: "activation_end_date",
      render: (date) => <span isfarsi="true">{date ? new Date(date).toLocaleDateString("fa-IR") : '-'}</span>,
    },
    {
      title: "مبلغ",
      dataIndex: "price",
      key: "price",
      render: (price) => <span isfarsi="true">{price ? `${Number(price).toLocaleString()} تومان` : '-'}</span>,
    },
  ];

  const handleViewCancel = () => {
    setIsEditing(false);
    setIsWarrantyModalVisible(false);
    if (onCancel) onCancel();
  };

  // تبدیل داده‌های کاربر به فیلدهای DetailCard
  const userFields = user ? [
    { label: "شناسه", value: user.id, isFarsi: true },
    { label: "نام کاربری", value: user.username, isFarsi: true, ltr: true },
    { label: "شماره شاسی", value: user.chassis_number, ltr: true },
    { label: "پلاک خودرو", value: user.license_plate_number, isFarsi: true },
    { 
      label: "وضعیت", 
      value: user.status_fa || (user.status === "active" ? "فعال" : "غیرفعال"), 
      isStatus: true, 
      statusValue: user.status === "active" || user.status === 10 || user.status === "10" ? 1 : 0 
    },
  ] : [];

  return (
    <>
      <Modal
        title={null}
        open={visible}
        onCancel={handleViewCancel}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        className="modern-modal no-padding-modal"
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={loading}>
          {user && (
            <div className="flex flex-col">
              {/* هدر گرادیانتی داخل مودال */}
              <div className="relative overflow-hidden bg-gradient-to-l from-brand-600 to-indigo-700 p-6 md:p-8 text-white rounded-t-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-white/30">
                      <UserOutlined />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" isfarsi="true">{user.username}</h2>
                      <p className="text-brand-100 text-sm mt-1">کاربر گارانتی</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {checkAccess(auth.roles, [1104]) && (
                      <Button 
                        icon={<EditOutlined />} 
                        onClick={handleEdit}
                        className="!rounded-xl !bg-white !text-brand-600 !border-white hover:!bg-gray-100"
                      >
                        ویرایش
                      </Button>
                    )}
                    {checkAccess(auth.roles, [1102]) && (
                      <Button 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(user.id, "/users/esalat/", "/esalat/users")}
                        className="!rounded-xl !bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
                      >
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* محتوا */}
              <div className="p-6 flex flex-col gap-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-b-lg">
                {/* استفاده از DetailCard */}
                <DetailCard 
                  title="اطلاعات کاربر" 
                  icon={<UserOutlined />} 
                  fields={userFields} 
                />
       
                {/* بخش سفارش‌ها */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileTextOutlined className="text-brand-500" />
                      سفارش‌ها
                    </h3>
                    <Button 
                      type="primary"
                      icon={<PlusOutlined />} 
                      onClick={() => setIsWarrantyModalVisible(true)}
                      className="!bg-brand-500 !border-brand-500 !rounded-lg"
                    >
                      افزودن کد گارانتی
                    </Button>
                  </div>
                  
                  {/* استفاده از DataTable */}
                  <DataTable 
                    columns={orderColumns} 
                    dataSource={orders} 
                    rowKey="id" 
                    pagination={false} 
                  />
                </div>
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* مودال ویرایش */}
      <Modal 
        open={isEditing} 
        title="ویرایش اطلاعات کاربر" 
        onCancel={() => setIsEditing(false)} 
        onOk={handleSave} 
        okText="ذخیره" 
        cancelText="انصراف"
        okButtonProps={{ className: "!bg-brand-500 !border-brand-500 !rounded-lg" }}
        cancelButtonProps={{ className: "!rounded-lg" }}
        className="modern-modal"
      >
        <Form form={editForm} layout="vertical" className="mt-4 flex flex-col gap-4">
          <FloatingInput label="نام کاربری" name="username" required rules={[{ required: true, message: "لطفاً نام کاربری را وارد کنید." }]} />
          <FloatingInput label="شماره شاسی" name="chassis_number" required rules={[{ required: true, message: "لطفاً شماره شاسی را وارد کنید." }]} />
          <FloatingInput label="پلاک خودرو" name="license_plate_number" required rules={[{ required: true, message: "لطفاً پلاک خودرو را وارد کنید." }]} />
          <FloatingSelect 
            label="وضعیت" 
            name="status" 
            required 
            options={[{ value: "active", label: "فعال" }, { value: "inactive", label: "غیرفعال" }]}
            rules={[{ required: true, message: "لطفاً وضعیت را انتخاب کنید." }]} 
          />
        </Form>
      </Modal>

      {/* مودال افزودن گارانتی */}
      <Modal
        open={isWarrantyModalVisible}
        title="افزودن کد گارانتی"
        onCancel={() => setIsWarrantyModalVisible(false)}
        onOk={handleAddWarranty}
        okText="افزودن"
        cancelText="انصراف"
        okButtonProps={{ className: "!bg-brand-500 !border-brand-500 !rounded-lg" }}
        cancelButtonProps={{ className: "!rounded-lg" }}
        className="modern-modal"
      >
        <Form form={warrantyForm} layout="vertical" className="mt-4">
          <FloatingInput label="کد گارانتی" name="warranty_code" required rules={[{ required: true, message: "لطفاً کد گارانتی را وارد کنید." }]} />
        </Form>
      </Modal>
    </>
  );
};