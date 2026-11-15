import { CaretDownOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Menu, Tooltip, Avatar, Dropdown } from "antd";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { checkAccess } from "../../module/util";
import { useAuthContext } from "../AuthProvider";
import { menuConfig } from "./menuConfig";
import logo from "../../assets/img/logo.png";
function Sidenav({ collapsed, setCollapsed, isDark }) {
  const { auth, logout } = useAuthContext();
  const { pathname } = useLocation();
  const [openKey, setOpenKey] = useState([]);

  // چک کردن دسترسی (با توجه به roles)
  const checkAllowed = (item) => {
    if (!item) return false;
    if (!item.roles || item.roles.length === 0) return true;
    return checkAccess(auth.roles, item.roles);
  };

  // پروفایل و منوی کاربر
  const userMenuItems = [
    { key: '1', label: <NavLink to="/profile">پروفایل کاربری</NavLink> },
    { key: '2', label: <a onClick={logout} className="text-red-500">خروج از حساب</a> },
  ];

  // وقتی صفحه عوض میشود، زیرمنوی مربوطه باز شود
  useEffect(() => {
    const activeParent = menuConfig.find(parent => 
      parent.children?.some(child => child.path === pathname)
    );
    if (activeParent) {
      setOpenKey([activeParent.name]);
    }
  }, [pathname]);

  // تابع کمکی برای رندر آیتم‌های منو
  const renderMenuItem = (item, isChild = false) => {
    if (!checkAllowed(item)) return null;

    // اگر فرزند دارد و خودش مسیر مستقیم ندارد => SubMenu
    if (item.children && item.children.length > 0) {
      const allowedChildren = item.children.filter(checkAllowed);
      if (allowedChildren.length === 0) return null;

      return (
        <Menu.SubMenu
          key={item.name}
          title={
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </span>
              {!collapsed && <CaretDownOutlined className="text-xs text-gray-400" />}
            </span>
          }
        >
          {allowedChildren.map(child => renderMenuItem(child, true))}
        </Menu.SubMenu>
      );
    }

    // اگر مسیر مستقیم دارد => Menu.Item
    const content = (
      <NavLink to={item.path} className="flex items-center gap-3">
        {isChild && <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 ml-1"></span>}
        {!isChild && !collapsed && <span className="text-lg">{item.icon}</span>}
        {!collapsed && <span className={isChild ? "text-sm" : "font-medium"}>{item.name}</span>}
      </NavLink>
    );

    // در حالت جمع شده، تولتیپ نمایش داده شود
    if (collapsed && !isChild) {
      return (
        <Menu.Item key={item.name} className="flex justify-center">
          <Tooltip title={item.name} placement="left">
            {content}
          </Tooltip>
        </Menu.Item>
      );
    }

    return (
      <Menu.Item key={item.name} icon={collapsed && !isChild ? item.icon : null}>
        {collapsed && !isChild ? <Tooltip title={item.name} placement="left"><NavLink to={item.path} /></Tooltip> : content}
      </Menu.Item>
    );
  };

  return (
   <div className={`flex flex-col h-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-l ${isDark ? 'border-gray-800' : 'border-gray-100'} transition-colors duration-300`}>   
      {/* هدر سایدبار (دکمه جمع کردن) */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
          {collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
        </button>
      </div>

           {/* پروفایل */}
      <div className={`py-6 border-b border-gray-100 dark:border-gray-800 flex items-center transition-all ${collapsed ? 'justify-center px-2' : 'justify-start px-6'}`}>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomLeft" trigger={['click']}>
          <div className="flex flex-row items-center gap-3 cursor-pointer group w-full">
            
            {/* لوگو سمت راست */}
            <img 
              src={logo} 
              alt="Dinapart Logo" 
              style={{margin:'0 5px 0 0'}}
              className={`${collapsed ? '' : 'h-10 w-auto'} object-contain opacity-80 group-hover:opacity-100 transition-all dark:brightness-200`} 
            />
             
            {/* اسم و شرکت سمت چپ */}
            {!collapsed && (
              <div className="flex flex-col text-right overflow-hidden">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {auth?.name || "کاربر سیستم"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {auth?.company_name || 'دینا پارت'}
                </p>
              </div>
            )}
          </div>
        </Dropdown>
      </div>

      {/* منوها */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
      <Menu
  theme={isDark ? "dark" : "light"}   // <--- این خط مهم است
  mode="inline"
  inlineCollapsed={collapsed}
  openKeys={collapsed ? undefined : openKey}
  onOpenChange={(keys) => !collapsed && setOpenKey(keys)}
  className="!border-0 !bg-transparent modern-sidebar-menu"
>
          {menuConfig.map((item, index) => renderMenuItem(item))}
        </Menu>
      </div>

      {/* دکمه خروج */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={logout}
          className={`flex items-center gap-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg p-2 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogoutOutlined className="text-lg" />
          {!collapsed && <span className="font-medium">خروج از حساب</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidenav;