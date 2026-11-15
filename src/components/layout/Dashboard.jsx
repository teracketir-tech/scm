import { Card } from "antd";
import React from "react";
import { Helmet } from "react-helmet";
import { useAuthContext } from "../AuthProvider";

export const Dashboard = ({ subname, breadcrumb, children }) => {
  const { title, customBreadcrumb } = useAuthContext();
  
  return (
    <>
      <Helmet>
        <title>{`داشبورد دینا پارت | ${subname} ${title}`}</title>
      </Helmet>
      <Card
        bordered={false}
        className="modern-card tablespace mb-6 page-ui-modern"
        title={
          <div className=" justify-between gap-2 py-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {subname + " " + title}
            </span>
            <div className="hide_print text-sm text-gray-500 dark:text-gray-400">
              {customBreadcrumb ? customBreadcrumb : breadcrumb}
            </div>
          </div>
        }
      >
        {children}
      </Card>
    </>
  );
};