import { Divider, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, request } from "../../module/util";
import { CheckOutlined } from "@ant-design/icons";

export default function Documents() {
  const columns = [
    {
      title: "شماره پرونده",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <span className="d-flex">
          {record.documentsStatus ? (
            <CheckOutlined className="text-success mx-2" />
          ) : (
            ""
          )}
          {id}
        </span>
      ),
    },
    {
      title: "نام شرکت",
      dataIndex: "user_name",
      key: "user_name",
    },
    {
      title: "تاریخ",
      dataIndex: "date_fa",
      key: "date_fa",
    },
    {
      title: "وضعیت",
      dataIndex: "status_fa",
      key: "status_fa",
    },
    {
      title: "عملیات",
      key: "action",
      dataIndex: "action",
    },
  ];

  const { handleDelete, auth } = useAuthContext();
  const [model, setModel] = useState([]);
  const [status, setStatus] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);

  const handleRestore = (id) => {
    request(`/self-declarations/restore-documents/${id}`, "PUT")
      .then((res) => {
        getData();
      })
      .catch((err) => {});
  };

  const getData = (params) => {
    if (!params) params = "status=1";
    request(`/self-declarations/documents?${params}`).then((res) => {
      if (res["success"]) {
        let data = res["data"];
        setModel(data["list"]);
        setPages(data["pages"]);
        setStatus(data["status"]);
      }
    });
  };

  useEffect(() => {
    let newData = [];
    model.map((item, k) => {
      item["key"] = ++k;
      item["date_fa"] = <span dir="ltr">{item["date_fa"]}</span>;
      item["action"] = (
        <>
          {checkAccess(auth.roles, [500, 506]) ? (
            <Tooltip placement="top" title={"جزئیات"} color="#52c41a">
              <Link
                to={`/self-declarations?document_id=${item.id}`}
                className="btn"
              >
                <i className="fa fa-eye text-success" aria-hidden="true"></i>
              </Link>
            </Tooltip>
          ) : (
            ""
          )}
          {checkAccess(auth.roles, [802]) ? (
            <Tooltip placement="top" title={"حذف"} color="red">
              <button
                className="btn btn-sm"
                onClick={() =>
                  handleDelete(
                    item.id,
                    "self-declarations/delete-documents",
                    "/documents"
                  )
                }
              >
                <i className="fa fa-trash text-danger" aria-hidden="true"></i>
              </button>
            </Tooltip>
          ) : (
            ""
          )}
          {checkAccess(auth.roles, [802]) && item.status === -1 ? (
            <Tooltip placement="top" title={"بازگردانی"} color="blue">
              <button
                className="btn btn-sm"
                onClick={() => handleRestore(item.id)}
              >
                <i className="fa fa-undo text-primary" aria-hidden="true"></i>
              </button>
            </Tooltip>
          ) : (
            ""
          )}
        </>
      );
      newData.push(item);
    });
    setData(newData);
  }, [model]);

  const filters = [
    { name: "id", type: "text", label: "شماره پرونده" },
    { name: "user_name", type: "text", label: "نام شرکت" },
    {
      name: "status",
      type: "select",
      label: "وضعیت",
      options: status,
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
      <Pagination all={pages} />
    </>
  );
}
