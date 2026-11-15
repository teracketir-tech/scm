import { useState } from "react";
import { Avatar, Badge, Dropdown, List } from "antd";
import { BellOutlined, CheckOutlined, LogoutOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../AuthProvider";

function Header({ subName, onPress, breadcrumb }) {
  const location = useLocation();
  const { logout, notification, auth } = useAuthContext();
  const [visible, setVisible] = useState(false);

  const changeVisible = () => setVisible((prev) => !prev);

  // منوی نوتیفیکیشن‌ها
  const notificationMenu = (
    <List
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-w-[300px]"
      itemLayout="horizontal"
      dataSource={notification}
      locale={{ emptyText: "موردی یافت نشد" }}
      renderItem={(item) => (
        <List.Item
          onClick={changeVisible}
          className="hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 transition-colors cursor-pointer !border-b !border-gray-100 dark:!border-gray-700 last:!border-0"
        >
          <Link
            className="flex items-center gap-3 w-full"
            state={{ task: item.id }}
            to={item.link}
          >
            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center">
              <CheckOutlined />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{item.text}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.description}</span>
            </div>
          </Link>
        </List.Item>
      )}
    />
  );

  // منوی کاربر
  const userMenuItems = [
    {
      key: "1",
      label: <Link to="/profile">پروفایل کاربری</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: (
        <span onClick={logout} className="text-red-500">
          خروج از حساب
        </span>
      ),
      icon: <LogoutOutlined className="text-red-500" />,
    },
  ];

  return (
    <div className="flex items-center justify-between w-full h-full gap-4">
      
      {/* سمت راست: دکمه منو (موبایل) + عنوان صفحه */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPress}
          className="lg:hidden p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <MenuOutlined className="text-xl" />
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {subName || "داشبورد"}
          </h1>
          {breadcrumb && (
            <div className="hidden md:block mt-0.5">
              {breadcrumb}
            </div>
          )}
        </div>
      </div>

      {/* سمت چپ: زنگ، پروفایل */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* دکمه زنگ */}
        <Dropdown
          dropdownRender={() => notificationMenu}
          trigger={["click"]}
          open={visible}
          onOpenChange={changeVisible}
          placement="bottomLeft"
        >
          <button
            className="relative p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            <Badge count={notification?.length || 0} size="small" color="#ef4444">
              <BellOutlined className="text-xl" />
            </Badge>
          </button>
        </Dropdown>

        {/* پروفایل کاربر */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomLeft" trigger={["click"]}>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded-lg transition-colors">
            <Avatar
              size={36}
              className="bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300 font-bold"
            >
              {auth?.company_name?.charAt(0) || "U"}
            </Avatar>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                {auth?.company_name || "کاربر"}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                مدیر سیستم
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

export default Header;