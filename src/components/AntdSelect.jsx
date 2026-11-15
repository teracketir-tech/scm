import React from "react";
import { Select } from "antd";
import { CloseOutlined } from "@ant-design/icons";

export default function AntdSelect(props) {
  return (
    <Select
      className="ant-select-dropdown-rtl"
      {...props}
      showSearch
      allowClear
      style={{
        width: "100%",
        fontFamily: "PeydaWeb",
      }}
      dropdownStyle={{
        direction: "rtl",
        textAlign: "right",
        fontFamily: "PeydaWeb",
      }}
      size="large"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label ?? "").includes(input)}
      filterSort={(optionA, optionB) => (props?.notSort ? false : (optionA?.label ?? "").toLowerCase().localeCompare((optionB?.label ?? "").toLowerCase()))}
      clearIcon={<CloseOutlined className="danger" />}
    />
  );
}
