import { Form, Input, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import React, { Component } from "react";
import axios from "axios";
import { useState } from "react";
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

const DynamicFieldSet = (props) => {
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    props.handleChange("addMembers", values.emails);
    // console.log("Received values of form:", values);
    console.log(props.addMembers);
    setLoading(true);
    await axios
      .post(
        `http://localhost:8000/api/createmembers`,
        {
          project_id: props.projectId,
          members: values.emails,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    setLoading(false);
    props.setModalVisible(false);
    await props.refetch();
  };

  return (
    <>
      <Form
        name="dynamic_form_item"
        {...formItemLayoutWithOutLabel}
        onFinish={onFinish}
      >
        <Form.List name="emails">
          {(fields, { add, remove }) => {
            console.log(fields);
            return (
              <div>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0
                      ? formItemLayout
                      : formItemLayoutWithOutLabel)}
                    label={index === 0 ? "Email" : ""}
                    // label="email"

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
                          message: "It's not an email",
                          type: "email",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="member email"
                        style={{ width: "60%" }}
                      />
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
                    <PlusOutlined /> Add Member
                  </Button>
                </Form.Item>
              </div>
            );
          }}
        </Form.List>

        <Form.Item>
          <Button
            onClick={() => {
              props.setModalVisible(false);
            }}
            style={{
              marginRight: "10px",
            }}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default DynamicFieldSet;
