import { Button, Divider, Modal, Form } from "antd";
import { EyeOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { DataTable } from "../../components/DataTable";
import { FloatingInput } from "../../components/FloatingInput";
import { FloatingSelect } from "../../components/FloatingSelect";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, request } from "../../module/util";

export const EsalatUsers = () => {
  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id", width: 80 },
    { title: "نام", dataIndex: "username", key: "username" },
    { title: "وضعیت", key: "status", dataIndex: "status", width: 150 },
    { title: "عملیات", key: "action", dataIndex: "action", width: 120, align: "center" },
  ];

  const { logout, handleDelete, auth } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState([]);
  const [groups, setGroups] = useState([]);
  const [type, setType] = useState([]);
  const [status, setStatus] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const getData = (params) => {
    request(`/users/esalat?${params}`).then((res) => {
      setGroups(res["groups"]);
      setStatus(res["status"]);
      setType(res["type"]);
      if (res["data"]) setModel(res["data"]);
      else if (res["error"]) logout(res["error"]);
      if (res["count"]) setPages(res["count"]);
      else setPages(1);
    });
  };

  useEffect(() => {
    let newData = [];
    model.map((item) => {
      newData.push({
        key: item.id,
        id: <span isfarsi="true">{item.id}</span>,
        username: <span>{item.username}</span>,
        status: (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status > 0
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {item.status_fa}
          </span>
        ),
        action: (
          <div className="action-buttons">
            {checkAccess(auth.roles, [1101]) && (
              <Link className="action-btn view" to={`/esalat/users/view?id=${item.id}`}>
                <EyeOutlined />
              </Link>
            )}
            {checkAccess(auth.roles, [1102]) && (
              <button 
                className="action-btn delete" 
                onClick={() => handleDelete(item.id, "/users/esalat/", "/esalat/users")}
              >
                <DeleteOutlined />
              </button>
            )}
          </div>
        ),
      });
    });
    setData(newData);
  }, [model]);

  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    { name: "username", type: "text", label: "نام" },
    { name: "status", type: "select", options: status, label: "وضعیت", mode: "multiple" },
  ];

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        const res = await request("/users/esalat/create", "POST", values);
        if (res && !res.error) {
          setIsModalVisible(false);
          form.resetFields();
          getData(""); // رفرش جدول
        }
      })
      .catch((error) => console.log("Failed:", error));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
          className="!bg-brand-500 !border-brand-500 !rounded-lg"
        >
          افزودن کاربر
        </Button>
      </div>

      <Filters fields={filters} getData={getData} />
      <Divider className="!my-4" />

      <DataTable columns={columns} dataSource={data} rowKey="id" />
      <Pagination all={pages} getData={getData} />

      {/* مودال افزودن کاربر */}
      <Modal 
        title="افزودن کاربر" 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel} 
        okText="ثبت" 
        cancelText="لغو"
        className="modern-modal"
        okButtonProps={{ className: "!bg-brand-500 !border-brand-500 !rounded-lg" }}
        cancelButtonProps={{ className: "!rounded-lg" }}
      >
        <Form form={form} layout="vertical" name="add_user_form" className="mt-4 flex flex-col gap-4">
          <FloatingInput 
            label="نام کاربری" 
            name="username" 
            required 
            rules={[{ required: true, message: "لطفاً نام کاربری را وارد کنید!" }]} 
          />
          
          <FloatingSelect 
            label="وضعیت" 
            name="status" 
            required 
            options={[
              { value: 10, label: "فعال" },
              { value: 9, label: "غیرفعال" },
            ]}
            rules={[{ required: true, message: "لطفاً وضعیت را انتخاب کنید!" }]} 
          />
          
          <FloatingInput 
            label="شماره پلاک" 
            name="license_plate_number" 
            required 
            rules={[{ required: true, message: "لطفاً شماره پلاک را وارد کنید!" }]} 
          />
          
          <FloatingInput 
            label="شماره شاسی" 
            name="chassis_number" 
            required 
            rules={[{ required: true, message: "لطفاً شماره شاسی را وارد کنید!" }]} 
          />
        </Form>
      </Modal>
    </>
  );
};