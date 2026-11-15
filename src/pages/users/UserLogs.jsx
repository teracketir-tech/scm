import { Button, Table, Tag, Modal, message, Card, Space ,Tooltip} from "antd";
import { LogoutOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { checkAccess, getParams, request } from "../../module/util";

export const UserLogs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTitle, logout, auth } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [userLogs, setUserLogs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const getUserInfo = async (userId) => {
    let response = await request(`/users/${userId}`, "GET");
    if (response && response.data) {
      setUserInfo(response.data);
      setTitle(`لاگ‌های ورود : ${response.data.first_name} ${response.data.last_name}`);
    } else if (response && !response.error) {
      setUserInfo(response);
      setTitle(`لاگ‌های ورود : ${response.first_name} ${response.last_name}`);
    } else if (response?.error) {
      logout(response.error);
    }
  };

  const getUserLogs = async (userId, page = 1, pageSize = 10) => {
    setLoading(true);
    let response = await request(`/user-login-logs?user_id=${userId}&page=${page}&per-page=${pageSize}`, "GET");
    
    if (response) {
      if (response.data && Array.isArray(response.data)) {
        setUserLogs(response.data);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.total || response.data.length,
        });
      } 
      else if (Array.isArray(response)) {
        setUserLogs(response);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response.length,
        });
      }
      else if (response.items) {
        setUserLogs(response.items);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response._meta?.totalCount || response.items.length,
        });
      }
      else {
        setUserLogs([]);
      }
    } else {
      setUserLogs([]);
    }
    setLoading(false);
  };

  const handleLogout = async (logId, userId) => {
    Modal.confirm({
      title: "خروج کاربر",
      content: "آیا از خروج این کاربر اطمینان دارید؟",
      onOk: async () => {
        let response = await request(`/user-login-logs/${logId}`, "PATCH", {
          active: 0
        });
        
        if (response && !response.error) {
          message.success("کاربر با موفقیت خارج شد");
          const userId = await getParams(location.search, "user_id");
          if (userId) {
            getUserLogs(userId, pagination.current, pagination.pageSize);
          }
        } else {
          message.error(response?.message || response?.error || "خطا در خروج کاربر");
        }
      },
    });
  };

  const handleViewDetails = (record) => {
    setSelectedLog(record);
    setModalVisible(true);
  };

  const handleTableChange = (newPagination) => {
    const userId = getParams(location.search, "user_id");
    if (userId) {
      getUserLogs(userId, newPagination.current, newPagination.pageSize);
    }
  };

  useEffect(() => {
    const init = async () => {
      const userId = await getParams(location.search, "user_id");
      if (userId) {
        await getUserInfo(userId);
        await getUserLogs(userId, 1, 10);
      } else {
        message.error("شناسه کاربر یافت نشد");
        navigate(-1);
      }
    };
    init();
  }, [location]);

  const columns = [
    {
      title: "ردیف",
      key: "row",
      width: 70,
      render: (text, record, index) => 
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "توکن",
      dataIndex: "token",
      key: "token",
      ellipsis: true,
      width: 200,
      render: (token) => token?.substring(0, 20) + "...",
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
      width: 120,
      render: (ip) => ip || "-",
    },
    {
      title: "سیستم عامل",
      dataIndex: "os",
      key: "os",
      width: 150,
      render: (os) => os || "نامشخص",
    },
    {
      title: "وضعیت",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active) => (
        <Tag color={active === 1 ? "green" : "red"}>
          {active === 1 ? "فعال" : "غیر فعال"}
        </Tag>
      ),
    },
    {
      title: "تاریخ ورود",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date) => date ? new Date(date).toLocaleString("fa-IR") : "-",
    },
    {
      title: "عملیات",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (text, record) => (
        <div>
          <Tooltip placement="top" title="جزئیات" color="#52c41a">
            <button className="ml-2" onClick={() => handleViewDetails(record)}>
              <i className="fa fa-eye text-success" aria-hidden="true"></i>
            </button>
          </Tooltip>
          {record.active === 1 && checkAccess(auth.roles, [403]) && (
            <Tooltip placement="top" title="خروج" color="#F1212C">
              <button onClick={() => handleLogout(record.id, record.user_id)}>
                <i className="fa fa-sign-out text-danger" aria-hidden="true"></i>
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const userInfoTable = () => {
    if (!userInfo) return null;
    
    return (
      <div className="table-responsive">
        <table className="w-100">
          <thead className="ant-table-thead">
            <tr>
              <th className="ant-table-cell">شناسه</th>
              <th className="ant-table-cell">{userInfo.id}</th>
              <th className="ant-table-cell">نام</th>
              <th className="ant-table-cell">{userInfo.first_name}</th>
            </tr>
            <tr>
              <th className="ant-table-cell">نام خانوادگی</th>
              <th className="ant-table-cell">{userInfo.last_name}</th>
              <th className="ant-table-cell">نام کاربری</th>
              <th className="ant-table-cell">{userInfo.username}</th>
            </tr>
            <tr>
              <th className="ant-table-cell">شماره تماس</th>
              <th className="ant-table-cell">{userInfo.username}</th>
              <th className="ant-table-cell">ایمیل</th>
              <th className="ant-table-cell">{userInfo.email || "-"}</th>
            </tr>
            <tr>
              <th className="ant-table-cell">نوع کاربر</th>
              <th className="ant-table-cell">{userInfo.type_fa || "-"}</th>
              <th className="ant-table-cell">وضعیت</th>
              <th className="ant-table-cell">{userInfo.status_fa || "-"}</th>
            </tr>
            <tr>
              <th className="ant-table-cell">نام شرکت</th>
              <th className="ant-table-cell">{userInfo.company_name || "-"}</th>
              <th className="ant-table-cell">کد اقتصادی</th>
              <th className="ant-table-cell">{userInfo.economic_code || "-"}</th>
            </tr>
            <tr>
              <th className="ant-table-cell">کد ملی</th>
              <th className="ant-table-cell">{userInfo.national_code || "-"}</th>
              <th className="ant-table-cell">نام مدیر عامل</th>
              <th className="ant-table-cell">{userInfo.name_ceo || "-"}</th>
            </tr>
          </thead>
        </table>
      </div>
    );
  };

  return (
    <div className="mt-3 mb-5">
      {userInfo && (
        <>
          <Card title="مشخصات کاربر" className="mx-2 mb-4">
            {userInfoTable()}
          </Card>

          <Card
            title="لاگ‌های ورود"
            className="mx-2"
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  const userId = getParams(location.search, "user_id");
                  if (userId) {
                    getUserLogs(userId, pagination.current, pagination.pageSize);
                  }
                }}
                loading={loading}
              >
                بروزرسانی
              </Button>
            }
          >
            <div className="table-responsive">
              <Table
                columns={columns}
                dataSource={userLogs}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                bordered
                className="ant-border-space"
                rowKey="id"
              />
            </div>
          </Card>
        </>
      )}

      <Modal
        title="جزئیات لاگ ورود کاربر"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            بستن
          </Button>,
        ]}
        width={600}
      >
        {selectedLog && (
          <div className="table-responsive">
            <table className="w-100">
              <thead className="ant-table-thead">
                <tr>
                  <th className="ant-table-cell">شناسه لاگ</th>
                  <th className="ant-table-cell">{selectedLog.id}</th>
                </tr>
                <tr>
                  <th className="ant-table-cell">شناسه کاربر</th>
                  <th className="ant-table-cell">{selectedLog.user_id}</th>
                </tr>
                <tr>
                  <th className="ant-table-cell">توکن</th>
                  <th className="ant-table-cell">
                    <div style={{ wordBreak: "break-all" }}>{selectedLog.token}</div>
                  </th>
                </tr>
                <tr>
                  <th className="ant-table-cell">IP</th>
                  <th className="ant-table-cell">{selectedLog.ip || "-"}</th>
                </tr>
                <tr>
                  <th className="ant-table-cell">سیستم عامل</th>
                  <th className="ant-table-cell">{selectedLog.os || "-"}</th>
                </tr>
                <tr>
                  <th className="ant-table-cell">وضعیت</th>
                  <th className="ant-table-cell">
                    <Tag color={selectedLog.active === 1 ? "green" : "red"}>
                      {selectedLog.active === 1 ? "فعال" : "غیر فعال"}
                    </Tag>
                  </th>
                </tr>
                <tr>
                  <th className="ant-table-cell">تاریخ ورود</th>
                  <th className="ant-table-cell">
                    {selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString("fa-IR") : "-"}
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};