import { CloseOutlined } from "@ant-design/icons";
import { Select, Spin } from "antd";
import debounce from "lodash/debounce";
import React, { useMemo, useRef, useState } from "react";
import { request } from "../module/util";

const AjaxSelect = ({ url, placeholder, onChange, value, mode, setId, params, fullUrl = false }) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const select_text = "برای جستجو سه کلمه وارد کنید";
  const [text, setText] = useState(select_text);
  const fetchRef = useRef(0);
  async function fetchOptions(search, url) {
    if (search.length >= 3) {
      let _url = fullUrl ? `${url}?s=${search}` : `/${url}/s_${search + (params ? "?" + params : "")}`;
      let res = await request(_url, "GET", null, false, fullUrl);
      if (res["data"]) {
        return res["data"];
      }
      return [];
    }
  }
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value, url).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
        if (newOptions) {
          if (newOptions.length) setText(select_text);
          else setText("موردی یافت نشد");
        }
      });
    };
    return debounce(loadOptions, 100);
  }, [fetchOptions, 100]);
  return (
    <Select
      showSearch
      allowClear
      labelInValue
      size="large"
      filterOption={false}
      onChange={(e, option) => {
        if (mode) {
          let data = [];
          let data_id = [];
          e.map((item) => {
            data.push({ label: item.label, value: item.value });
            data_id.push(item.value);
          });
          onChange(data);
          setId(data_id);
        } else {
          // onChange(e ? { label: e.label, value: e.value } : null);
          onChange(e ? option : null);
          if (typeof setId === "function") {
            setId(e.value);
          }
        }
        // onChange(e ? { label: e.label, value: e.value } : null);
        setOptions([]);
      }}
      onDropdownVisibleChange={(e) => {
        setText(select_text);
      }}
      value={value}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : text}
      placeholder={placeholder}
      options={options}
      clearIcon={<CloseOutlined className="danger" />}
      style={{
        direction: "ltr",
        textAlign: "right",
        width: "100%",
        fontFamily: "PeydaWeb",
      }}
      dropdownStyle={{
        direction: "ltr",
        textAlign: "right",
        fontFamily: "PeydaWeb",
      }}
      mode={mode}
    />
  );
};
export default AjaxSelect;
