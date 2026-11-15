
import { ConfigProvider, Drawer, Empty, Layout, theme } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import "antd-css-utilities/utility.min.css";
import { useEffect, useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import routes from "../../module/routes";
import { AuthProvider } from "../AuthProvider";
import { Dashboard } from "./Dashboard";
import Footer from "./Footer";
import Header from "./Header";
import Sidenav from "./Sidenav";
import faIR from "antd/locale/fa_IR";
const { Header: AntHeader, Content, Sider } = Layout;

function Main({ children }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState("left");
  const [sidenavColor, setSidenavColor] = useState("#1890ff");
  const [sidenavType, setSidenavType] = useState("#1890ff");
  const [fixed, setFixed] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState("");
  const [subname, setSubname] = useState("");

  const openDrawer = () => setVisible(!visible);
  const handleSidenavType = (type) => setSidenavType(type);
  const handleSidenavColor = (color) => setSidenavColor(color);
  const handleFixedNavbar = (type) => setFixed(type);
  let location = useLocation();
  let { pathname } = useLocation();
  pathname = pathname.replace("/", "");

// داخل کامپوننت Main (بالای return):
const [collapsed, setCollapsed] = useState(false);
const [isDark, setIsDark] = useState(() => {
  // خواندن از localStorage یا تنظیمات سیستم
  return localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
});

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}, [isDark]);
  useEffect(() => {
    routes.map((item) => {
      if (pathname == item.path.replace("/", "")) {
        if (item.breadcrumb) setBreadcrumb(item.breadcrumb);
        if (item.name) setSubname(item.name);
      } else if (item["children"]) {
        item["children"].map((child) => {
          let path = item.path.replace("/", "") + "/" + child.path;
          if (item.custom_children) {
            path = child.path.replace("/", "");
          }
          if (pathname == path) {
            if (child.breadcrumb) setBreadcrumb(child.breadcrumb);
            if (child.name) setSubname(child.name);
          } else if (child["children"]) {
            child["children"].map((child2) => {
              if (pathname == path + "/" + child2.path) {
                if (child2.breadcrumb) setBreadcrumb(child2.breadcrumb);
                if (child2.name) setSubname(child2.name);
              }
            });
          }
        });
      }
    });
    setVisible(false);
  }, [location]);
    return (
    <AuthProvider>
      <ConfigProvider
        direction="rtl"
        renderEmpty={() => <Empty description="موردی یافت نشد" />}
        locale={faIR}
      theme={{
     algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#465fff",
      borderRadius: 8,
      fontFamily: "Vazirmatn, Tahoma, sans-serif",
      controlHeight: 40, // ارتفاع استاندارد فیلدها
    },
    components: {
      Input: {
        paddingBlock: 8,
      },
      Select: {
        controlHeight: 40,
      },
    },
        }}
        form={{ scrollToFirstError: true }}
        input={{ autoComplete: "new-password" }}
      >
        <Layout className="min-h-screen !bg-gray-50 dark:!bg-gray-950">
          
          {/* دسکتاپ سایدبار */}
          <div className="sidebar-desktop-wrapper">
  <Sider
    trigger={null}
    collapsible
    collapsed={collapsed}
    width={260}
    collapsedWidth={80}
    theme={isDark ? "dark" : "light"}
className="!bg-white dark:!bg-gray-900 border-l border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300"
    style={{
      position: "fixed",
      right: 0,
      top: 0,
      height: "100vh",
      overflow: "hidden",
      zIndex: 40,
    }}
  >
<Sidenav collapsed={collapsed} setCollapsed={setCollapsed} isDark={isDark} />
  </Sider>
</div>

{/* موبایل سایدبار (Drawer) */}
<Drawer
  title={false}
  placement="right"
  closable={false}
  onClose={() => setVisible(false)}
  open={visible}
  width={260}
  styles={{ body: { padding: 0 } }}
  className="lg:hidden"
>
  <Sidenav collapsed={false} setCollapsed={() => setVisible(false)} isDark={isDark} />
</Drawer>

          {/* محتوای اصلی */}
          <Layout 
            className={`!bg-gray-50 dark:!bg-gray-950 transition-all duration-300 ${collapsed ? 'lg:!mr-[80px]' : 'lg:!mr-[260px]'}`}
          >
            <AntHeader className="!bg-white dark:!bg-gray-900 !px-4 md:!px-6 !h-16 flex items-center justify-between shadow-sm sticky top-0 z-30 transition-colors duration-300">
              <div className="flex items-center gap-4">
                 {/* دکمه سایدبار برای موبایل */}
                 <button onClick={openDrawer} className="lg:hidden text-gray-500 dark:text-gray-400">
                    <MenuUnfoldOutlined className="text-xl" />
                 </button>
                



<Header
                    onPress={openDrawer}
                    name={pathname}
                     breadcrumb={breadcrumb} 
                    subName={subname}
                    handleSidenavColor={handleSidenavColor}
                    handleSidenavType={handleSidenavType}
                    handleFixedNavbar={handleFixedNavbar} /> {/* پراپ‌های هدر خودت رو اینجا بذار */}
              </div>
              {/* دکمه تغییر تم (فعلا دستی) */}
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                {isDark ? "☀️" : "🌙"}
              </button>
            </AntHeader>
            
            <Content className="!p-4 md:!p-6">
              <Dashboard subname={subname} breadcrumb={breadcrumb}>
                {children}
              </Dashboard>
            </Content>
            <Footer />
          </Layout>
        </Layout>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default Main;

                   