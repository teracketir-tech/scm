import { useAuthContext } from "../components/AuthProvider";
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  DatabaseOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ContainerOutlined,
  FileTextOutlined,
  ToolOutlined,
  TeamOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

// داده‌های آماری
const stats = [
  {
    title: "تعداد محصولات",
    value: "به زودی",
    icon: <AppstoreOutlined />,
    color: "from-blue-500 to-indigo-600",
    bgIcon: "bg-blue-100 dark:bg-blue-900/30",
    textIcon: "text-blue-600 dark:text-blue-400",
    path: "/supplier-inventory/list",
  },
  {
    title: "تعداد سفارشات کسری",
    value: "به زودی",
    icon: <ShoppingCartOutlined />,
    color: "from-rose-500 to-red-600",
    bgIcon: "bg-rose-100 dark:bg-rose-900/30",
    textIcon: "text-rose-600 dark:text-rose-400",
    path: "/orders/list-Shortages",
  },
  {
    title: "تعداد اقلام کسری",
    value: "به زودی",
    icon: <InboxOutlined />,
    color: "from-amber-500 to-orange-600",
    bgIcon: "bg-amber-100 dark:bg-amber-900/30",
    textIcon: "text-amber-600 dark:text-amber-400",
    path: "/orders/product-Shortages",
  },
  {
    title: "مجموع کسری (عدد)",
    value: "به زودی",
    icon: <DatabaseOutlined />,
    color: "from-emerald-500 to-teal-600",
    bgIcon: "bg-emerald-100 dark:bg-emerald-900/30",
    textIcon: "text-emerald-600 dark:text-emerald-400",
    path: "/orders/list-Shortages",
  },
];

// اقدامات سریع (دقیقاً گروه‌بندی منو)
const quickActions = [
  { 
    title: "کاربران و دسترسی", 
    icon: <UserOutlined />, 
    path: "/users", 
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" 
  },
  { 
    title: "اطلاعات پایه", 
    icon: <ContainerOutlined />, 
    path: "/deliveries", 
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" 
  },
  { 
    title: "انبار و محصولات", 
    icon: <DatabaseOutlined />, 
    path: "/supplier-inventory/list", 
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" 
  },
  { 
    title: "سفارشات و کسری‌ها", 
    icon: <ShoppingCartOutlined />, 
    path: "/orders/reorder-point",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400" 
  },
  { 
    title: "خود اظهاری و پرونده‌ها", 
    icon: <FileTextOutlined />, 
    path: "/self-declarations", 
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400" 
  },
  { 
    title: "مالی و گارانتی", 
    icon: <FileDoneOutlined />, 
    path: "/cheques", 
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" 
  },
  { 
    title: "ابزارها و تنظیمات", 
    icon: <ToolOutlined />, 
    path: "/settings", 
    color: "text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400" 
  },
];

function Home() {
  const { auth } = useAuthContext();

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* بنر خوش‌آمدگویی */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 p-6 md:p-10 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              سلام، {auth?.company_name || "کاربر عزیز"} 👋
            </h1>
            <p className="text-brand-100 text-sm md:text-base max-w-lg">
              به داشبورد مدیریت دینا پارت خوش آمدید. وضعیت کلی سیستم را از اینجا مشاهده کنید.
            </p>
          </div>
          <Link 
            to="/orders/list" 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            مشاهده سفارشات
            <ArrowLeftOutlined />
          </Link>
        </div>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.path}
            className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>
            
            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.bgIcon} ${stat.textIcon} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {stat.value}
                {stat.value === "به زودی" && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                  </span>
                )}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* بخش پایین: نمودار + اقدامات سریع */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* نمودار (Placeholder) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">آمار کلی</h2>
              <p className="text-xs text-gray-400 mt-1">نمودار عملکرد سیستم</p>
            </div>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">به زودی</span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-4">
              <AppstoreOutlined className="text-2xl text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">نمودار در حال آماده‌سازی است</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">بزودی نمودار سیستم  اینجا نمایش داده می‌شود</p>
          </div>
        </div>

        {/* اقدامات سریع (گروه‌های منو) */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">دسترسی سریع</h2>
          <p className="text-xs text-gray-400 mb-4">ورود به بخش‌های اصلی سیستم</p>
          
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${action.color} group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                    {action.title}
                  </span>
                </div>
                <ArrowLeftOutlined className="text-[10px] text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;