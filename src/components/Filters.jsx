import { Button, Col, Collapse, Form, Input, Row } from "antd";
import Title from "antd/lib/typography/Title";
import qs from "qs";
import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { getParamsObject } from "../module/util";
import AjaxSelect from "./AjaxSelect";
import AntdSelect from "./AntdSelect";
import Datepicker from "./DatePicker";
import { NumberFormat } from "./NumberFormat";
import DatePickerRang from "./DatePickerRang";

const { Panel } = Collapse;
const Filters = ({ fields, getData, hide_form = false, setParams = null }) => {
  const [form] = Form.useForm();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState(0);

  const handleSubmit = (values) => {
    setSearchParams((prevSearchParams) => {
      const newSearchParams = new URLSearchParams();
      Object.keys(values).map((key) => {
        if (values[key]) {
          if (typeof values[key] === "object") {
            if ((values[key] || []).length)
              Object.keys(values[key]).map((k) => {
                if (typeof values[key][k] === "object" && values[key][k].value) {
                  newSearchParams.append(`${key}[]`, `${values[key][k].value}|${values[key][k].label}`);
                } else newSearchParams.append(`${key}[]`, values[key][k]);
              });
            else {
              if (values[key].value) newSearchParams.append(`${key}`, `${values[key].value}|${values[key].label}`);
            }
          } else newSearchParams.set(key, values[key]);
        }
      });
      return newSearchParams.toString();
    });
  };
  const resetFilters = () => {
    setSearchParams("");
    form.resetFields();
  };
  useEffect(() => {
    let params_obj = getParamsObject(searchParams.toString(), true);
    if (setParams) setParams(qs.stringify(params_obj));
    getData(qs.stringify(params_obj));
    if (params_obj["page"]) {
      delete params_obj["page"];
    }
    let str_params = qs.stringify(params_obj);
    if (!str_params) {
      form.resetFields();
      setActive(0);
    } else {
      setActive(1);
    }
  }, [location]);
  useEffect(() => {
    const params = getParamsObject(searchParams.toString());
    form.setFieldsValue(params);
  }, [searchParams]);
  const onChange = (key) => {
    setActive(key);
  };
  const form_field = (field) => {
    return (
      <Form.Item label={field.label} name={field.name} className="mb-1" hidden={field["hidden"] ? true : false}>
        {field.type === "select" ? (
          <AntdSelect
            options={field.options}
            placeholder={field.placeholder ? field.placeholder : "انتخاب کنید"}
            mode={field.mode}
            onSearch={field?.onSearch}
          />
        ) : field.type === "text" ? (
          <Input placeholder={field.placeholder ? field.placeholder : field.label} type={field.type} />
        ) : field.type === "ajax_select" ? (
          <AjaxSelect placeholder={field.placeholder ? field.placeholder : "انتخاب کنید"} url={field.url} mode={field.mode} />
        ) : (field.type === "price" || field.type === "number" ) ? (
          <NumberFormat placeholder={field.placeholder ? field.placeholder : field.label} />
        ) : field.type === "date" ? (
          <Datepicker placeholder={field.placeholder ? field.placeholder : field.label} />
        ) : field.type === "date_rang" ? (
          <DatePickerRang placeholder={field.placeholder ? field.placeholder : field.label} />
        ) : (
          ""
        )}
      </Form.Item>
    );
  };
  return (
    <>
      {hide_form ? (
        ""
      ) : (
        <Collapse activeKey={active} onChange={onChange} className="ant-collapse ant-collapse-icon-position-start ant-collapse-ltr mb-5">
          <Panel header={<Title level={4}>فیلتر ها</Title>} key="1">
            <Form form={form} onFinish={handleSubmit} layout="vertical" className="row-col text-right">
              <Row>
                {fields.map((field) => (
                  <Col className="pr-2  mb-5" md={8} sm={24} xs={24} lg={8}>
                    {form_field(field)}
                    {field.between ? <>{form_field(field.between)}</> : ""}
                  </Col>
                ))}
                <Col className="pr-2  mb-5" md={8} sm={24} xs={24} lg={8}>
                  <Form.Item label=" " className="mb-1">
                    <Button type="primary" htmlType="submit">
                      فیلتر
                    </Button>
                    <Button htmlType="button" className="mr-2" onClick={resetFilters}>
                      خالی کردن فیلتر
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Panel>
        </Collapse>
      )}
    </>
  );
};
export default Filters;
