import { Divider, Table, Tooltip, Tag } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, request } from "../../module/util";

export const GarentyList = () => {
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "نام محصول",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "کد ضمانت",
      dataIndex: "warranty_code",
      key: "warranty_code",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "تاریخ شروع ضمانت",
      dataIndex: "activation_start_date",
      key: "activation_start_date",
      render: (date) => new Date(date).toLocaleDateString('fa-IR-u-nu-latn')
    },
    {
      title: "تاریخ پایان ضمانت",
      dataIndex: "activation_end_date",
      key: "activation_end_date",
      render: (date) => new Date(date).toLocaleDateString('fa-IR-u-nu-latn')
    },
    {
      title: "مبلغ",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price} تومان`,
    },
    {
      title: "موبایل مصرف‌کننده",
      dataIndex: "consumer_mobile",
      key: "consumer_mobile",
    }
  ];

  const { logout, handleDelete, auth } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);

  const getData = (params) => {
    request(`/users/garenty?${params}`).then((res) => {
      if (res.data) {
        setModel(res.data);
        setStatusOptions(res.status || []);
        setPages(res.count || 1);
      } else if (res.error) {
        logout(res.error);
      }
    });
  };

  useEffect(() => {
    const formattedData = model.map((item) => ({
      key: item.id,
      id: item.id,
      name: item.name,
      warranty_code: item.warranty_code,
      activation_start_date: item.activation_start_date,
      activation_end_date: item.activation_end_date,
      price: Number(item.price).toLocaleString(),
      consumer_mobile: item.consumer_mobile,
      user_id: item.user_id,
    }));
    setData(formattedData);
  }, [model]);

  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    { name: "name", type: "text", label: "نام محصول" },
    {
      name: "status",
      type: "select",
      options: statusOptions.map((option) => ({
        label: option.label,
        value: option.value,
      })),
      label: "وضعیت",
      mode: "multiple",
    },
  ];

  return (
    <>
      <Filters fields={filters} getData={getData} />
      <Divider />

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className="ant-border-space"
        />
      </div>
      <Pagination all={pages} getData={getData} />
    </>
  );
};
