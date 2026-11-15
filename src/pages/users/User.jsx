import { Button, Divider, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { EditOutlined, EyeOutlined, HistoryOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { DataTable } from "../../components/DataTable";  
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, request } from "../../module/util";

export const User = () => {
  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id", width: 80 },
    { title: "نام", dataIndex: "first_name", key: "first_name" },
    { title: "نام خانوادگی", dataIndex: "last_name", key: "last_name" },
    { title: "شماره تماس", key: "username", dataIndex: "username" },
    { title: "نوع", key: "type", dataIndex: "type" },
    { title: "گروه", key: "group_name", dataIndex: "group_name" },
    { title: "ایمیل", key: "email", dataIndex: "email", width: 150 },
    { title: "شرکت", key: "company_name", dataIndex: "company_name" },
    { title: "وضعیت", key: "status", dataIndex: "status" },
    { title: "عملیات", key: "action", dataIndex: "action", width: 180 },
  ];

  const { logout, handleDelete, auth } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState([]);
  const [groups, setGroups] = useState([]);
  const [type, setType] = useState([]);
  const [status, setStatus] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);

  const getData = (params) => {
    request(`/users?${params}`).then((res) => {
      setGroups(res["groups"]);
      setStatus(res["status"]);
      setType(res["type"]);
      if (res["data"]) {
        setModel(res["data"]);
      } else if (res["error"]) logout(res["error"]);
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
        first_name: <span>{item.first_name}</span>,
        last_name: <span>{item.last_name}</span>,
        username: <span isfarsi="true" className="ltr inline-block">{item.username}</span>,
        type: <span>{item.type_fa}</span>,
        group_name: <span>{item.group_name}</span>,
        email: <span className="ltr">{item.email}</span>,
        company_name: <span>{item.company_name}</span>,
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
            {checkAccess(auth.roles, [402]) && (
              <Tooltip placement="top" title="ویرایش">
                <Link className="action-btn edit" to={`/users/update?id=${item.id}`}>
                  <EditOutlined />
                </Link>
              </Tooltip>
            )}
            {checkAccess(auth.roles, [404]) && (
              <Tooltip placement="top" title="جزئیات">
                <Link className="action-btn view" to={`/users/view?id=${item.id}`}>
                  <EyeOutlined />
                </Link>
              </Tooltip>
            )}
            {checkAccess(auth.roles, [404]) && (
              <Tooltip placement="top" title="مشاهده لاگ‌های ورود">
                <Link className="action-btn logs" to={`/users/logs?user_id=${item.id}`}>
                  <HistoryOutlined />
                </Link>
              </Tooltip>
            )}
            {checkAccess(auth.roles, [403]) && (
              <Tooltip placement="top" title="حذف">
                <button className="action-btn delete" onClick={() => handleDelete(item.id, "users", "/users")}>
                  <DeleteOutlined />
                </button>
              </Tooltip>
            )}
          </div>
        ),
      });
    });
    setData(newData);
  }, [model]);

  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    { name: "first_name", type: "text", label: "نام" },
    { name: "last_name", type: "text", label: "نام خانوادگی" },
    { name: "phone", type: "text", label: "شماره تماس" },
    { name: "company_name", type: "text", label: "شرکت" },
    { name: "status", type: "select", options: status, label: "وضعیت", mode: "multiple" },
    { name: "groups", type: "select", options: groups, label: "گروه", mode: "multiple" },
    { name: "type", type: "select", options: type, label: "نوع", mode: "multiple" },
  ];

  return (
    <>
      <Filters fields={filters} getData={getData} />
      <Divider className="!my-4" />
      
      <div className="flex flex-wrap gap-2 mb-4">
        {checkAccess(auth.roles, [401]) && (
          <Link to={"/users/create"}>
            <Button type="primary" className="!bg-brand-500 !border-brand-500 hover:!bg-brand-600">
              ساخت کاربر جدید
            </Button>
          </Link>
        )}
        {checkAccess(auth.roles, [404]) && (
          <Link to={"/users/active-logins"}>
            <Button className="!bg-gray-100 !text-gray-700 !border-transparent hover:!bg-gray-200 dark:!bg-gray-800 dark:!text-gray-200">
              لیست کاربران فعال
            </Button>
          </Link>
        )}
      </div>

      <DataTable columns={columns} dataSource={data} rowKey="id" />
      <Pagination all={pages} getData={getData} />
    </>
  );
};