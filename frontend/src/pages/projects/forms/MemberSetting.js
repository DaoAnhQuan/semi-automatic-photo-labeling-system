import React, { Component } from "react";
import { Table, Input, Button, Space, Divider, Modal, Form } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const { Search } = Input;

const columns = [
  {
    title: "Team member",
    dataIndex: "mem",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Email",
    dataIndex: "email",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Labels",
    dataIndex: "label",
  },
];
const data = [
  {
    key: "1",
    mem: "Dao Anh Quan",
    email: "quan.da@gmail.com",
    label: 150,
  },
  {
    key: "1",
    mem: "Dao Anh Quan",
    email: "quan.da@gmail.com",
    label: 150,
  },
  {
    key: "1",
    mem: "Dao Anh Quan",
    email: "quan.da@gmail.com",
    label: 150,
  },
  {
    key: "1",
    mem: "Dao Anh Quan",
    email: "quan.da@gmail.com",
    label: 150,
  },
];
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

const DynamicFieldSet = () => {
  const onFinish = (values) => {
    console.log("Received values of form:", values);
  };

  return (
    <Form
      name="dynamic_form_item"
      {...formItemLayoutWithOutLabel}
      onFinish={onFinish}
    >
      <Form.List name="names">
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0
                    ? formItemLayout
                    : formItemLayoutWithOutLabel)}
                  label={index === 0 ? "Email" : ""}
                  required={false}
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please input email or delete this field.",
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder="email" style={{ width: "60%" }} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: "0 8px" }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                  style={{ width: "60%" }}
                >
                  <PlusOutlined /> Add more
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Add
        </Button>
      </Form.Item>
    </Form>
  );
};

class MemberList extends React.Component {
  state = {
    modalVisible: false,
    members: [],
    projectId: 1,
    user: JSON.parse(localStorage.getItem("user")),
  };

  componentDidMount() {
    axios
      .get(
        `http://localhost:8000/api/listImage/${
          this.state.projectId
        }?completed=${null}&user=${this.state.user.id}`
      )
      .then((res) => {
        const images = res.data;
        this.setState({ images });
        console.log(images);
        // console.log(this.state.images)
      });
  }
  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  render() {
    return (
      <div>
        <div>
          <Space size={800}>
            <Search
              placeholder="input search text"
              onSearch={(value) => console.log(value)}
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={() => this.setModalVisible(true)}>
              Add new member
            </Button>
          </Space>
        </div>
        <Divider />
        <Table columns={columns} dataSource={data} />
        <Modal
          title="Add new member"
          centered
          visible={this.state.modalVisible}
          onOk={() => this.setModalVisible(false)}
          onCancel={() => this.setModalVisible(false)}
        >
          <DynamicFieldSet />
        </Modal>
      </div>
    );
  }
}

export default MemberList;
