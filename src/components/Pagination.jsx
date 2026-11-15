import { createBrowserHistory } from "@remix-run/router";
import { Pagination as Pages } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import qs from "qs";
const Pagination = ({ all, getData, no_url = false }) => {
  const [page, setPage] = useState();
  const location = useLocation();
  const history = createBrowserHistory();
  const [searchParams, setSearchParams] = useSearchParams();

  const onChange = (p) => {
    setPage(p);
    if (no_url && getData) getData(`page=${p}`);
    else
      setSearchParams((prevSearchParams) => {
        const newSearchParams = new URLSearchParams(prevSearchParams);
        newSearchParams.set("page", p);
        return newSearchParams.toString();
      });
  };
  useEffect(() => {
    let params_obj = qs.parse(location.search.replace("?", ""));
    if (params_obj["page"]) setPage(params_obj["page"]);
    else setPage(1);
  }, [location]);
  return (
    <Pages
      // style={{ direction: "ltr" }}
      className="text-center ma-4  ant-pagination-ltr"
      hideOnSinglePage
      pageSize={1}
      total={all}
      showSizeChanger={false}
      onChange={onChange}
      responsive
      current={parseInt(page)}
    />
  );
};
export default Pagination;
