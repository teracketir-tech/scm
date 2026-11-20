import { Button, Divider,  Tooltip } from "antd";
import { DataTable } from "../../components/DataTable";
import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, getParams, getParamsObject, request, sendAlert } from "../../module/util";

export default function Sms() {
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "تعداد",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "تاریخ",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "وضعیت",
      dataIndex: "status_fa",
      key: "status_fa",
    },
    {
      title: "قیمت",
      dataIndex: "price_fa",
      key: "price_fa",
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
  const [count, setCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let params_obj = getParamsObject(searchParams.toString(), true);
    if (params_obj["status"] && params_obj["message"]) {
      sendAlert(params_obj["status"] == "error" ? false : true, params_obj["message"]);
      setSearchParams("");
    }
  }, [location]);
  const getData = (params) => {
    request(`/sms?${params}`).then((res) => {
      if (res["success"]) {
        let data = res["data"];
        setModel(data["list"]);
        setPages(data["pages"]);
        setCount(data["sms_count"]);
      }
    });
  };
  const handlePay = async (item) => {
    try {
      let res = await request(`/sms/pay?id=${item["id"]}`, "GET");
      if (res["success"] && res["data"]) {
        window.location.href = res["data"];
      }
    } catch (error) {}
  };
  useEffect(() => {
    let newData = [];
    model.map((item, k) => {
      item["key"] = ++k;
      item["date"] = <span dir="ltr">{item["date"]}</span>;
      item["action"] = (
        <div>
          {checkAccess(auth.roles, [702]) && item["status"] != 1 ? (
            <Link className="btn btn-sm btn-primary mx-1" to={`/sms/update?id=${item.id}`}>
              ویرایش
            </Link>
          ) : (
            ""
          )}
          {checkAccess(auth.roles, [703]) && item["status"] != 1 ? (
            <button className="btn btn-sm btn-success mx-1" onClick={() => handlePay(item)}>
              پرداخت
            </button>
          ) : (
            ""
          )}
        </div>
      );
      newData.push(item);
    });
    setData(newData);
  }, [model]);
  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    { name: "count", type: "text", label: "تعداد" },
  ];
  return (
    <>
      <Filters fields={filters} getData={getData} />
      <Divider />
      <div className="text-right">
        <h6 className="mx-3 bold">تعداد اس ام اس های باقی مانده: {count}</h6>
        {checkAccess(auth.roles, [701]) ? (
          <Link to={"/sms/create"}>
            <Button type="success" className="m-2">
              ساخت اس ام اس جدید
            </Button>
          </Link>
        ) : (
          ""
        )}
      </div>

      <div className="table-responsive">
        <DataTable columns={columns} dataSource={data} pagination={false} />
      </div>
      <Pagination all={pages} />
    </>
  );
}
