import { Layout } from "antd";

function Footer() {
  const { Footer: AntFooter } = Layout;

  return (
    <AntFooter
      className="!bg-transparent !p-4 md:!p-6 !text-center text-sm text-gray-500 dark:text-gray-400"
      style={{ marginTop: "auto" }}
    >
      <div isfarsi="true" className="flex flex-col md:flex-row items-center justify-between gap-2">
        <span>
          © 1405 دینا پارت. تمامی حقوق محفوظ است.
        </span>
        <span className="text-xs">
          نسخه {import.meta.env.VITE_VERSION || "1.0.26"}
        </span>
      </div>
    </AntFooter>
  );
}

export default Footer;