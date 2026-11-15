import { Modal, Form, Input, Select, Row, Col, Collapse, Checkbox, Typography, Button } from "antd";
import { useEffect } from "react";

const { Option } = Select;
const { Panel } = Collapse;
const { Paragraph } = Typography;

const UserCreateModal = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [visible]);

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      closable={false}
      width="90%"
      className="modal-wrapper modal-xl modal-dialog-scrollable"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title m-0">ثبت کاربر جدید</h1>
          <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
        </div>
        <div className="modal-body">
          <Form layout="vertical" form={form} onFinish={handleFinish}>
            <Row gutter={[12, 1]}>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="first_name" label="نام" rules={[{ required: true }]}> 
                  <div className="field-inner">
                    <Input placeholder="نام" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="last_name" label="نام خانوادگی">
                  <div className="field-inner">
                    <Input placeholder="نام خانوادگی" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="username" label="نام کاربری" rules={[{ required: true }]}> 
                  <div className="field-inner">
                    <Input placeholder="نام کاربری" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="password" label="کلمه عبور" rules={[{ required: true }]}> 
                  <div className="field-inner">
                    <Input.Password placeholder="کلمه عبور" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="email" label="ایمیل">
                  <div className="field-inner">
                    <Input placeholder="ایمیل" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="company_name" label="نام شرکت">
                  <div className="field-inner">
                    <Input placeholder="نام شرکت" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="economic_code" label="کد اقتصادی">
                  <div className="field-inner">
                    <Input placeholder="کد اقتصادی" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="national_id" label="کد ملی">
                  <div className="field-inner">
                    <Input placeholder="کد ملی" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="ceo_name" label="نام مدیرعامل">
                  <div className="field-inner">
                    <Input placeholder="نام مدیرعامل" />
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="status" label="وضعیت" rules={[{ required: true }]}> 
                  <div className="AZ-styled-select">
                    <Select placeholder="وضعیت را انتخاب کنید">
                      <Option value="active">تایید شده</Option>
                      <Option value="inactive">تایید نشده</Option>
                    </Select>
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="group" label="گروه ها">
                  <div className="AZ-styled-select">
                    <Select placeholder="گروه را انتخاب کنید">
                      <Option value="marketing">بازاریابی</Option>
                      <Option value="sales">فروش</Option>
                      <Option value="warranty">گارانتی</Option>
                    </Select>
                  </div>
                </Form.Item>
              </Col>
              <Col span={12} className="AZ-field-group">
                <Form.Item name="user_type" label="نوع کاربر" rules={[{ required: true }]}> 
                  <div className="AZ-styled-select">
                    <Select placeholder="نوع را انتخاب کنید">
                      <Option value="marketing">بازاریابی</Option>
                      <Option value="sales">فروش</Option>
                      <Option value="warranty">گارانتی</Option>
                    </Select>
                  </div>
                </Form.Item>
              </Col>
              <Col span={24}>
                <div className="danger-message">
                  <Paragraph>
توجه درصورتی که برای کاربر گروه انتخاب میکنید و در گروه های انتخاب شده دسترسی ثبت کرده باشید دسترسی های این قسمت بی تاثیر میشود و دسترسی های وارد شده داخل گروه برای کاربر ثبت میگردد و باکس دسترسی های پایین فقط جهت نمایش دسترسی های کاربر میباشد. درصورتی که میخواهید برای کاربر دستی دسترسی وارد کنید میتونید گروه های کاربر رو حذف کنید و از قسمت پایین دسترسی های مورد نیاز را انتخاب کنید.

                  </Paragraph>
                </div>
              </Col>
              <Col span={24} className="mt-4">
                <h4 className="AZ-section-title">دسترسی ها</h4>
                <Collapse className="AZ-accordion">
                  <Panel header="مدیریت کاربران" key="1">
                    <Checkbox.Group>
                      <Row gutter={[8, 8]}>
                        <Col span={6}><Checkbox value="create">ایجاد</Checkbox></Col>
                        <Col span={6}><Checkbox value="edit">ویرایش</Checkbox></Col>
                        <Col span={6}><Checkbox value="delete">حذف</Checkbox></Col>
                        <Col span={6}><Checkbox value="view">مشاهده</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  </Panel>
                  <Panel header="سفارشات" key="2">
                    <Checkbox.Group>
                      <Row gutter={[8, 8]}>
                        <Col span={6}><Checkbox value="order_create">ثبت سفارش</Checkbox></Col>
                        <Col span={6}><Checkbox value="order_view">مشاهده سفارش</Checkbox></Col>
                      </Row>
                    </Checkbox.Group>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <div className="modal-footer p-0">
              <div className="col-lg-12 d-flex align-items-center gap-2 justify-content-center pt-3">
                <Button htmlType="submit" className="AZ-primary-btn d-flex align-items-center justify-content-center gap-1">ثبت</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default UserCreateModal;
