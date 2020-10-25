import React, { Component } from "react";
import { Form, Input, Button, message } from "antd";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 8 },
};

class AdminTabSettingOverView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project_name: "",
      description: "",
      projectId: this.props.projectId,
      loading: false,
    };
    this.onFinish = this.onFinish.bind(this);
  }

  async onFinish(values) {
    // const { projectId } = this.state;
    this.setState({
      loading: true,
    });
    const projectName = values.projectName;
    const introduction = values.introduction;
    console.log(projectName, introduction);
    await fetch(
      `http://localhost:8000/api/updateProject/${this.state.projectId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectName,
          info: introduction,
        }),
      }
    );

    setTimeout(() => {
      this.setState({
        loading: false,
      });
    }, 10);
    message.success("Update successfully!");
    this.props.changeInfo(projectName, introduction);
  }

  render() {
    return (
      <div>
        <Form
          {...layout}
          name="basic"
          initialValues={{
            remember: true,
            projectName: this.props.project_name,
            introduction: this.props.description,
          }}
          onFinish={this.onFinish}
          onChange={() => {
            console.log(this);
          }}
          loading={this.state.loading}
          // onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Project Name"
            name="projectName"
            rules={[
              {
                required: true,
                message: "Please input your project name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Introduction"
            name="introduction"
            rules={[
              { required: true, message: "Please input your description!" },
            ]}
          >
            <Input.TextArea rows={6} name="description" />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default AdminTabSettingOverView;
