import { Button, Tag, Modal, message, Space, Avatar, Tooltip } from "antd";
import { LogoutOutlined, ReloadOutlined, EyeOutlined, UserOutlined, MobileOutlined, DesktopOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { DataTable } from "../../components/DataTable";
import { checkAccess, request } from "../../module/util";

export const ActiveLogins = () => {
  const navigate = useNavigate();
  const { setTitle, logout, auth } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [activeLogins, setActiveLogins] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    setTitle("کاربران آنلاین");
    getActiveLogins();
  }, []);

  const getActiveLogins = async (page = 1, pageSize = 10) => {
    setLoading(true);
    let response = await request(`/user-login-logs?active=1&page=${page}&per-page=${pageSize}`, "GET");
    
    if (response) {
      let logs = [];
      let total = 0;
      
      if (response.data && Array.isArray(response.data)) {
        logs = response.data;
        total = response.total || response.data.length;
      } else if (Array.isArray(response)) {
        logs = response;
        total = response.length;
      } else if (response.items) {
        logs = response.items;
        total = response._meta?.totalCount || response.items.length;
      }

      const logsWithUserInfo = await Promise.all(
        logs.map(async (log) => {
          const userInfo = await getUserInfo(log.user_id);
          return { ...log, user_info: userInfo };
        })
      );
      
      setActiveLogins(logsWithUserInfo);
      setPagination({ current: page, pageSize, total });
    } else {
      setActiveLogins([]);
    }
    setLoading(false);
  };

  const getUserInfo = async (userId) => {
    try {
      let response = await request(`/users/${userId}`, "GET");
      if (response && response.data) return response.data;
      else if (response && !response.error) return response;
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
    return null;
  };

  const handleLogout = async (logId, userId, userName) => {
    Modal.confirm({
      title: "خروج کاربر",
      content: `آیا از خروج کاربر "${userName}" اطمینان دارید؟`,
      onOk: async () => {
        let response = await request(`/user-login-logs/logout/${logId}`, "POST", { active: 0 });
        if (response && !response.error) {
          message.success(`کاربر "${userName}" با موفقیت خارج شد`);
          getActiveLogins(pagination.current, pagination.pageSize);
        } else {
          message.error(response?.message || response?.error || "خطا در خروج کاربر");
        }
      },
    });
  };

  const handleLogoutAll = async () => {
    Modal.confirm({
      title: "خروج تمام کاربران",
      content: "آیا از خروج تمام کاربران آنلاین اطمینان دارید؟",
      onOk: async () => {
        let response = await request(`/user-login-logs/logout-all-active`, "POST");
        if (response && response.success) {
          message.success(`همه کاربران با موفقیت خارج شدند (${response.deactivated_count} نفر)`);
          getActiveLogins(1, pagination.pageSize);
        } else {
          message.error(response?.message || "خطا در خروج کاربران");
        }
      },
    });
  };

  const handleViewDetails = (record) => {
    setSelectedLog(record);
    setModalVisible(true);
  };

  const handleViewUser = (userId) => {
    if (checkAccess(auth.roles, [404])) navigate(`/users/view?id=${userId}`);
  };

  const handleTableChange = (newPagination) => {
    getActiveLogins(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: "ردیف",
      key: "row",
      width: 70,
      render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "نام کاربر",
      key: "user",
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300" />
          <div>
            {checkAccess(auth.roles, [404]) ? (
              <button 
                className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors"
                onClick={() => handleViewUser(record.user_id)}
              >
                {record.user_info?.first_name} {record.user_info?.last_name || `کاربر ${record.user_id}`}
              </button>
            ) : (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {record.user_info?.first_name} {record.user_info?.last_name || `کاربر ${record.user_id}`}
              </span>
            )}
            <div isfarsi="true" style={{direction:'ltr'}} className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {record.user_info?.username && `@${record.user_info.username}`}
            </div>
          </div>
        </div>
      ),
    },
     

    {
      title: "شناسه",
        dataIndex: "user_id",
      key: "user_id",
      width: 130,
      render: (_, record) => {
        
        return <span isfarsi="true" className="text-sm">{record?.user_id}</span>;
      },
    },
    {
      title: "نوع کاربر",
      key: "user_type",
      width: 130,
      render: (_, record) => {
        const type = record.user_info?.type;
        const typeMap = { 5: "نماینده فروش", 11: "کارشناس فروش", 12: "مدیر فروش" };
        return <span isfarsi="true" className="text-sm">{typeMap[type] || "-"}</span>;
      },
    },
    {
      title: "شماره تماس",
      key: "mobile",
      width: 140,
      render: (_, record) => (
        <span isfarsi="true" className="flex items-center gap-2 text-sm">
          <MobileOutlined className="text-gray-400" />
          {record.user_info?.username || "-"}
        </span>
      ),
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
      width: 120,
      render: (ip) => <span isfarsi="true" className="text-sm ltr inline-block">{ip || "-"}</span>,
    },
    {
      title: "سیستم عامل",
      dataIndex: "os",
      key: "os",
      width: 150,
      render: (os) => (
        <Tooltip title={os}>
          <span isfarsi="true" className="flex items-center gap-2 text-sm">
            <DesktopOutlined className="text-gray-400" />
            {os?.substring(0, 30) || "نامشخص"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "تاریخ ورود",
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (date) => <span className="text-sm">{date ? new Date(date).toLocaleString("fa-IR") : "-"}</span>,
    },
    {
      title: "مدت زمان آنلاین",
      key: "duration",
      width: 130,
      render: (_, record) => {
        if (!record.created_at) return "-";
        const diffMinutes = Math.floor((new Date() - new Date(record.created_at)) / 1000 / 60);
        let text = "";
        if (diffMinutes < 60) text = `${diffMinutes} دقیقه پیش`;
        else if (diffMinutes < 1440) text = `${Math.floor(diffMinutes / 60)} ساعت پیش`;
        else text = `${Math.floor(diffMinutes / 1440)} روز پیش`;
        return <span isfarsi="true" className="text-sm">{text}</span>;
      },
    },
    {
      title: "عملیات",
      key: "actions",
      width: 120,
      align: "center",
      render: (text, record) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip placement="top" title="جزئیات">
            <button className="action-btn view" onClick={() => handleViewDetails(record)}>
              <EyeOutlined />
            </button>
          </Tooltip>
          <Tooltip placement="top" title="خروج">
            <button 
              className="action-btn delete" 
              onClick={() => handleLogout(record.id, record.user_id, `${record.user_info?.first_name} ${record.user_info?.last_name}`)}
            >
              <LogoutOutlined />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      
      {/* هدر: عنوان و دکمه‌ها */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">کاربران آنلاین</h2>
          <Tag color="green" className="!rounded-full !px-3 !py-0.5 !text-xs !font-medium">
            {pagination.total} نفر
          </Tag>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => getActiveLogins(pagination.current, pagination.pageSize)} 
            loading={loading}
            className="!rounded-lg"
          >
            بروزرسانی
          </Button>
          {checkAccess(auth.roles, [403]) && (
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogoutAll}
              disabled={activeLogins.length === 0}
              className="!rounded-lg"
            >
              خروج همه
            </Button>
          )}
        </div>
      </div>

      {/* جدول */}
      <DataTable 
        columns={columns} 
        dataSource={activeLogins} 
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => getActiveLogins(page, pageSize),
          showSizeChanger: true,
        }}
      />

      {/* مودال جزئیات */}
      <Modal
        title="جزئیات لاگ ورود"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[<Button key="close" onClick={() => setModalVisible(false)}>بستن</Button>]}
        width={600}
      >
        {selectedLog && (
          <div className="flex flex-col gap-3 py-2">
            {[
              { label: "شناسه لاگ", value: selectedLog.id },
              { label: "شناسه کاربر", value: selectedLog.user_id },
              { label: "نام کاربر", value: `${selectedLog.user_info?.first_name || ""} ${selectedLog.user_info?.last_name || "-"}` },
              { label: "نام کاربری", value: selectedLog.user_info?.username || "-" },
              { label: "IP", value: selectedLog.ip || "-" },
              { label: "سیستم عامل", value: selectedLog.os || "-" },
              { label: "تاریخ ورود", value: selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString("fa-IR") : "-" },
               
            ].map((item, idx) => (
              <div key={idx} className={`flex ${item.fullWidth ? "flex-col" : "flex-row items-center"} gap-2 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0`}>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">{item.label}:</span>
                <span className={`text-sm text-gray-900 dark:text-white ${item.fullWidth ? "break-all ltr" : ""}`} isfarsi="true">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};