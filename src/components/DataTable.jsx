import { Table } from "antd";

export const DataTable = ({ columns, dataSource, loading, pagination = false, ...props }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        className="modern-table ant-border-space"
        scroll={{ x: "max-content" }} // برای ریسپانسیو بودن در موبایل
        {...props}
      />
    </div>
  );
};