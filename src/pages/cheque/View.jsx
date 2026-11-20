import { Button, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { checkAccess, confirm, getParams, numberFormat, request } from "../../module/util";
import { DetailCard } from "../../components/DetailCard";


export default function ViewCheque() {
  const { auth } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState({});
  const [banks, setBanks] = useState([]);

  const statusList = ["بررسی نشده", "تایید شده", "رد شده"];

  useEffect(() => {
    getData();
    getBanks();
  }, [location]);

  const getData = async () => {
    const id = await getParams(location.search, "id");

    if (id) {
      const res = await request(`/cheque/view?expand=supplier&id=${id}`, "GET");

      if (res?.success) {
        setModel({ ...res.data, cheques_list: JSON.parse(res.data.cheques_list) });
      }
    }
  };

  const getBanks = async (name = "") => {
    const res = await request(`/bank?name=${name}`, "GET");

    if (res?.success) setBanks(res.data.map((b) => ({ label: b.name, value: b.id })));
  };

  const handleChangeStatus = (status) => {
    confirm().then(async () => {
      const id = await getParams(location.search, "id");

      let res = await request(`/cheque/change-status?expand=supplier&id=${id}&status=${status}`);

      if (res?.success) getData();
    });
  };

  return (
    <div className="pa-3 px-4" style={{ minHeight: "80vh" }}>
      <DetailCard title="اطلاعات چک" fields={[
        { label: "نام تامین کننده", value: `${model?.supplier?.first_name || ""} ${model?.supplier?.last_name || ""}` },
        { label: "کد تامین کننده", value: model?.supplier?.supplier_code },
        { label: "تاریخ", value: model.date },
        { label: "مبلغ کل", value: numberFormat(model.total_price) },
        { label: "وضعیت", value: statusList[model.status] },
      ]} />

      <Row className="d-flex justify-content-start gap-2 w-100 mb-4" style={{ borderBottom: "1px solid lightGray" }}>
          <p className="font-bold">نام تامین کننده</p>
          <p>:</p>
          <p>
            {model?.supplier?.first_name} {model?.supplier?.last_name}
          </p>
        </Row>

        <Row className="d-flex justify-content-start gap-2 w-100 mb-4" style={{ borderBottom: "1px solid lightGray" }}>
          <p className="font-bold">کد تامین کننده</p>
          <p>:</p>
          <p>{model?.supplier?.supplier_code}</p>
        </Row>

        <Row className="d-flex justify-content-start gap-2 w-100 mb-4" style={{ borderBottom: "1px solid lightGray" }}>
          <p className="font-bold">تاریخ</p>
          <p>:</p>
          <p>{model.date}</p>
        </Row>

        <Row className="d-flex justify-content-start gap-2 w-100 mb-4" style={{ borderBottom: "1px solid lightGray" }}>
          <p className="font-bold">مبلغ کل</p>
          <p>:</p>
          <p>{numberFormat(model.total_price)}</p>
        </Row>

        <Row className="d-flex justify-content-start gap-2 w-100 mb-4" style={{ borderBottom: "1px solid lightGray" }}>
          <p className="font-bold">وضعیت</p>
          <p>:</p>
          <p>{statusList[model.status]}</p>
        </Row>
      </Row>

      <Row className="d-flex justify-content-start gap-2 w-100 mb-4" style={{ borderBottom: "1px solid lightGray", marginTop: "2.5rem" }}>
        <p className="font-bold">لیست چکها</p>
      </Row>

      <div className="mt-5">
        {model?.cheques_list?.map((cheque, index) => (
          <Row
            key={index}
            className="d-flex align-items-center justify-content-start justify-content-md-around gap-2 w-100 my-4 p-3 rounded text-right"
            style={{ backgroundColor: "#f5f5f5" }}
          >
            <Row className="d-flex justify-content-start gap-3" style={{ minWidth: "10rem" }}>
              <p className="font-bold m-0">بانک</p>
              <p className="m-0">:</p>
              <p className="m-0">{banks?.find(({ value }) => value === cheque.bank_id)?.label}</p>
            </Row>

            <Row className="d-flex justify-content-start gap-3" style={{ minWidth: "10rem" }}>
              <p className="font-bold m-0">شماره چک</p>
              <p className="m-0">:</p>
              <p className="m-0">{cheque.number}</p>
            </Row>

            <Row className="d-flex justify-content-start gap-3" style={{ minWidth: "10rem" }}>
              <p className="font-bold m-0">مبلغ</p>
              <p className="m-0">:</p>
              <p className="m-0">{numberFormat(cheque.price)}</p>
            </Row>
          </Row>
        ))}
      </div>
      {model.status == 0 && checkAccess(auth.roles, [1204]) && (
        <div className="text-center w-100 d-flex align-items-center justify-content-center pb-5" style={{ marginTop: "3rem" }}>
          <Button type="primary" htmlType="submit" size="large" className="mx-3" style={{ width: "7rem" }} onClick={() => handleChangeStatus(1)}>
            تایید
          </Button>
          <Button type="default" htmlType="submit" size="large" className="mx-3" style={{ width: "7rem" }} onClick={() => handleChangeStatus(2)}>
            رد
          </Button>
        </div>
      )}
    </div>
  );
}
