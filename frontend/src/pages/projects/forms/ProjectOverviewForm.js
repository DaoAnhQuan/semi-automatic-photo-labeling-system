import React, { Component } from "react";
import { Form, Input, Checkbox, Button } from "antd";
import axios from "axios";
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class ProjectOverviewForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project_name: "",
      description: "",
      projectId: 1,
    };
    this.onFinish = this.onFinish.bind(this);
  }

  async onFinish(values) {
    // const { projectId } = this.state;
    const projectName = values.projectName;
    const introduction = values.introduction;
    console.log(projectName, introduction);
    await fetch(`http://localhost:8000/api/updateProject/${this.state.projectId}`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": projectName,
        "info": introduction
      }),
    });
  }

  render() {
    return (
      <div className="project-over-view-form">
        <Form
          {...layout}
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={this.onFinish}
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
            <Input.TextArea
              rows={6}
              name="description"
              onChange={(event) => {
                let description = event.target.value;
                // this.props.handleChange("description", description);
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default ProjectOverviewForm;
