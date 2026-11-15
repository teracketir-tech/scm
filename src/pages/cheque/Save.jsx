import { Button, Col, Form, Input, Row, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import { getParams, numberFormat, request, rules } from "../../module/util";
import AntdSelect from "../../components/AntdSelect";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import Datepicker from "../../components/DatePicker";
import { NumberFormat } from "../../components/NumberFormat";

const { Item, useForm } = Form;

export default function SaveCheque() {
  const [form] = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [chequesList, setChequesList] = useState([{ bank_id: null, number: "", price: "" }]);

  useEffect(() => {
    getData();
    getSuppliers();
    getBanks();
  }, [location]);

  const getData = async () => {
    const id = await getParams(location.search, "id");

    if (id) {
      const res = await request(`/cheque/view?id=${id}`, "GET");

      if (res?.success) {
        const data = res.data;

        form.setFieldsValue({ supplier_id: data.supplier_id, date: data.date });
        setChequesList(JSON.parse(data.cheques_list));
        getSuppliers(data.supplier_id);
      }
    }
  };

  const getSuppliers = async (query = "") => {
    const res = await request(`/users/get-suppliers?query=${query}`, "GET");

    if (res?.success) setSuppliers(res.data.map((s) => ({ label: `${s.supplier_code} - ${s.company_name}`, value: s.id })));
  };

  const getBanks = async (name = "") => {
    const res = await request(`/bank?name=${name}`, "GET");

    if (res?.success) setBanks(res.data.map((b) => ({ label: b.name, value: b.id })));
  };

  const handleAddCheque = () => {
    setChequesList((prev) => [...prev, { bank_id: null, number: "", price: "" }]);
  };

  const handleSubmit = async (values) => {
    const data = { ...values, cheques_list: chequesList };

    try {
      const create = location.pathname === "/cheques/create";
      const method = create ? "POST" : "PUT";
      const id = await getParams(location.search, "id");
      const url = create ? "/cheque/create" : `/cheque/update?id=${id}`;

      let res = await request(url, method, data);

      if (res?.success) {
        navigate(`/cheques`);
      }
    } catch (error) {}
  };

  return (
    <div className="pa-3" style={{ minHeight: "80vh" }}>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row>
          <Col className="pr-2" md={7} sm={24} xs={24} lg={7}>
            <Item name="supplier_id" label="تامین کننده">
              <AntdSelect
                options={suppliers}
                placeholder="انتخاب کنید ..."
                onClear={getSuppliers}
                onSearch={(e) => {
                  if (e.length > 1) getSuppliers(e);
                }}
              />
            </Item>
          </Col>
          <Col className="pr-2" md={7} sm={24} xs={24} lg={7}>
            <Item label="تاریخ" name="date">
              <Datepicker type="text" placeholder="تاریخ" />
            </Item>
          </Col>
        </Row>
        <Row>
          <div className="d-flex align-items-center gap-5 my-3 pr-3">
            <p className="m-0 font-bold">لیست چکها</p>
            <Button icon={<PlusCircleOutlined />} onClick={handleAddCheque}>
              افزودن چک جدید
            </Button>
          </div>
        </Row>
        <Row className="">
          {chequesList.map((cheque, index) => (
            <Row key={index} className="w-100">
              <Col className="pr-2" md={7} sm={24} xs={24} lg={7}>
                <Item label="بانک">
                  <AntdSelect
                    options={banks}
                    value={cheque.bank_id}
                    placeholder="انتخاب کنید ..."
                    onClear={getBanks}
                    onChange={(bank_id) => setChequesList((prev) => prev.map((p, i) => (i === index ? { ...p, bank_id } : p)))}
                    onSearch={(e) => {
                      if (e.length > 1) getBanks(e);
                    }}
                  />
                </Item>
              </Col>
              <Col className="pr-2" md={7} sm={24} xs={24} lg={7}>
                <Item label="شماره چک">
                  <Input
                    type="text"
                    placeholder="شماره چک"
                    value={cheque.number}
                    onChange={(e) => setChequesList((prev) => prev.map((p, i) => (i === index ? { ...p, number: e.target.value } : p)))}
                  />
                </Item>
              </Col>
              <Col className="pr-2" md={7} sm={24} xs={24} lg={7}>
                <Item label="مبلغ">
                  <NumberFormat
                    placeholder="مبلغ"
                    value={cheque.price}
                    onChange={(price) => setChequesList((prev) => prev.map((p, i) => (i === index ? { ...p, price } : p)))}
                  />
                </Item>
              </Col>

              <Col className="pr-2" md={3} sm={24} xs={24} lg={3}>
                <div className="w-100 d-flex align-items-start justify-content-end" style={{ marginTop: "1.8rem" }}>
                  <Button
                    icon={<DeleteOutlined />}
                    style={{ backgroundColor: "red", color: "white" }}
                    onClick={() => setChequesList((prev) => prev.filter((p, i) => i !== index))}
                  >
                    حذف
                  </Button>
                </div>
              </Col>
            </Row>
          ))}
        </Row>
        <Row>
          <Col className="pr-2" md={7} sm={24} xs={24} lg={7}></Col>
          <Col className="text-center" md={7} sm={24} xs={24} lg={7}>
            <Button type="primary" htmlType="submit" size="large" style={{ width: "75%" }}>
              ذخیره
            </Button>
          </Col>
          <Col className="pr-2" md={7} sm={24} xs={24} lg={7}>
            <div className="d-flex justify-content-start gap-2 font-bold">
              <span>جمع کل</span>
              <span>:</span>
              <span>{numberFormat(chequesList.reduce((acc, { price }) => acc + price, 0))}</span>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
