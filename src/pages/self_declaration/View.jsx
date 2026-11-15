import { Button } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import {
  checkAccess,
  getParams,
  numberFormat,
  request,
} from "../../module/util";

export const SelfDeclarationView = () => {
  const location = useLocation();
  const { setTitle, logout, handleDelete, auth } = useAuthContext();
  const [model, setModel] = useState({});
  const getData = async () => {
    const id = await getParams(location.search, "id");
    if (id) {
      let response = await request(`/self-declarations/${id}`, "GET");
      console.log(response)
      if (response["data"]) {
        let _data = response["data"];
        setTitle(` : ${_data["id"]}`);
        setModel(response["data"]);
      } else if (response["error"]) logout(response["error"]);
    }
  };
  useEffect(() => {
    getData();
  }, [location]);

  return (
    <div className="mt-3 mb-5">
      {model ? (
        <>
          <div className=" table-responsive">
            <table className="w-100 table table-striped">
              <tbody>
                <tr>
                  <th>شناسه</th>
                  <th>{model.id}</th>
                </tr>
                <tr>
                  <th>نوع خودرو</th>
                  <th>{model.car_type}</th>
                </tr>
                <tr>
                  <th>شرح قطعه</th>
                  <th>{model.product_desc}</th>
                </tr>
                <tr>
                  <th>{"سریال قطعه"}</th>
                  <th>{model.product_serial}</th>
                </tr>
                <tr>
                  <th>{"وارداتی یا تولیدی"}</th>
                  <th>{model.type}</th>
                </tr>
                <tr>
                  <th>{"برند"}</th>
                  <th>{model.brand}</th>
                </tr>
                <tr>
                  <th>{"گرید"}</th>
                  <th>{model.grade}</th>
                </tr>
                <tr>
                  <th>{"ظرفیت تامین در ماه"}</th>
                  <th>{model.capacity}</th>
                </tr>
                <tr>
                  <th>{"زمان تحویل"}</th>
                  <th>{model.delivery_time}</th>
                </tr>
                <tr>
                  <th>{"شماره فنی تامین کننده"}</th>
                  <th>{model.technical_number}</th>
                </tr>
                <tr>
                  <th>{"کشور"}</th>
                  <th>{model.country}</th>
                </tr>
                <tr>
                  <th>{"وضعیت"}</th>
                  <th>{model.status}</th>
                </tr>
                <tr>
                  <th>{"تعداد قطعه"}</th>
                  <th>{model.product_count}</th>
                </tr>
                {checkAccess(auth.roles, [508]) ? (
                  <>
                    <tr>
                      <th>{"روش پرداخت"}</th>
                      <th>{model.payment_method}</th>
                    </tr>
                    <tr>
                      <th>{"قیمت واحد"}</th>
                      <th>{numberFormat(model.final_price)}</th>
                    </tr>
                  </>
                ) : (
                  ""
                )}
                <tr>
                  <th>{"محل تحویل"}</th>
                  <th>{model.place_delivery_id}</th>
                </tr>
                <tr>
                  <th>{"شرایط پرداخت"}</th>
                  <th>{model.payment_terms}</th>
                </tr>
                <tr>
                  <th>{"وضعیت گارانتی"}</th>
                  <th>{model.warranty_status}</th>
                </tr>
                <tr>
                  <th>{"زمان گارانتی"}</th>
                  <th>{model.warranty_time}</th>
                </tr>
                <tr>
                  <th>{"مدت اعتبار قیمت"}</th>
                  <th>{model.price_validity_time}</th>
                </tr>
                <tr>
                  <th>{"تعداد تامین در ماه"}</th>
                  <th>{model.number_per_month}</th>
                </tr>
                <tr>
                  <th>{"نحوه بسته بندی"}</th>
                  <th>{model.packaging_method}</th>
                </tr>
                <tr>
                  <th>{"توضیحات تامین کننده"}</th>
                  <th>{model.description_supplier}</th>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};
