import { Button, Divider, Form, Input, Modal, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../components/AuthProvider";
import Filters from "../../components/Filters";
import Pagination from "../../components/Pagination";
import { checkAccess, confirm, getParams, numberFormat, request } from "../../module/util";

export default function Units() {
  const columns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "نام",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "عملیات",
      dataIndex: "action",
      key: "action",
    },
  ];

  const [form] = Form.useForm();
  const { auth } = useAuthContext();
  const [model, setModel] = useState([]);
  const [data, setData] = useState([]);
  const [pages, setPages] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState({});
  const [showModal, setShowModal] = useState(false);

  const getData = (params = "") => {
    request(`/unit?${params}`).then((res) => {
      if (res?.success) {
        setModel(res.data);
        setPages(res.pages);
      }
    });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleEdit = (item) => {
    form.setFieldsValue({ name: item.name });
    setSelectedUnit(item);
    setShowModal(true);
  };

  useEffect(() => {
    let newData = [];

    model.map((item, k) => {
      newData.push({
        key: ++k,
        id: <span>{item.id}</span>,
        name: <span>{item.name}</span>,
        action: (
          <div>
            {checkAccess(auth.roles, [1302]) ? (
              <Tooltip placement="top" title={"ویرایش"} color="#1890ff">
                <button onClick={() => handleEdit(item)}>
                  <i className="fa fa-pencil text-primary" aria-hidden="true"></i>
                </button>
              </Tooltip>
            ) : (
              ""
            )}
            {checkAccess(auth.roles, [1303]) ? (
              <Tooltip placement="top" title={"حذف"} color="#F1212C">
                <button onClick={() => handleDelete(item.id)}>
                  <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                </button>
              </Tooltip>
            ) : (
              ""
            )}
          </div>
        ),
      });
    });

    setData(newData);
  }, [model]);

  const filters = [
    { name: "id", type: "text", label: "شناسه" },
    { name: "name", type: "text", label: "نام" },
  ];

  const handleDelete = (id) => {
    confirm().then(async () => {
      const res = await request(`/unit/delete?id=${id}`, "DELETE");

      if (res?.success) {
        getData();
      }
    });
  };

  const handleFinish = async (values) => {
    try {
      const create = !selectedUnit?.id;
      const method = create ? "POST" : "PUT";
      const url = create ? "/unit/create" : `/unit/update?id=${selectedUnit.id}`;

      let res = await request(url, method, values);

      if (res?.success) {
        getData();
        setSelectedUnit({});
        setShowModal(false);
        form.resetFields();
      }
    } catch (error) {}
  };

  return (
    <>
      <Filters fields={filters} getData={getData} />
      <Divider />
      {checkAccess(auth.roles, [1301]) ? (
        <Button type="success" className="m-2 d-flex justify-content-start" onClick={() => setShowModal(true)}>
          ثبت واحد جدید
        </Button>
      ) : (
        ""
      )}

      <div className="table-responsive">
        <Table columns={columns} dataSource={data} pagination={false} className="ant-border-space" />
      </div>

      <Pagination all={pages} />

      <Modal
        title={selectedUnit?.id ? "ویرایش واحد" : "ثبت واحد"}
        visible={showModal}
        onOk={() => form.submit()}
        onCancel={() => setShowModal(false)}
        okText="ثبت"
        cancelText="لغو"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item label="نام" name="name" rules={[{ required: true, message: "لطفاً نام را وارد کنید!" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
