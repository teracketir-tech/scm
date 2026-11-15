import { Button, Divider, Dropdown, Menu, Table } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, confirm, numberFormat, request } from "../../module/util";
import SaveSelfDeclaration from "./Save";
import SaveSelfDeclaration2 from "./Save2";
import InquiryModal from "./InquiryModal";
import PriceDetails from "./PriceDetails";
import TicketModal from "./TicketModal";
import { CheckOutlined, DownOutlined } from "@ant-design/icons";
import { getFilters, transformModelData } from "../../module/self_declarationUtil";
import ExportToExcel, { handleDownloadExcel } from "../../components/ExportToExcel";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function SelfDeclaration() {
  const userTypes = ["تامین کننده", "کارشناس تامین", "بازاریابی", "فروش"];
  const { handleDelete, auth, navigate } = useAuthContext();
  const location = useLocation();
  const [model, setModel] = useState([]);
  const [editedIds, setEditedIds] = useState([]);
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [pages, setPages] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [carTypes, setCarTypes] = useState([]);
  const [placeDelivery, setPlaceDelivery] = useState([]);
  const [WarrantyStatus, setWarrantyStatus] = useState([]);
  const [country, setCountry] = useState([]);
  const [type, setType] = useState([]);
  const [packing, setPacking] = useState([]);
  const [status, setStatus] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedValue, setSelectedValue] = useState([]);
  const [inquiryModal, setInquiryModal] = useState(false);
  const [inquiryModalData, setInquiryModalData] = useState({});
  const [priceDetailModal, setPriceDetailModal] = useState(false);
  const [priceDetailModalData, setPriceDetailModalData] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [justPrice, setJustPrice] = useState(false);
  const [justPriceType, setJustPriceType] = useState(null);
  const [messageData, setMessageData] = useState({});
  const [product_serial, setProduct_serial] = useState(null);
  const [params, setParams] = useState(null);

  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <span className="d-flex">
          {record.status === 8 ? <CheckOutlined className="text-success mx-2" /> : ""}
          {id}
        </span>
      ),
    },
    {
      title: "شماره پرونده",
      dataIndex: "document_id",
      key: "document_id",
    },
    {
      title: "سریال قطعه",
      dataIndex: "product_serial",
      key: "product_serial",
    },
    {
      title: "شرح",
      dataIndex: "product_desc",
      key: "product_desc",
    },
    {
      title: "قیمت",
      dataIndex: "price_fa",
      key: "price_fa",
      hidden:
        !checkAccess(auth.roles, [500]) && checkAccess(auth.roles, [506])
          ? false
          : checkAccess(auth.roles, [500]) && !checkAccess(auth.roles, [508])
          ? true
          : false,
    },
    {
      title: "خودرو",
      dataIndex: "car_type_fa",
      key: "car_type_fa",
    },
    {
      title: "زمان تحویل",
      dataIndex: "delivery_time",
      key: "delivery_time",
    },
    {
      title: "ظرفیت تامین",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "برند",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "گرید",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "وارداتی/تولیدی",
      dataIndex: "type_fa",
      key: "type_fa",
    },
    {
      title: "وضعیت",
      dataIndex: "status_fa",
      key: "status_fa",
      hidden: !checkAccess(auth.roles, [516]),
    },
    {
      title: "تاریخ ثبت",
      dataIndex: "created_date",
      key: "created_date",
    },
    {
      title: "نام شرکت",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "عملیات",
      key: "action",
      dataIndex: "action",
    },
  ];

  const getData = (params) => {
    request(`/self-declarations?${params}`)
      .then((res) => {
        if (res["success"]) {
          let data = res["data"];
          setModel(data["list"]);
          setPages(data["pages"]);
          setAllData(data["all"]);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleModal = (updateData, update2 = false, priceType = null) => {
    if (update2) setOpenModal2(true);
    else setOpenModal(true);
    setUpdateData(updateData);
    setJustPriceType(priceType);
    if (priceType) setJustPrice(true);

    setEditedIds((prevIds) => {
      if (!prevIds.includes(updateData.id)) {
        return [...prevIds, updateData.id];
      }
      return prevIds;
    });
  };

  const getFormData = async () => {
    let data = await request(`/self-declarations/form-data`, "GET");
    if (data["success"]) {
      data = data["data"];
      setCarTypes(data["car_types"]);
      setPacking(data["packing"]);
      setPlaceDelivery(data["place_delivery"]);
      setWarrantyStatus(data["warranty_status"]);
      setCountry(data["country"]);
      setStatus(data["status"]);
      setType(data["type"]);
    }
  };

  const handleVerify = async (item) => {
    try {
      let check = await confirm();
      if (check) {
        let res = await request(`/self-declarations/verify?id=${item["id"]}`);
        if (res["success"]) navigate(location);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getFormData();
  }, [location.pathname]);

  const handleChangeStatus = async (status, data, is_staff = null) => {
    try {
      // if (status === 3) {
      //   setShowMessage(true);
      //   data["is_staff"] = is_staff;
      //   setMessageData(data);
      // } else {
      let check = await confirm();
      if (check) {
        let res = await request(`/self-declarations/confirm-or-reject?id=${data["id"]}&status=${status}`);
        if (res["success"]) {
          navigate(location);
        }
      }
      // }
    } catch (error) {}
  };

  useEffect(() => {
    const newData = transformModelData(
      model,
      auth,
      handleModal,
      handleDelete,
      handleVerify,
      handleChangeStatus,
      setInquiryModal,
      setInquiryModalData,
      setEditedIds,
      setPriceDetailModal,
      setPriceDetailModalData,
      request,
      getData,
      params
    );
    setData(newData);
  }, [model]);

  const filters = getFilters(auth, carTypes, type, status);

  const onSelectChange = (newSelectedRowKeys, selectedRows) => {
    let id = [];
    for (const iterator of selectedRows) {
      id.push(iterator["id"]);
    }
    setSelectedValue(id);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: record.document_id || record.user_id != auth["id"],
    }),
  };

  const handleMerge = () => {
    confirm().then((res) => {
      request("/self-declarations/merge", "POST", {
        id: selectedValue,
      }).then((response) => {
        if (response["success"]) {
          navigate(location);
          setSelectedValue([]);
          setSelectedRowKeys([]);
        }
      });
    });
  };

  const marketingExcelHeaders = [
    { title: "کد کالا", width: 10, bgColor: "5b9bd5" },
    { title: "شرح کالا", width: 25, bgColor: "5b9bd5" },
    { title: "شماره پرونده SCM", width: 20, bgColor: "5b9bd5" },
    { title: "تاریخ ثبت تامین", width: 30, bgColor: "5b9bd5" },
    { title: "تامین کننده", width: 20, bgColor: "ff00ff" },
    { title: "برند بازار", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار", width: 25, bgColor: "548235" },
    { title: "برند بازار2", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار2", width: 25, bgColor: "548235" },
    { title: "برند بازار3", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار3", width: 25, bgColor: "548235" },
    { title: "برند بازار4", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار4", width: 25, bgColor: "548235" },
    { title: "برند بازار5", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار5", width: 25, bgColor: "548235" },
    { title: "برند بازار6", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار6", width: 25, bgColor: "548235" },
    { title: "برند بازار7", width: 20, bgColor: "5b9bd5" },
    { title: "قیمت بازار7", width: 25, bgColor: "548235" },
    { title: "قیمت پرتال", width: 25, bgColor: "ff3300" },
    { title: "قیمت بازاریابی", width: 25, bgColor: "00b050" },
    { title: "توضیحات", width: 40, bgColor: "5b9bd5" },
  ];

  const analysisExcelHeaders = [
    { title: "کد کالا", width: 10 },
    { title: "شرح کالا", width: 25 },
    { title: "موجودی", width: 20 },
    { title: "mrpماه", width: 30 },
    { title: "تعداد سفارش", width: 20 },
    { title: "قیمت با 10%", width: 20 },
    { title: "قیمت پرتال", width: 25 },
    { title: "حاشیه سود فعلی", width: 20 },
    { title: "رقیب 1", width: 25 },
    { title: "قیمت", width: 20 },
    { title: "رقیب 2", width: 25 },
    { title: "قیمت", width: 20 },
    { title: "رقیب3", width: 25 },
    { title: "قیمت", width: 20 },
    { title: "قیمت نهایی مدیریت", width: 25 },
    { title: "حاشیه سود بر اساس قیمت مدیرعامل", width: 30 },
  ];

  const handleDownloadMarketingExcel = async () => {
    const ids = allData.map((item) => item.id).join(",");

    const res = await request(`/self-declarations/inquiry-get-all?ids=${ids}`, "GET");
    const products = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=0`, "GET", null, true, true);

    const data = [];

    allData.forEach((item) => {
      const items = res?.filter((d) => d.self_declaration_id == item.id);
      const product = products?.data?.find((p) => p.code == item.product_serial);

      data.push([
        item?.product_serial,
        item?.product_desc,
        item?.document_id,
        new DateObject({ date: item?.created_date, format: "YYYY/MM/DD HH:mm:s" }).convert(persian, persian_fa).format(),
        item?.supplier?.company_name || "",
        items?.[0]?.brand || "",
        items?.[0]?.price?.toLocaleString() || "",
        items?.[1]?.brand || "",
        items?.[1]?.price?.toLocaleString() || "",
        items?.[2]?.brand || "",
        items?.[2]?.price?.toLocaleString() || "",
        items?.[3]?.brand || "",
        items?.[3]?.price?.toLocaleString() || "",
        items?.[4]?.brand || "",
        items?.[4]?.price?.toLocaleString() || "",
        items?.[5]?.brand || "",
        items?.[5]?.price?.toLocaleString() || "",
        items?.[6]?.brand || "",
        items?.[6]?.price?.toLocaleString() || "",
        product?.LastPrice?.toLocaleString() || "",
        item?.inquiry_price?.toLocaleString() || "",
        item?.description_supplier,
      ]);
    });

    handleDownloadExcel("Marketing", marketingExcelHeaders, data, "FFFFFF");
  };

  const handleDownloadAnalysisExcel = async () => {
    const ids = allData.map((item) => item.id).join(",");

    const res = await request(`/self-declarations/inquiry-get-all?ids=${ids}`, "GET");
    const products = await request(`https://portalapi.dinapart.ir/api/scm-search-products?s=0`, "GET", null, true, true);

    const data = [];

    allData.forEach((item) => {
      const items = res?.filter((d) => d.self_declaration_id == item.id);
      const product = products?.data?.find((p) => p.code == item.product_serial);

      const ceo_profit_price = item.ceo_price ? (item.ceo_price - item.final_price) / item.final_price : 0;

      data.push([
        item?.product_serial,
        item?.product_desc,
        item?.sell_count,
        item?.mrp,
        item?.buy_count,
        item?.final_price?.toLocaleString() || "",
        product?.LastPrice?.toLocaleString() || "",
        parseFloat(product?.LastPrice / item?.final_price - 1).toFixed(2) || 0,
        items?.[0]?.brand || "",
        items?.[0]?.price?.toLocaleString() || "",
        items?.[1]?.brand || "",
        items?.[1]?.price?.toLocaleString() || "",
        items?.[2]?.brand || "",
        items?.[2]?.price?.toLocaleString() || "",
        item?.ceo_price?.toLocaleString() || "",
        parseFloat(ceo_profit_price * 100).toFixed(2),
      ]);
    });

    handleDownloadExcel("PriceAnalysis", analysisExcelHeaders, data);
  };

  return (
    <>
      <Filters fields={[...filters, { name: "created_date", type: "date_rang", label: "محدوده تاریخ" }]} getData={getData} setParams={setParams} />
      <Divider />
      <div className="d-flex justify-content-start gap-2 mb-4">
        {checkAccess(auth.roles, [509]) && (
          <Button type="default" className="mr-2" onClick={handleDownloadMarketingExcel}>
            خروجی اکسل بازاریابی
          </Button>
        )}
        {checkAccess(auth.roles, [515]) && (
          <Button type="default" className="mr-2" onClick={handleDownloadAnalysisExcel}>
            خروجی اکسل آنالیز قیمت
          </Button>
        )}
        {checkAccess(auth.roles, [501]) ? (
          <Button type="success" className="m-2" onClick={() => handleModal({})}>
            خود اظهاری جدید
          </Button>
        ) : (
          ""
        )}
        {userTypes[auth?.user_type - 1]}
      </div>
      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className="ant-border-space"
          rowSelection={rowSelection}
          rowClassName={(record) => {
            const isEdited = editedIds.includes(record.id);
            const isNewestEdited = record.id === editedIds[editedIds.length - 1];

            if (isNewestEdited) {
              return "highlighted-row newest-edited-row";
            } else if (isEdited) {
              return "highlighted-row";
            }
            return "";
          }}
        />
      </div>
      {selectedValue.length > 1 ? (
        <div className="merge_button">
          <Button type="primary" size="large" onClick={handleMerge}>
            ثبت در پرونده
          </Button>
        </div>
      ) : (
        ""
      )}
      <Pagination all={pages} />

      <SaveSelfDeclaration
        open={openModal}
        setOpen={setOpenModal}
        data={updateData}
        setData={setUpdateData}
        carTypes={carTypes}
        type={type}
        country={country}
      />
      <SaveSelfDeclaration2
        open={openModal2}
        setOpen={setOpenModal2}
        data={updateData}
        setData={setUpdateData}
        placeDelivery={placeDelivery}
        WarrantyStatus={WarrantyStatus}
        packing={packing}
        justPrice={justPrice}
        setJustPrice={setJustPrice}
        justPriceType={justPriceType}
      />
      <InquiryModal open={inquiryModal} setOpen={setInquiryModal} data={inquiryModalData} setData={setInquiryModalData} product_serial={product_serial} />
      <PriceDetails open={priceDetailModal} setOpen={setPriceDetailModal} data={priceDetailModalData} setData={setPriceDetailModalData} />
      <TicketModal open={showMessage} setOpen={setShowMessage} data={messageData} setData={setMessageData} />
    </>
  );
}
