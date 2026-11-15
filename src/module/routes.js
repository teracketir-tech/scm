import {
  DeliveredProcedureOutlined,
  GroupOutlined,
  HomeOutlined,
  LeftOutlined,
  OrderedListOutlined,
  RightOutlined,
  SettingOutlined,
  UserOutlined,
  // آیکون‌های جدید
  FileTextOutlined,
  MessageOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { BreadCrumb } from "../components/BreadCrumb";
import Main from "../components/layout/Main";
import { SaveUser } from "../pages/users/SaveUser";
import { User } from "../pages/users/User";
import { UserView } from "../pages/users/UserView";
import ErrorPage from "./../pages/ErrorPage";
import Home from "./../pages/Home";
import SignIn from "./../pages/SignIn";
import Groups from "../pages/groups/Index";
import SaveGroup from "../pages/groups/Save";
import Deliveries from "../pages/deliveries/Index";
import SaveDelivery from "../pages/deliveries/Save";
import Warranties from "../pages/warranties/Index";
import SaveWarranties from "../pages/warranties/Save";
import SelfDeclaration from "../pages/self_declaration/Index";
import SaveSelfDeclaration from "../pages/self_declaration/Save";
import Types from "../pages/types/Index";
import SaveTypes from "../pages/types/Save";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import Sms from "../pages/sms/Index";
import SaveSms from "../pages/sms/Save";
import Profile from "../pages/Profile";
import Documents from "../pages/self_declaration/Documents";
import { SelfDeclarationView } from "../pages/self_declaration/View";
import Packings from "../pages/packings/Index";
import SavePacking from "../pages/packings/Save";
import PriceAnalysis from "../pages/self_declaration/PriceAnalysis";
import Settings from "../pages/Settings";
import PrintPriceAnalysis from "../pages/self_declaration/PrintPriceAnalysis";
import { EsalatUsers } from "../pages/esalat/EsalatUsers";
import { EsalatUserDetails } from "../pages/esalat/View";
import { GarentyList } from "../pages/esalat/Garenty";
import SaveCheque from "../pages/cheque/Save";
import Cheques from "../pages/cheque/Index";
import ViewCheque from "../pages/cheque/View";
import Units from "../pages/unit/Index";
import DeclarationOfNeeds from "../pages/declaration_of_need/Index";
import SaveDeclarationOfNeed from "../pages/declaration_of_need/Save";
import ViewDeclarationOfNeed from "../pages/declaration_of_need/View";
// ایمپورت‌های جدید برای انبار نقدی
import List from "../pages/supplier_inventory/List";
import CreateSupplieInventory from "../pages/supplier_inventory/CreateSupplieInventory";
import OrderList from "../pages/orders/OrderList";
import OrderShortages from "../pages/orders/OrderShortages";
import ProductOrderList from "../pages/orders/ProductOrderReport";
import ProductShortageReport from "../pages/orders/ProductShortageReport"; 
import ReorderPoints from "../pages/orders/ReorderPoints"; 
import MRP  from "../pages/mrp/Index";
import MrpSave  from "../pages/mrp/save";
import SupplierReturnProductList from "../pages/supplier_return_product_list/SupplierReturnProductList";
import { UserLogs } from "../pages/users/UserLogs";
import { ActiveLogins } from "../pages/users/ActiveLogins";

let routes = [
  {
    path: "/",
    element: (
      <Main>
        <Home />
      </Main>
    ),
    name: "داشبورد",
    icon: <HomeOutlined />,
    breadcrumb: <BreadCrumb />,
  },
  {
    path: "/settings",
    element: (
      <Main>
        <Settings />
      </Main>
    ),
    name: "تنظیمات",
    icon: <SettingOutlined />,
    breadcrumb: <BreadCrumb data={[{ name: "تنظیمات" }]} />,
    role: [1000],
  },
  {
    path: "*",
    element: (
      <Main>
        <ErrorPage />
      </Main>
    ),
    no_menu: true,
  },
  {
    path: "/403",
    element: (
      <Main>
        <ErrorPage status={403} />
      </Main>
    ),
    no_menu: true,
  },
  {
    path: "/404",
    element: (
      <Main>
        <ErrorPage status={404} />
      </Main>
    ),
    no_menu: true,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/users",
    name: "کاربران",
    breadcrumb: <BreadCrumb data={[{ name: "کاربران" }]} />,
    icon: <UserOutlined />,
    no_submenu: true,
    role: [400],
    children: [
      {
        index: true,
        element: (
          <Main>
            <User />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت کاربر جدید",
        element: (
          <Main>
            <SaveUser />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "کاربران", link: "/users" }, { name: "ثبت کاربر جدید" }]} />,
        role: [401],
      },
      {
        path: "update",
        name: "ویرایش کاربر",
        element: (
          <Main>
            <SaveUser />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "کاربران", link: "/users" }, { name: "ویرایش کاربر" }]} />,
        role: [402],
      },
      {
        path: "view",
        name: "جزئیات کاربر",
        element: (
          <Main>
            <UserView />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "کاربران", link: "/users" }, { name: "جزئیات کاربر" }]} />,
        role: [404],
      },
      //
      {
        path: "logs",
        name: "لاگ کاربر",
        element: (
          <Main>
            <UserLogs />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "کاربران", link: "/users" }, { name: " لاگ کاربر" }]} />,
        role: [404],
      },

      {
        path: "active-logins",
        name: " کاربران فعال",
        element: (
          <Main>
            <ActiveLogins />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "کاربران", link: "/users" }, { name: "  کاربران فعال" }]} />,
        role: [404],
      },
    ],
  },
  {
    path: "/esalat/users",
    name: "کاربران گارانتی",
    breadcrumb: <BreadCrumb data={[{ name: "کاربران گارانتی" }]} />,
    icon: <UserOutlined />,
    no_submenu: true,
    role: [1100],
    children: [
      {
        index: true,
        element: (
          <Main>
            <EsalatUsers />
          </Main>
        ),
      },
      {
        path: "view",
        name: "جزئیات کاربر",
        element: (
          <Main>
            <EsalatUserDetails />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "کاربران گارانتی", link: "/users" }, { name: "جزئیات کاربر" }]} />,
        role: [1101],
      },
    ],
  },
  {
    path: "/esalat/list",
    name: "لیست گارانتی",
    breadcrumb: <BreadCrumb data={[{ name: "لیست گارانتی" }]} />,
    icon: <UserOutlined />,
    no_submenu: true,
    role: [1103],
    element: (
      <Main>
        <GarentyList />
      </Main>
    ),
  },
  {
    path: "/groups",
    name: "گروه ها",
    breadcrumb: <BreadCrumb data={[{ name: "گروه ها" }]} />,
    icon: <GroupOutlined />,
    no_submenu: true,
    role: [100],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Groups />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت گروه جدید",
        element: (
          <Main>
            <SaveGroup />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "گروه ها", link: "/groups" }, { name: "ثبت گروه جدید" }]} />,
        role: [101],
      },
      {
        path: "update",
        name: "ویرایش گروه",
        element: (
          <Main>
            <SaveGroup />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "گروه ها", link: "/groups" }, { name: "ویرایش گروه" }]} />,
        role: [102],
      },
    ],
  },
  {
    path: "/deliveries",
    name: "محل های تحویل",
    breadcrumb: <BreadCrumb data={[{ name: "محل های تحویل" }]} />,
    icon: <DeliveredProcedureOutlined />,
    no_submenu: true,
    role: [200],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Deliveries />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت محل جدید",
        element: (
          <Main>
            <SaveDelivery />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "محل های تحویل", link: "/deliveries" }, { name: "ثبت محل جدید" }]} />,
        role: [201],
      },
      {
        path: "update",
        name: "ویرایش محل",
        element: (
          <Main>
            <SaveDelivery />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "محل های تحویل", link: "/deliveries" }, { name: "ویرایش محل" }]} />,
        role: [202],
      },
    ],
  },
  {
    path: "/warranties",
    name: "نوع گارانتی",
    breadcrumb: <BreadCrumb data={[{ name: "نوع گارانتی" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [300],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Warranties />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت نوع گارانتی جدید",
        element: (
          <Main>
            <SaveWarranties />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "نوع گارانتی", link: "/warranties" }, { name: "ثبت نوع گارانتی جدید" }]} />,
        role: [301],
      },
      {
        path: "update",
        name: "ویرایش نوع گارانتی",
        element: (
          <Main>
            <SaveWarranties />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "نوع گارانتی", link: "/warranties" }, { name: "ویرایش نوع گارانتی" }]} />,
        role: [302],
      },
    ],
  },
  {
    path: "/documents",
    name: "پرونده ها",
    breadcrumb: <BreadCrumb data={[{ name: "پرونده ها" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [800, 801],
    element: (
      <Main>
        <Documents />
      </Main>
    ),
  },
  {
    path: "/self-declarations",
    name: " خود اظهاری",
    breadcrumb: <BreadCrumb data={[{ name: " خود اظهاری" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [500, 506],
    element: (
      <Main>
        <SelfDeclaration />
      </Main>
    ),
  },
  {
    path: "/self-declarations/view",
    name: "جزئیات خود اظهاری",
    breadcrumb: <BreadCrumb data={[{ name: " خود اظهاری", link: "/self-declarations" }, { name: "جزئیات خود اظهاری" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    no_menu: true,
    role: [507],
    element: (
      <Main>
        <SelfDeclarationView />
      </Main>
    ),
  },
  {
    path: "/self-declarations/price-analysis",
    name: "آنالیز قیمت",
    breadcrumb: <BreadCrumb data={[{ name: " خود اظهاری", link: "/self-declarations" }, { name: "آنالیز قیمت" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    no_menu: true,
    role: [515],
    element: (
      <Main>
        <PriceAnalysis />
      </Main>
    ),
  },
  {
    path: "/self-declarations/print-price-analysis",
    name: "پرینت آنالیز قیمت",
    breadcrumb: <BreadCrumb data={[{ name: " خود اظهاری", link: "/self-declarations" }, { name: "آنالیز قیمت" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    no_menu: true,
    role: [515],
    element: <PrintPriceAnalysis />,
  },

  {
    path: "/types",
    name: "نوع ماشین",
    breadcrumb: <BreadCrumb data={[{ name: "نوع ماشین" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [600],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Types />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت نوع ماشین جدید",
        element: (
          <Main>
            <SaveTypes />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "نوع ماشین", link: "/types" }, { name: "ثبت نوع ماشین جدید" }]} />,
        role: [601],
      },
      {
        path: "update",
        name: "ویرایش نوع ماشین",
        element: (
          <Main>
            <SaveTypes />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "نوع ماشین", link: "/types" }, { name: "ویرایش نوع ماشین" }]} />,
        role: [602],
      },
    ],
  },
  {
    path: "/sms",
    name: "شارژ اس ام اس",
    breadcrumb: <BreadCrumb data={[{ name: "شارژ اس ام اس" }]} />,
    icon: <LeftOutlined />,
    no_submenu: true,
    role: [700],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Sms />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت اس ام اس جدید",
        element: (
          <Main>
            <SaveSms />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "شارژ اس ام اس", link: "/sms" }, { name: "ثبت اس ام اس جدید" }]} />,
        role: [701],
      },
      {
        path: "update",
        name: "ویرایش اس ام اس",
        element: (
          <Main>
            <SaveSms />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "شارژ اس ام اس", link: "/sms" }, { name: "ویرایش اس ام اس" }]} />,
        role: [702],
      },
    ],
  },
  {
    path: "/profile",
    name: "پروفایل",
    breadcrumb: <BreadCrumb data={[{ name: "پروفایل" }]} />,
    icon: <LeftOutlined />,
    no_submenu: true,
    no_menu: true,
    element: (
      <Main>
        <Profile />
      </Main>
    ),
  },
  {
    path: "/packings",
    name: "نحوه بسته بندی",
    breadcrumb: <BreadCrumb data={[{ name: "نحوه بسته بندی" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [900],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Packings />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت نحوه بسته بندی جدید",
        element: (
          <Main>
            <SavePacking />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "نحوه بسته بندی", link: "/packings" }, { name: "ثبت نحوه بسته بندی جدید" }]} />,
        role: [901],
      },
      {
        path: "update",
        name: "ویرایش نحوه بسته بندی",
        element: (
          <Main>
            <SavePacking />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "نحوه بسته بندی", link: "/packings" }, { name: "ویرایش نحوه بسته بندی" }]} />,
        role: [902],
      },
    ],
  },
  {
    path: "/cheques",
    name: "لیست چک های تامین کننده",
    breadcrumb: <BreadCrumb data={[{ name: "لیست چک های تامین کننده" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1200, 1201, 1202, 1203, 1204, 1205],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Cheques />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت چک جدید",
        element: (
          <Main>
            <SaveCheque />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "لیست چک های تامین کننده", link: "/cheques" }, { name: "ثبت چک جدید" }]} />,
        role: [1201],
      },
      {
        path: "update",
        name: "ویرایش چک",
        element: (
          <Main>
            <SaveCheque />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "لیست چک های تامین کننده", link: "/cheques" }, { name: "ویرایش چک" }]} />,
        role: [1202],
      },
      {
        path: "view",
        name: "مشاهده چک",
        element: (
          <Main>
            <ViewCheque />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "لیست چک های تامین کننده", link: "/cheques" }, { name: "مشاهده چک" }]} />,
        role: [],
      },
    ],
  },
  {
    path: "/units",
    name: "واحد",
    breadcrumb: <BreadCrumb data={[{ name: "واحد" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1300, 1301, 1302, 1303],
    children: [
      {
        index: true,
        element: (
          <Main>
            <Units />
          </Main>
        ),
      },
    ],
  },
   {
    path: "/supplier-inventory/list",
    name: "لیست محصولات (نقدی و اعتباری)",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/supplier-inventory/list" }, { name: "لیست محصولات" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1600, 1602, 1603],
    element: (
      <Main>
        <List />
      </Main>
    ),
  },
  {
    path: "/supplier-inventory/create",
    name: "محصول جدید (نقدی و اعتباری)",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/supplier-inventory/list" }, { name: "محصول جدید" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1601],
    element: (
      <Main>
        <CreateSupplieInventory />
      </Main>
    ),
  },

  
  {
    path: "/supplier-inventory/update",
    name: "ویرایش محصول",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/supplier-inventory/list" }, { name: "ویرایش محصول" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    no_menu: true, // این منو در سایدبار نمایش داده نشود
    role: [1602],
    element: (
      <Main>
        <CreateSupplieInventory />
      </Main>
    ),
  },
  {
    path: "/mrp",
    name: "MRP",
    breadcrumb: <BreadCrumb data={[{ name: " MRP ", link: "/mrp"}]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1500, 1501, 1502],
    children: [
      {
        index: true,
         
        element: (
          <Main>
            <MRP />
          </Main>
        ),
      }
      ,   {
        index: false,
         path: "save",
        element: (
          <Main>
            <MrpSave />
          </Main>
        ),
      }],
    
  },
     
   {
    path: "/orders/list",
    name: "لیست سفارشات (نقدی و اعتباری)",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/orders/list" }, { name: "لیست سفارشات" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1700],
    element: (
      <Main>
        <OrderList />
      </Main>
    ),
  },
     {
    path: "/orders/list-Shortages",
    name: "لیست کسری ها (نقدی و اعتباری)",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/orders/list-Shortages" }, { name: "لیست کسری ها" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1701],
    element: (
      <Main>
        <OrderShortages />
      </Main>
    ),
  },
   {
    path: "/orders/product-Shortages",
    name: "لیست کسری محصولات (نقدی و اعتباری)",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/orders/product-Shortages" }, { name: "لیست کسری محصولات" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1702],
    element: (
      <Main>
        <ProductShortageReport />
      </Main>
    ),
  },
  {
    path: "/orders/reorder-point",
    name: "نقطه سفارش ها",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/orders/list-Shortages" }, { name: "نقطه سفارش ها" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1703],
    element: (
      <Main>
        <ReorderPoints />
      </Main>
    ),
  },
 /* {
    path: "/orders/products",
    name: "لیست سفارشات کابران و محصولات",
    breadcrumb: <BreadCrumb data={[{ name: "انبار نقدی تامین کنندگان", link: "/orders/list" }, { name: "لیست سفارشات" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: false,
    role: [1704], 
    element: (
      <Main>
        <ProductOrderList />
      </Main>
    ),
  },*/
    {
    path: "/return-product/list",
    name: "کالای برگشتی",    
    breadcrumb: <BreadCrumb data={[ { name: "لیست کالای برگشتی" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1800, 1801],
    element: (
      <Main>
        <SupplierReturnProductList />
      </Main>
    ),
  },
   
  {
    path: "/declaration-of-need",
    name: "اعلام نیاز",
    breadcrumb: <BreadCrumb data={[{ name: "اعلام نیاز" }]} />,
    icon: <OrderedListOutlined />,
    no_submenu: true,
    role: [1400, 1401, 1402, 1403, 1404, 1405, 1406],
    children: [
      {
        index: true,
        element: (
          <Main>
            <DeclarationOfNeeds />
          </Main>
        ),
      },
      {
        path: "create",
        name: "ثبت اعلام نیاز جدید",
        element: (
          <Main>
            <SaveDeclarationOfNeed />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "اعلام نیاز", link: "/declaration-of-need" }, { name: "ثبت اعلام نیاز جدید" }]} />,
        role: [1401],
      },
      {
        path: "update",
        name: "ویرایش اعلام نیاز",
        element: (
          <Main>
            <SaveDeclarationOfNeed />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "اعلام نیاز", link: "/declaration-of-need" }, { name: "ویرایش اعلام نیاز" }]} />,
        role: [1402],
      },
      {
        path: "view",
        name: "مشاهده اعلام نیاز",
        element: (
          <Main>
            <ViewDeclarationOfNeed />
          </Main>
        ),
        breadcrumb: <BreadCrumb data={[{ name: "اعلام نیاز", link: "/declaration-of-need" }, { name: "مشاهده اعلام نیاز" }]} />,
        role: [],
      },
    ],
  },
];

export default routes;