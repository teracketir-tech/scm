import { Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined, ArrowRightOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { DetailCard } from "../../components/DetailCard";
import { checkAccess, getParams, request } from "../../module/util";

export const UserView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTitle, logout, handleDelete, auth } = useAuthContext();
  const [model, setModel] = useState({});
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    const id = await getParams(location.search, "id");
    if (id) {
      let response = await request(`/users/${id}`, "GET");
      if (response["data"]) {
        let _data = response["data"];
        setTitle(` : ${_data["first_name"]} ${_data["last_name"]}`);
        setModel(response["data"]);
      } else if (response["error"]) logout(response["error"]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, [location]);

  const personalFields = [
    { label: "شناسه", value: model.id, isFarsi: true },
    { label: "نام", value: model.first_name },
    { label: "نام خانوادگی", value: model.last_name },
    { label: "موبایل", value: model.username, isFarsi: true, ltr: true },
    { label: "ایمیل", value: model.email, ltr: true },
    { label: "وضعیت", value: model.status_fa || model.status, isStatus: true, statusValue: model.status },
    { label: "نوع", value: model.type_fa },
    { label: "گروه ها", value: model.group_name },
  ];

  const companyFields = [
    { label: "نام شرکت", value: model.company_name },
    { label: "کد اقتصادی", value: model.economic_code },
    { label: "کد ملی", value: model.national_code },
    { label: "کد تامین کننده", value: model.supplier_code },
    { label: "نام مدیر عامل", value: model.name_ceo },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">در حال بارگذاری...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* هدر پروفایل */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl border border-white/30">
              <UserOutlined />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {model.first_name} {model.last_name}
              </h2>
              <p className="text-brand-100 text-sm mt-1">
                {model.company_name || "بدون شرکت"} • {model.type_fa || "کاربر"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              icon={<ArrowRightOutlined />} 
              onClick={() => navigate(-1)} 
              className="!rounded-xl !bg-white/20 !text-white !border-white/30 hover:!bg-white/30 backdrop-blur-sm"
            >
              بازگشت
            </Button>
            {checkAccess(auth.roles, [402]) && (
              <Link to={`/users/update?id=${model.id}`}>
                <Button 
                  icon={<EditOutlined />} 
                  className="!rounded-xl !bg-white !text-brand-600 !border-white hover:!bg-gray-100"
                >
                  ویرایش
                </Button>
              </Link>
            )}
            {checkAccess(auth.roles, [403]) && (
              <Button 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(model.id, "users", "/users")}
                className="!rounded-xl !bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
              >
                حذف
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* کارت‌های جزئیات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailCard 
          title="اطلاعات شخصی" 
          icon={<UserOutlined />} 
          fields={personalFields} 
        />
        <DetailCard 
          title="اطلاعات شرکت" 
          icon={<InfoCircleOutlined />} 
          fields={companyFields} 
        />
      </div>
    </div>
  );
};