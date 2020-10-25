import React, { Component } from "react";
import { Form, Input, Steps, Button, Breadcrumb, message, Row,Col } from "antd";
import { Link } from "react-router-dom";
import ProjectDataForm from "./forms/ProjectDataForm";
import ProjectLabelForm from "./forms/ProjectLabelForm";
import ProjectMemberForm from "./forms/ProjectMemberForm";
// import { Form, Input } from "antd";
import {history} from '../../_helpers/history'
import axios from "axios";
const { Step } = Steps;
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};

const ProjectOverviewForm = (props) => {
    const [form] =Form.useForm();
    return (
        <div style={{ paddingTop: 10 + 'vh' }}>
            <Form
                {...layout}
                form={form}
                name="basic"
                initialValues={{
                    remember: true,
                    projectName: props.project_name,
                    description: props.description,
                }}
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
                    onChange={(event) => {
                        props.handleChange("project_name", event.target.value);
                    }}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    onChange={(event) => {
                        props.handleChange("description", event.target.value);
                    }}
                >
                    <Input.TextArea rows={6} name="description" />
                </Form.Item>
            </Form>
        </div>
    );
};

class ProjectNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,
            project_name: "",
            description: "",
            fileList: "",
            label_type: "bbox",
            label_list: new Set(),
            members: [],
            project: null,
            disabled:true,
            loading:false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
    }
    async handleChange(state_name, state_value) {
        await this.setState({
            [state_name]: state_value,
        });
        setTimeout(()=>{
            if ((this.state.project_name.toString().length===0) || ((this.state.current === 2) && (this.state.label_list.size===0))){
                this.setState({
                    disabled:true
                })
            }else{
                this.setState({
                    disabled:false
                })
            }
        },100);
    }
    next() {
        const current = this.state.current + 1;
        if ((current===2) && (this.state.label_list.size===0)){
            this.setState({
                disabled:true
            })
        }
        this.setState({
            current:current
        });
    }

    prev() {
        const current = this.state.current - 1;
        this.setState({ current });
    }


    async handleUpload() {
        const {
            project_name,
            description,
            fileList,
            label_type,
            label_list,
            members,
        } = this.state;

        this.setState({
            loading: true,
        })

        //Create Project
        await axios
            .post(
                `http://localhost:8000/api/createprojectname`,
                {
                    project_name: project_name,
                    description: description,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                }
            )
            .then((res) => {
                this.setState({
                    project: res.data.project,
                });
            })
            .catch((err) => {
                console.log(err);
            });

        //Add labelType and LabelList
        await axios
            .post(
                `http://localhost:8000/api/updateLabel/${this.state.project.id}/`,
                {
                    label_type: label_type,
                    label_list: [...label_list]
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((res) => {
                console.log(res);
            });

        //upload image
        const formData = new FormData();
        for (let i = 0; i < fileList.length; i++) {
            formData.append(`images[${i}]`, fileList[i].originFileObj);
        }

        await axios
            .post(
                `http://localhost:8000/api/upload/${this.state.project.id}`,
                formData,
                {
                    headers: {
                        "content-type": "multipart/form-data",
                    },
                }
            )
            .then((response) => {
                console.log(response.data);
            });

        // add members
        await axios
            .post(
                `http://localhost:8000/api/createmembers`,
                {
                    project_id: this.state.project.id,
                    members: [...members],
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
                message.success("Processing complete!");
                this.setState({
                    loading: false,
                })
            })
            .catch((err) => {
                console.log(err);
                message.err("processing failed!")
            });
        history.push(`/project/${this.state.project.id}`)
    }

    render() {
        const {
            project_name,
            description,
            fileList,
            label_type,
            label_list,
            members,
        } = this.state;
        const steps = [
            {
                title: "Project Over View",
                content: (
                    <ProjectOverviewForm
                        handleChange={this.handleChange}
                        project_name={project_name}
                        description={description}
                    />
                ),
            },
            {
                title: "Data",
                content: (
                    <ProjectDataForm
                        handleChange={this.handleChange}
                        fileList={fileList}
                    />
                ),
            },
            {
                title: "Label",
                content: (
                    <ProjectLabelForm
                        handleChange={this.handleChange}
                        label_type={label_type}
                        label_list={label_list}
                    />
                ),
            },
            {
                title: "Member",
                content: <ProjectMemberForm handleChange={this.handleChange} members={members}/>,
            },
        ];

        const { current } = this.state;
        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/projects">Projects</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        New Project
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="project-new">
                    <Steps current={current}>
                        {steps.map((item) => (
                            <Step key={item.title} title={item.title} />
                        ))}
                    </Steps>
                    <div className="steps-content">{steps[current].content}</div>
                    <div className="steps-action">
                        {current > 0 && (
                            <Button style={{ margin: "0 8px" }} onClick={() => this.prev()}>
                                Previous
                            </Button>
                        )}
                        {current < steps.length - 1 && (
                            <Button
                                type="primary"
                                onClick={() => {
                                    this.next();
                                }}
                                disabled ={this.state.disabled}
                            >
                                Next
                            </Button>
                        )}
                        {current === steps.length - 1 && (
                            <Button
                                type="primary"
                                onClick={this.handleUpload.bind(this)}
                                loading={this.state.loading}
                            >
                                Create
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default ProjectNew;
