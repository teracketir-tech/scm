import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SettingOutlined,
  ToolOutlined,
  RetweetOutlined,
  FileDoneOutlined,
  ContainerOutlined,
} from "@ant-design/icons";

// ساختار درختی برای سایدبار
// name: نام نمایشی
// icon: آیکون
// path: مسیر (اگر لینک مستقیم باشد)
// children: زیرمنوها
// roles: آرایه نقش‌هایی که دسترسی دارند (اگر خالی باشد یعنی همه)
// no_menu: اگر true باشد در سایدبار نمایش داده نمی‌شود

export const menuConfig = [
  {
    name: "داشبورد",
    icon: <HomeOutlined />,
    path: "/",
  },
  {
    name: "کاربران و دسترسی",
    icon: <UserOutlined />,
    children: [
      { name: "کاربران", path: "/users", roles: [400] },
      { name: "کاربران گارانتی", path: "/esalat/users", roles: [1100] },
      { name: "گروه ها", path: "/groups", roles: [100] },
      { name: "پروفایل", path: "/profile" }, // اگر میخوای تو منو باشه
    ],
  },
  {
    name: "اطلاعات پایه",
    icon: <AppstoreOutlined />,
    children: [
      { name: "محل های تحویل", path: "/deliveries", roles: [200] },
      { name: "نوع گارانتی", path: "/warranties", roles: [300] },
      { name: "نوع ماشین", path: "/types", roles: [600] },
      { name: "واحد", path: "/units", roles: [1300] },
      { name: "نحوه بسته بندی", path: "/packings", roles: [900] },
    ],
  },
  {
    name: "انبار و محصولات",
    icon: <ContainerOutlined />,
    children: [
      { name: "لیست محصولات", path: "/supplier-inventory/list", roles: [1600] },
      { name: "محصول جدید", path: "/supplier-inventory/create", roles: [1601] },
      { name: "MRP", path: "/mrp", roles: [1500] },
      { name: "کالای برگشتی", path: "/return-product/list", roles: [1800] },
    ],
  },
  {
    name: "سفارشات و کسری‌ها",
    icon: <ShoppingCartOutlined />,
    children: [
       { name: "لیست کسری ها", path: "/orders/list-Shortages", roles: [1701] },
      { name: "کسری محصولات", path: "/orders/product-Shortages", roles: [1702] },
      { name: "نقطه سفارش ها", path: "/orders/reorder-point", roles: [1703] },
    ],
  },
  {
    name: "خود اظهاری و پرونده‌ها",
    icon: <FileTextOutlined />,
    children: [
      { name: "پرونده ها", path: "/documents", roles: [800] },
      { name: "خود اظهاری", path: "/self-declarations", roles: [500] },
      { name: "اعلام نیاز", path: "/declaration-of-need", roles: [1400] },
    ],
  },
  {
    name: "مالی و گارانتی",
    icon: <FileDoneOutlined />,
    children: [
      { name: "لیست گارانتی", path: "/esalat/list", roles: [1103] },
      { name: "چک های تامین کننده", path: "/cheques", roles: [1200] },
    ],
  },
  {
    name: "ابزارها و تنظیمات",
    icon: <ToolOutlined />,
    children: [
      { name: "شارژ اس ام اس", path: "/sms", roles: [700] },
      { name: "تنظیمات", path: "/settings", roles: [1000] },
    ],
  },
];