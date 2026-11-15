import { Modal, Form, Input, Select, Row, Col, Button } from "antd";
const { Option } = Select;

const UserFilterModal = ({ visible, onCancel, onFilter }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onFilter(values);
    onCancel();
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width={800}
      className="modal-wrapper modal-dialog-scrollable"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title m-0">فیلتر کاربران</h1>
          <button type="button" className="btn-close" onClick={onCancel}></button>
        </div>
        <div className="modal-body">
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Row gutter={[24, 8]}>
              <Col span={12}>
                <Form.Item name="first_name" label="نام">
                  <Input placeholder="نام" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="last_name" label="نام خانوادگی">
                  <Input placeholder="نام خانوادگی" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="group" label="گروه">
                  <Select placeholder="انتخاب گروه">
                    <Option value="marketing">بازاریابی</Option>
                    <Option value="sales">فروش</Option>
                    <Option value="warranty">گارانتی</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="وضعیت">
                  <Select placeholder="انتخاب وضعیت">
                    <Option value="active">تایید شده</Option>
                    <Option value="inactive">تایید نشده</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <div className="modal-footer p-0 mt-3">
              <div className="d-flex justify-content-center gap-2">
                <Button onClick={onCancel}>انصراف</Button>
                <Button htmlType="submit" type="primary">اعمال فیلتر</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default UserFilterModal;
