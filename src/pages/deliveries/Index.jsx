import { Button, Divider, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, getParams, request } from "../../module/util";

export default function Deliveries() {
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "نام",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "عملیات",
      key: "action",
      dataIndex: "action",
    },
  ];
  const { logout, handleDelete, auth } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const getData = (params) => {
    request(`/deliveries?${params}`).then((res) => {
      if (res["success"]) {
        let data = res["data"];
        setModel(data["list"]);
        setPages(data["pages"]);
      }
    });
  };
  useEffect(() => {
    let newData = [];
    model.map((item, k) => {
      newData.push({
        key: ++k,
        id: <span>{item.id}</span>,
        name: <span>{item.name}</span>,
        action: (
          <div>
            {checkAccess(auth.roles, [202]) ? (
              <Tooltip placement="top" title={"ویرایش"} color="#1890ff">
                <Link className="" to={`/deliveries/update?id=${item.id}`}>
                  <button>
                    <i className="fa fa-pencil text-primary" aria-hidden="true"></i>
                  </button>
                </Link>
              </Tooltip>
            ) : (
              ""
            )}
            {checkAccess(auth.roles, [203]) ? (
              <Tooltip placement="top" title={"حذف"} color="#F1212C">
                <button onClick={() => handleDelete(item.id, "deliveries", "/deliveries")}>
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
    { name: "name", type: "text", label: "نام" },
  ];
  return (
    <>
      <Filters fields={filters} getData={getData} />
      <Divider />
      {checkAccess(auth.roles, [201]) ? (
        <Link to={"/deliveries/create"}>
          <Button type="success" className="m-2 d-flex justify-content-start">
            ساخت محل جدید
          </Button>
        </Link>
      ) : (
        ""
      )}

      <div className="table-responsive">
        <Table columns={columns} dataSource={data} pagination={false} className="ant-border-space" />
      </div>
      <Pagination all={pages} />
    </>
  );
}
