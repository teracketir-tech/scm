import { Button, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/img/logo.png";
import { checkAccess, confirm, numberFormat, request } from "../../module/util";
import { NumberFormat } from "../../components/NumberFormat";
import { useAuthContext } from "../../components/AuthProvider";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function ViewDeclarationOfNeed() {
  const { auth } = useAuthContext();
  const [title, setTitle] = useState("");
  const [model, setModel] = useState({});
  const [customer, setCustomer] = useState({});
  const [setting, setSetting] = useState({});
  const [footer, setFooter] = useState({});
  const [units, setUnits] = useState([]);
  const [account, setAccount] = useState({});
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const location = useLocation();
  const [deductions, setDeductions] = useState(0);

  const statusList = ["بررسی نشده", "تایید شده توسط رئیس تامین", "رد شده توسط رئیس تامین", "تایید شده توسط مدیر تامین", "رد شده توسط مدیر تامین"];

  const seasion = [
    {
      name: "بهار",
      ids: [1, 2, 3],
    },
    {
      name: "تابستان",
      ids: [4, 5, 6],
    },
    {
      name: "پاییز",
      ids: [7, 8, 9],
    },
    {
      name: "زمستان",
      ids: [10, 11, 12],
    },
  ];
  const months = [
    { label: "فروردین", value: 1 },
    { label: "اردیبهشت", value: 2 },
    { label: "خرداد", value: 3 },
    { label: "تیر", value: 4 },
    { label: "مرداد", value: 5 },
    { label: "شهریور", value: 6 },
    { label: "مهر", value: 7 },
    { label: "آبان", value: 8 },
    { label: "آذر", value: 9 },
    { label: "دی", value: 10 },
    { label: "بهمن", value: 11 },
    { label: "اسفند", value: 12 },
  ];

  const getData = async () => {
  if (id) {
    let res = await request(`/declaration-of-need/view?expand=user, supplier, head, manager&id=${id}`, "GET");

    if (res?.success) {
      let items = res.data.items;
      
      // ✅ هندل کردن هر دو حالت
      try {
        // اگه رشته بود، parse کن
        if (typeof items === "string") {
          items = JSON.parse(items);
        }
        
        // اگه بعد از parse هم رشته بود (double-encoded)، دوباره parse کن
        if (typeof items === "string") {
          items = JSON.parse(items);
        }
      } catch (e) {
        console.error("Error parsing items:", e);
        items = [];
      }
      
      // ✅ اطمینان از آرایه بودن
      if (!Array.isArray(items)) {
        items = [];
      }
      
      setModel({ ...res.data, items });
    } else {
      navigate(`/declaration-of-need`);
    }
  }
};

  const getUnits = async (name = "") => {
    const res = await request(`/unit?name=${name}`, "GET");

    if (res?.success) setUnits(res.data);
  };

  useEffect(() => {
    getData();
    getUnits();
  }, [location]);

  const handleChangeStatus = (status) => {
    confirm().then(async () => {
      let finalStatus = 0;

      if (status == 1) {
        finalStatus = model.status == 0 ? 1 : 3;

        //
      } else {
        finalStatus = model.status == 0 ? 2 : 4;
      }

      const res = await request(`/declaration-of-need/change-status?expand=supplier&id=${model.id}&status=${finalStatus}`);

      if (res?.success) getData();
    });
  };

  return (
    <div className="mt-5 px-4 pb-5 rtl text-right " style={{ marginBottom: "15rem" }}>
      <div className="d-flex justify-content-between">
        <div className="hide_print mb-5 mt-3">
          <Button type="primary" onClick={() => window.print()} style={{ width: "5rem" }}>
            پرینت
          </Button>
          <Link to={"/declaration-of-need"}>
            <Button className="btn-warning mr-3" style={{ width: "5rem" }}>
              بازگشت
            </Button>
          </Link>
        </div>
        {((model.status == 0 && checkAccess(auth.roles, [1404])) || (model.status == 1 && checkAccess(auth.roles, [1405]))) && (
          <div className="hide_print mb-5 mt-3">
            <Button type="primary" onClick={() => handleChangeStatus(1)} style={{ width: "5rem" }}>
              تایید
            </Button>
            <Button onClick={() => handleChangeStatus(0)} className="btn-warning mr-3" style={{ width: "5rem" }}>
              رد
            </Button>
          </div>
        )}
        <p className="font-bold d-flex gap-2 pl-1">
          <span>وضعیت</span>
          <span>:</span>
          <span>{statusList[model.status]}</span>
        </p>
      </div>
      {model ? (
        <div>
          <div className="w-100 border-2 mt-3">
            <div className="d-flex align-items-center border-bottom-2 relative">
              {model.readed > 0 && (
                <Tooltip title="مشاهده شده توسط تامین کننده">
                  <p className="m-0 text-success absolute right-5">
                    <i className="fa fa-check" style={{ fontSize: "2.8rem" }} />
                  </p>
                </Tooltip>
              )}
              <div className="text-center" style={{ width: "80%" }}>
                <h4 className="font-bold text-center m-0 p-1 font-11">فرم اعلام نیاز قطعات</h4>
              </div>

              <div className="pr-5 py-4" style={{ width: "20%", borderRight: "2px solid gray" }}>
                <p className="m-0 d-flex justify-content-start gap-2 font-bold ">
                  <span>کد مدرک</span>
                  <span>:</span>
                  <span>{model.id}</span>
                </p>
                <p className="m-0 d-flex justify-content-start gap-2 font-bold ">
                  <span>تاریخ بازنگری</span>
                  <span>:</span>
                  <span>{model.manager_approve_date}</span>
                </p>
              </div>
            </div>

            <div className="border-bottom-2 px-2 py-4">
              <h6 className="font-bold text-center m-0 p-1 font-11">
                توجه : موارد ذیل فقط جهت استعلام قیمت میباشد و در صورت تایید پیش فاکتور، سفارش نهایی میشود.
              </h6>
            </div>

            <div className="border-bottom-2 d-flex align-items-center justify-content-start py-2">
              <h6 className="font-bold d-flex justify-content-start m-0 p-1 font-11 d-flex gap-2" style={{ width: "50%" }}>
                <span>مدیریت محترم شرکت</span>
                <span>:</span>
                <span>{model?.supplier?.company_name}</span>
              </h6>

              <h6 className="font-bold d-flex justify-content-start m-0 p-1 font-11 d-flex gap-2" style={{ width: "50%" }}>
                <span>کد تامین کننده</span>
                <span>:</span>
                <span>{model?.supplier?.supplier_code || "---"}</span>
              </h6>
            </div>

            <div className="border-bottom-2 d-flex px-2 py-2">
              <div className="flex-1 pr-2">
                <span className="d-block font-11">با سلام و احترام</span>
                <span className="d-block font-11">
                  بدینوسیله لیست قطعات مورد نیاز
                  <span className="font-bold underline px-1">فصل {seasion.find((s) => s.ids.includes(model?.items?.[0].first_month_id))?.name}</span> به شرح ذیل
                  اعلام میگردد، خواهشمند است نسبت به اعلام قیمت و ارسال پیش فاکتور دستورات مقتضی را مبذول فرمایید.
                </span>
                <span className="d-block font-11">
                  (1) در صورت عدم امکان ارسال سفارشات، خواهشمند است تا 48 ساعت بعد از دریافت برگ سفارش کالا، اطلاع رسانی فرمایید.
                </span>
                <span className="d-block font-11">
                  (2) سفارشات مطابق <span className="font-bold underline px-1">تاریخ نیاز</span> ارسال گرددو در صورت تحویل سفارش قبل از تاریخ نیاز و یا بیش از
                  تعداد هماهنگی لازم در این خصوص انجام پذیرد در غیر اینصورت امکان تحویل گیری قطعات وجود نخواهد داشت.
                </span>
                <span className="d-block font-11">
                  (3) سفارش تایید شده با توجه به تاریخ نیاز بیان شده <span className="font-bold underline px-1">تا همان ماه</span> اعتبار خواهد داشت.
                </span>
                <span className="d-block font-11">
                  (4) خواهشمند است قبل از ارسال کالا نسبت به ارسال پیش فاکتور اقدام و پس از تایید پیش فاکتور اقدام به ارسال کالا مطابق تاریخ نیاز گردد.
                </span>
                <span className="d-block font-11">
                  (5) لطفا قبل از ارسال کالا هماهنگی های لازم با کارشناس مربوطه در خصوص آدرس انبار، تعداد ارسال کالا و ساعت تحویل بار انجام گردد.
                </span>
                <span className="d-block font-11">(6) در صورت تغییر MRP ماه های آینده، تغییرات تا 25 همان ماه مجدد اعلام خواهد شد.</span>
              </div>
            </div>

            <div className="">
              <table className="table table-bordered factor-table m-0 font-11">
                <thead>
                  <tr>
                    <th className="border">ردیف</th>
                    <th className="border">کد کالا</th>
                    <th className="border">شرح کالا</th>
                    <th className="border">واحد</th>
                    <th className="border">نیاز {months.find((m) => m.value == model?.items?.[0].first_month_id)?.label} ماه</th>
                    <th className="border">نیاز {months.find((m) => m.value == model?.items?.[0].second_month_id)?.label} ماه</th>
                    <th className="border">نیاز {months.find((m) => m.value == model?.items?.[0].third_month_id)?.label} ماه</th>
                    <th className="border">توضیحات</th>
                  </tr>
                </thead>
                <tbody>
                  {(model["items"] || []).length
                    ? model["items"].map((item, key) => (
                        <tr>
                          <td className="border">{++key}</td>
                          <td className="border">{item.id}</td>
                          <td className="border">{item.name}</td>
                          <td className="border">{units.find((u) => u.id == item.unit_id)?.name}</td>
                          <td className="border">{item.first_month_value}</td>
                          <td className="border">{item.second_month_value}</td>
                          <td className="border">{item.third_month_value}</td>
                          <td className="border">{item.desc}</td>
                        </tr>
                      ))
                    : ""}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="text-right font-bold border" colSpan={8}>
                      لطفا 48 ساعت قبل از ارسال سفارشات با کارشناسان واحد تامین قطعات هماهنگی فرمایید.
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right font-bold border" colSpan={3}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex flex-column align-items-start font-bold">
                          <p className="m-0">کارشناس تامین : {`${model?.user?.first_name} ${model?.user?.last_name}`}</p>
                          <p className="m-0" style={{ marginBottom: "4rem" }}>
                            امضا
                          </p>
                          <p className="d-flex justify-content-start gap-2 mb-5">
                            <span>تاریخ</span>
                            <span>:</span>
                            <span>{model.date}</span>
                          </p>
                        </div>
                        <div>{model.readed > 0 && model?.supplier?.sign_img && <img src={model.supplier.sign_img} width={80} />}</div>
                      </div>
                    </td>
                    <td className="border" colSpan={3}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex flex-column align-items-start font-bold">
                          <p className="m-0">رئیس تامین : {`${model?.head?.first_name || ""} ${model?.head?.last_name || ""}`}</p>
                          <p className="m-0" style={{ marginBottom: "4rem" }}>
                            امضا
                          </p>
                          <p className="d-flex justify-content-start gap-2 mb-5">
                            <span>تاریخ</span>
                            <span>:</span>
                            <span>{model.head_approve_date}</span>
                          </p>
                        </div>
                        <div>{model.status >= 1 && model?.head?.sign_img && <img src={model.head.sign_img} width={80} />}</div>
                      </div>
                    </td>
                    <td className="border" colSpan={2}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex flex-column align-items-start font-bold">
                          <p className="m-0">مدیر تامین : {`${model?.manager?.first_name || ""} ${model?.manager?.last_name || ""}`}</p>
                          <p className="m-0" style={{ marginBottom: "4rem" }}>
                            امضا
                          </p>
                          <p className="d-flex justify-content-start gap-2 mb-5">
                            <span>تاریخ</span>
                            <span>:</span>
                            <span>{model.manager_approve_date}</span>
                          </p>
                        </div>
                        <div>{model.status == 3 && model?.manager?.sign_img && <img src={model.manager.sign_img} width={80} />}</div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
