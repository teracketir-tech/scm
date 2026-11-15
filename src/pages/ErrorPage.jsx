import { Typography } from "antd";
import React from "react";

export default function ErrorPage({ status = 403 }) {
  const { Title, Text } = Typography;
  return (
    <div className="" id="error-page">
      <p className=" text-center p-4">
        {status == 403 ? (
          <>
            <Title level={1}>Access denied (#403)</Title>
            <Title level={4}>شما به این بخش دسترسی ندارید</Title>
          </>
        ) : (
          <>
            <Title level={1}>Not Found (#404)</Title>
            <Title level={4}>صفحه‌ای یافت نشد.</Title>
          </>
        )}
      </p>
    </div>
  );
}
