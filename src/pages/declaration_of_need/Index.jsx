import { Button, Divider,  Tooltip,Checkbox } from "antd";
import { DataTable } from "../../components/DataTable";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, confirm, getParams, numberFormat, request } from "../../module/util";

export default function DeclarationOfNeeds() {
  const statusList = [
    <Button type="text">بررسی نشده</Button>,
    <Button type="primary">تایید شده توسط رئیس تامین</Button>,
    <Button type="text" style={{ color: "red" }}>
      رد شده توسط رئیس تامین
    </Button>,
    <Button type="primary">تایید شده توسط مدیر تامین</Button>,
    <Button type="text" style={{ color: "red" }}>
      رد شده توسط مدیر تامین
    </Button>,
  ];

  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "نام تامین کننده",
      dataIndex: "supplier_id",
      key: "supplier_id",
    },
    {
      title: "شرکت تامین کننده",
      dataIndex: "supplier_company",
      key: "supplier_company",
    },
    // {
    //   title: "تاریخ",
    //   key: "date",
    //   dataIndex: "date",
    // },
    {
      title: "تاریخ تایید",
      key: "approve_date",
      dataIndex: "approve_date",
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
  const [exportExcel,setExportExcel]=useState([]);

  const getData = (params = "") => {
    request(`/declaration-of-need?expand=supplier&${params}`).then((res) => {
      if (res?.success) {
        setModel(res.data);
        setPages(res.pages);
        setExportExcel(res?.excel);
      }
    });
  };

  const getSuppliers = async (query = "") => {
    const res = await request(`/users/get-suppliers?query=${query}`, "GET");

    if (res?.success) setSuppliers(res.data.map((s) => ({ label: s.company_name, value: s.id.toString() })));

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
        supplier_id: (
          <span>
            {item?.supplier?.first_name} {item?.supplier?.last_name}
          </span>
        ),
        supplier_company: <span>{item?.supplier?.company_name || "---"}</span>,
        date: <span>{item.date}</span>,
        approve_date: <span>{item.status == 1 ? item?.head_approve_date : item.status == 3 ? item.manager_approve_date : "---"}</span>,
        status: <span>{statusList[item.status]}</span>,
        readed: item.readed == 1 ? <Button type="primary">خوانده شده</Button> : <Button type="text">خوانده نشده</Button>,
        action: (
          <div>
            <Tooltip placement="top" title={"مشاهده"} color="#00ce00">
              <Link className="" to={`/declaration-of-need/view?id=${item.id}`}>
                <button>
                  <i className="fa fa-eye text-success" aria-hidden="true"></i>
                </button>
              </Link>
            </Tooltip>
            {checkAccess(auth.roles, [1402]) ? (
              <Tooltip placement="top" title={"ویرایش"} color="#1890ff">
                <Link className="" to={`/declaration-of-need/update?id=${item.id}`}>
                  <button>
                    <i className="fa fa-pencil text-primary" aria-hidden="true"></i>
                  </button>
                </Link>
              </Tooltip>
            ) : (
              ""
            )}
            {checkAccess(auth.roles, [1403]) ? (
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
    // { name: "date", type: "date", label: "تاریخ" },
    { name: "approve_date", type: "date", label: "تاریخ تایید" },
    { name: "date_from", type: "date", label: "از تاریخ" },
    { name: "date_to", type: "date", label: "تا تاریخ" },
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

    {
      name: "excel",
      type: "select",
      label: "خروجی اکسل میخواهید؟",
      options: [
        { label: "خیر", value: "0" },
        { label: "بله", value: "1" }, 
      ],
    },

  ];

  const handleDelete = (id) => {
    confirm().then(async () => {
      const res = await request(`/declaration-of-need/delete?id=${id}`, "DELETE");

      if (res?.success) {
        getData();
      }
    });
  };

  return (
    <>
      <Filters fields={filters} getData={getData} />
      <div className="d-flex align-items-center gap-2 mr-3">
 
</div>
      <Divider />
      {checkAccess(auth.roles, [1401]) ? (
        <Link to={"/declaration-of-need/create"}>
          <Button type="success" className="m-2 d-flex justify-content-start">
            ثبت اعلام نیاز جدید
          </Button>
        </Link>
      ) : (
        ""
      )}
      {(exportExcel?.success==true) ? (
         <Link to={exportExcel?.file}>
          <Button type="primary" className="m-2 d-flex justify-content-start">
           دانلود فایل اکسل
          </Button>
        </Link>
      ):("") }

      <div className="table-responsive">
        <DataTable columns={columns} dataSource={data} pagination={false} />
      </div>
      <Pagination all={pages} />
    </>
  );
}
