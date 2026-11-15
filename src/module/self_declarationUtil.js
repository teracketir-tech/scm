import React from "react";
import { Menu, Button, Dropdown, notification } from "antd";
import { Link } from "react-router-dom";
import { CheckOutlined, DownOutlined } from "@ant-design/icons";
import { checkAccess, numberFormat } from "./util";

export const transformModelData = (
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
) => {
  let newData = [];

  const renderButtonClass = (item) => {
    if (item["status"] === 5 && !item["supply_manager_price"]) {
      return "btn btn-danger";
    }
    if (item["status"] >= 7) {
      return "btn btn-sm btn-neutral";
    }
    return "btn btn-sm btn-sky";
  };

  const renderButtonStyle = (item) => {
    if (item["status"] === 5 && !item["supply_manager_price"]) {
      return { cursor: "not-allowed" };
    }
    return null;
  };

  const handleFinalApproveClick = (item) => {
    if (item["status"] === 5 && !item["supply_manager_price"]) {
      notification.error({
        message: "ابتدا قیمت مدیر تامین را وارد کنید.",
        type: "error",
      });
    } else if (item["status"] === 5 && !item["ceo_price"]) {
      notification.error({
        message: "ابتدا قیمت مدیر عامل را وارد کنید.",
        type: "error",
      });
    } else {
      handleChangeStatus(1, item);
    }
  };

  const renderMenuItems = (item) => (
    <Menu>
      <Menu.Item key="finalApprove">
        <Button
          className={renderButtonClass(item)}
          style={renderButtonStyle(item)}
          onClick={() => handleFinalApproveClick(item)}
        >
          تایید نهایی
        </Button>
      </Menu.Item>
      <Menu.Item key="reject">
        <Button
          className="btn btn-sm btn-purple"
          onClick={() => handleChangeStatus(2, item)}
        >
          رد کامل
        </Button>
      </Menu.Item>
      <Menu.Item key="priceCorrection">
        <Button
          className="btn btn-sm btn-purple"
          onClick={() => handleChangeStatus(3, item, 1)}
        >
          اصلاح قیمت
        </Button>
      </Menu.Item>
    </Menu>
  );

  const getStatusRoleMapping = (status) => {
    const mapping = {
      4: [522],
      5: [513],
      6: [514],
      7: [514],
      8: [514],
    };
    return mapping[status] || [];
  };

  const renderDropdown = (item) => {
    const roles = getStatusRoleMapping(item["status"]);
    if (!checkAccess(auth.roles, roles)) {
      return null;
    }

    return (
      <Menu.Item key="dropdown">
        <Dropdown overlay={renderMenuItems(item)}>
          <Button>
            {item["status"] === 5
              ? "منتظر تایید مدیر تامین"
              : item["status"] === 6
              ? "منتظر تایید مدیر عامل"
              : item["status_fa"]}
          </Button>
        </Dropdown>
      </Menu.Item>
    );
  };
const EditButton = (status,item)=>{
 
    if(status==1){
      if(checkAccess(auth.roles, [513])){
        return  (<Menu.Item key="edit">
            <Button
              className="btn btn-sm btn-primary mx-1"
              onClick={() => handleModal(item)}
            >
              ویرایش
            </Button>
          </Menu.Item>);
      }
    }
    else{
      if(checkAccess(auth.roles, [502])){
        return (<Menu.Item key="edit">
            <Button
              className="btn btn-sm btn-primary mx-1"
              onClick={() => handleModal(item)}
            >
              ویرایش
            </Button>
          </Menu.Item>);
      }
    }
 }
  model.forEach((item, k) => {
    item["key"] = ++k;
    item["price_fa"] = numberFormat(item["final_price"]);
    item["created_date"] = <span dir="ltr">{item["created_date"]}</span>;

    const actions = (
      <Menu>
        {EditButton(item["status"],item)}
        {checkAccess(auth.roles, [503]) && (
          <Menu.Item key="delete">
            <Button
              className="btn btn-sm btn-danger mx-1"
              onClick={() =>
                handleDelete(item.id, "self-declarations", "/self-declarations")
              }
            >
              حذف
            </Button>
          </Menu.Item>
        )}
        {checkAccess(auth.roles, [520]) &&
          (item["status"] === 0 || item["status"] === 10) && (
            <Menu.Item key="verify">
              <Button
                className="btn btn-sm btn-success mx-1"
                onClick={() => handleVerify(item)}
              >
                تایید
              </Button>
            </Menu.Item>
          )}
        {checkAccess(auth.roles, [507]) && (
          <Menu.Item key="details">
            <Link
              className="btn btn-sm btn-info text-white mx-1"
              to={`/view?id=${item["id"]}`}
            >
              جزئیات
            </Link>
          </Menu.Item>
        )}
        {checkAccess(auth.roles, [504]) &&
          item["user_id"] === auth["id"] &&
          item["status"] > 0 && (
            <Menu.Item key="modal">
              <Button
                className="btn btn-sm btn-warning mx-1"
                onClick={() => handleModal(item, true)}
              >
                قیمت ثبت شد
              </Button>
            </Menu.Item>
          )}
        {checkAccess(auth.roles, [509]) && item["status"] >= 1 && (
          <Menu.Item key="inquiry">
            <Button
              className={`btn btn-sm ${
                item["inquiry_price"] && item.status > 1
                  ? "btn-primary"
                  : "btn-dark"
              } mx-1`}
              onClick={() => {
                setInquiryModal(true);
                setInquiryModalData(item);
                setEditedIds((prevIds) =>
                  !prevIds.includes(item.id) ? [...prevIds, item.id] : prevIds
                );
              }}
            >
              {item["inquiry_price"] && item.status > 1 ? (
                <CheckOutlined className="text-success" />
              ) : (
                ""
              )}
              {item["inquiry_price"] && item.status > 1
                ? "قیمت بازاریابی ثبت شد"
                : "ثبت قیمت بازاریابی"}
            </Button>
          </Menu.Item>
        )}
        {item["status"] >= 5 && checkAccess(auth.roles, [513]) && (
          <Menu.Item key="supplyPrice">
            <Button
              className="btn btn-sm btn-orange mx-1"
              onClick={() => {
                handleModal(item, true, 513);
                setEditedIds((prevIds) => {
                  if (!prevIds.includes(item.id)) {
                    return [...prevIds, item.id];
                  }
                  return prevIds;
                });
              }}
            >
              {item["supply_manager_price"] && (
                <CheckOutlined className="text-success" />
              )}
              ثبت قیمت مدیر تامین
            </Button>
          </Menu.Item>
        )}

        {item["status"] >= 5 && checkAccess(auth.roles, [514]) && (
          <Menu.Item key="ceoPrice">
            <Button
              className={`btn btn-sm ${
                item["ceo_profit_price"] ? "btn-primary" : "btn-rose"
              } mx-1`}
              onClick={() => handleModal(item, true, 514)}
            >
              {item["ceo_price"] && <CheckOutlined className="text-success" />}
              ثبت قیمت مدیر عامل
            </Button>
          </Menu.Item>
        )}

        {checkAccess(auth.roles, [524]) &&
          item["status"] >= 2 &&
          item["inquiry_price"] && (
            <Menu.Item key="inquiry">
              <Button
                disabled={!item["inquiry_price"]}
                className={`btn btn-sm ${
                  item["inquiry_price"] && item.status > 2
                    ? "btn-primary"
                    : "btn-dark"
                } mx-1`}
                onClick={async () => {
                  await request(`/self-declarations/inquiry`, "POST", {
                    id: item.id,
                    inquiry_price: item["inquiry_price"],
                    items: [],
                  });
                  getData(params);
                }}
              >
                {item["status"] >= 3 ? (
                  <CheckOutlined className="text-success" />
                ) : (
                  ""
                )}
                {item["status"] >= 3
                  ? "قیمت بازاریابی تایید"
                  : "تایید قیمت بازاریابی"}
              </Button>
            </Menu.Item>
          )}
        {checkAccess(auth.roles, [510]) && item["status"] > 2 && (
          <Menu.Item key="priceDetail">
            <Button
              className={`btn btn-sm ${
                item["suggested_selling_price"]
                  ? "btn-primary"
                  : "btn-secondary"
              } mx-1`}
              onClick={() => {
                setPriceDetailModal(true);
                setPriceDetailModalData(item);
                setEditedIds((prevIds) =>
                  !prevIds.includes(item.id) ? [...prevIds, item.id] : prevIds
                );
              }}
            >
              {item["suggested_selling_price"] && <CheckOutlined />}
              قیمت فروش
            </Button>
          </Menu.Item>
        )}
        {renderDropdown(item)}
        {checkAccess(auth.roles, [515]) && item["status"] >= 5 && (
          <Menu.Item key="priceAnalysis">
            <Link
              className="btn btn-sm btn-orange mx-1"
              to={`/self-declarations/price-analysis?id=${item["id"]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              آنالیز قیمت
            </Link>
          </Menu.Item>
        )}
      </Menu>
    );

    item["action"] = (
      <div className="table_button">
        <Dropdown overlay={actions} placement="bottomLeft">
          <Button>
            انتخاب کنید <DownOutlined />
          </Button>
        </Dropdown>
      </div>
    );

    newData.push(item);
  });

  return newData;
};

export const getFilters = (auth, carTypes, type, status) => {
  return [
    { name: "id", type: "text", label: "شناسه" },
    {
      name: "document_id",
      type: "text",
      label: "شماره پرونده",
    },
    {
      label: "سریال قطعه",
      name: "product_serial",
      type: "text",
    },
    {
      label: "شرح",
      name: "product_desc",
      type: "text",
    },
    {
      name: "price",
      type: "price",
      label: "قیمت",
      placeholder: "از قیمت",
      hidden:
        !checkAccess(auth.roles, [500]) && checkAccess(auth.roles, [506])
          ? false
          : checkAccess(auth.roles, [500]) && !checkAccess(auth.roles, [508])
          ? true
          : false,
      between: {
        name: "price2",
        label: "",
        placeholder: "تا قیمت",
        type: "price",
      },
    },

    {
      label: "خودرو",
      name: "car_type",
      type: "select",
      options: carTypes,
      mode: "multiple",
    },
    {
      label: "زمان تحویل",
      name: "delivery_time",
      type: "text",
    },
    {
      label: "ظرفیت تامین",
      name: "capacity",
      type: "text",
    },
    {
      label: "برند",
      name: "brand",
      type: "text",
    },
    {
      label: "گرید",
      name: "grade",
      type: "text",
    },
    {
      label: "وارداتی/تولیدی",
      name: "type",
      type: "select",
      options: type,
      mode: "multiple",
    },
    {
      label: "وضعیت",
      name: "status",
      type: "select",
      options: status,
      mode: "multiple",
    },
    {
      label: "نام شرکت",
      name: "company_name",
      type: "text",
    },
  ];
};
