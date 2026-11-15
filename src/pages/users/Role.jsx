import { Table } from "antd";
import React, { useEffect, useState } from "react";

const Role = ({ selectedValue, setSelectedValue, roles }) => {
  const [data, setData] = useState([]);
  const columns = [
    {
      title: "عنوان",
      dataIndex: "name",
      key: "name",
    },
  ];
  // console.log(roles);
  // useEffect(() => {
  //   let newData = [];
  //   roles.map((item, k) => {
  //     newData.push({
  //       key: item["access"],
  //       name: item["name"],
  //       children: item["children"],
  //     });
  //   });
  //   setData(newData);
  // }, [roles]);
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      let id = [];
      for (const iterator of selectedRows) {
        if (iterator["id"]) id.push(iterator["id"]);
      }
      setSelectedValue(id);
    },
    selectedRowKeys: selectedValue,
  };
  const [checkStrictly, setCheckStrictly] = useState(false);
  return (
    <div className="role__table mb-5">
      <h4 className="text-right">دسترسی ها</h4>
      <Table
        columns={columns}
        rowSelection={{
          ...rowSelection,
          checkStrictly,
        }}
        pagination={false}
        dataSource={roles}
        className="ant-table-wrapper ant-table-wrapper-rtl"
        rowClassName="text-right"
      />
    </div>
  );
};
export default Role;
