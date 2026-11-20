import { Button, Divider, Tooltip } from "antd";
import { DataTable } from "../../components/DataTable";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, confirm, getParams, numberFormat, request } from "../../module/util";

export default function Cheques() {
  const statusList = [
    <Button type="text">بررسی نشده</Button>,
    <Button type="primary">تایید شده</Button>,
    <Button type="text" style={{ color: "red" }}>
      رد شده
    </Button>,
  ];
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "کد تامین کننده",
      dataIndex: "supplier_id",
      key: "supplier_id",
    },
    {
      title: "نام تامین کننده",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "شرکت تامین کننده",
      dataIndex: "supplier_company",
      key: "supplier_company",
    },
    {
      title: "مبلغ کل",
      key: "total_price",
      dataIndex: "total_price",
    },
    {
      title: "تاریخ",
      key: "date",
      dataIndex: "date",
    },
    {
      title: "وضعیت",
      key: "status",
      dataIndex: "status",
    },
    {
      title: "مشاهده شده",
      key: "readed",
      dataIndex: "readed",
    },
    {
      title: "عملیات",
      key: "action",
      dataIndex: "action",
    },
  ];

  const { auth } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [suppliers, setSuppliers] = useState([]);

  const getData = (params = "") => {
    request(`/cheque?expand=supplier&${params}`).then((res) => {
      if (res?.success) {
        setModel(res.data);
        setPages(res.pages);
      }
    });
  };

  const getSuppliers = async (query = "") => {
    const res = await request(`/users/get-suppliers?query=${query}`, "GET");

    if (res?.success) setSuppliers(res.data.map((s) => ({ label: `${s.supplier_code} - ${s.first_name} ${s.last_name}`, value: s.id })));
  };

  useEffect(() => {
    getData();
    getSuppliers();
  }, []);

  useEffect(() => {
    let newData = [];

    model.map((item, k) => {
      newData.push({
        key: ++k,
        id: <span>{item.id}</span>,
        supplier_id: <span>{item?.supplier?.supplier_code || "---"}</span>,
        supplier: (
          <span>
            {item?.supplier?.first_name} {item?.supplier?.last_name}
          </span>
        ),
        supplier_company: <span>{item?.supplier?.company_name || "---"}</span>,
        total_price: <span>{numberFormat(item.total_price)}</span>,
        date: <span>{item.date}</span>,
        status: <div>{statusList[item.status]}</div>,
        readed: item.readed == 1 ? <Button type="primary">خوانده شده</Button> : <Button type="text">خوانده نشده</Button>,
        action: (
          <div>
            <Tooltip placement="top" title={"مشاهده"} color="#00ce00">
              <Link className="" to={`/cheques/view?id=${item.id}`}>
                <button>
                  <i className="fa fa-eye text-success" aria-hidden="true"></i>
                </button>
              </Link>
            </Tooltip>
            {checkAccess(auth.roles, [1202]) ? (
              <Tooltip placement="top" title={"ویرایش"} color="#1890ff">
                <Link className="" to={`/cheques/update?id=${item.id}`}>
                  <button>
                    <i className="fa fa-pencil text-primary" aria-hidden="true"></i>
                  </button>
                </Link>
              </Tooltip>
            ) : (
              ""
            )}
            {checkAccess(auth.roles, [1203]) ? (
              <Tooltip placement="top" title={"حذف"} color="#F1212C">
                <button onClick={() => handleDelete(item.id)}>
                  <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                </button>
              </Tooltip>
            ) : (
              ""
            )}
          </div>
        ),
      });
    });

    setData(newData);
  }, [model]);

  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    {
      name: "supplier_id",
      type: "select",
      label: "نام تامین کننده",
      options: suppliers,
      onSearch: (e) => getSuppliers(e),
    },
    { name: "total_price", type: "text", label: "مبلغ کل" },
    { name: "date", type: "date", label: "تاریخ" },
    {
      name: "status",
      type: "select",
      label: "وضعیت",
      options: [
        { label: "بررسی نشده", value: "0" },
        { label: "تایید شده", value: "1" },
        { label: "رد شده", value: "2" },
      ],
    },
  ];

  const handleDelete = (id) => {
    confirm().then(async () => {
      const res = await request(`/cheque/delete?id=${id}`, "DELETE");

      if (res?.success) {
        getData();
      }
    });
  };

  return (
    <>
      <Filters fields={filters} getData={getData} />
      <Divider />
      {checkAccess(auth.roles, [1201]) ? (
        <Link to={"/cheques/create"}>
          <Button type="success" className="m-2 d-flex justify-content-start">
            ثبت چک جدید
          </Button>
        </Link>
      ) : (
        ""
      )}

      <div className="table-responsive">
        <DataTable columns={columns} dataSource={data} pagination={false} />
      </div>
      <Pagination all={pages} />
    </>
  );
}
