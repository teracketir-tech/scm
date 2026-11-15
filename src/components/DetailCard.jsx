import React from "react";
import { Tag } from "antd";

export const DetailCard = ({ title, icon, fields, className = "" }) => {
  return (
    <div className={`modern-form-card rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-300">
              {icon}
            </div>
          )}
          <h3 className="text-md font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          {fields.map((field, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-3 border-b border-gray-50 dark:border-gray-800/60 ${
                field.fullWidth ? "md:col-span-2" : ""
              }`}
            >
              <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                {field.label}
              </span>
              
              <div className="text-sm font-semibold text-gray-900 dark:text-white sm:text-left">
                {field.isStatus ? (
                  <Tag 
                    color={field.statusValue > 0 ? "green" : "red"} 
                    className="!rounded-full !px-3 !py-0.5 !text-xs !font-medium !m-0"
                  >
                    {field.value || "-"}
                  </Tag>
                ) : (
                  <span 
                    isfarsi={field.isFarsi ? "true" : undefined}
                    className={`${field.ltr ? "ltr inline-block" : ""} break-words`}
                  >
                    {field.value || "-"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};