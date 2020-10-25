import React from "react";
import {
    Table,
    Divider,
    Input,
    Button,
    Modal,
    Slider,
    InputNumber,
    Row,
    Col,
    Form,
    Select,
    List,
    Avatar,
} from "antd";
import axios from "axios";
import config from '../../../../config/config';

const {Search} = Input;
const {Option} = Select;

//List of likers or dislikers
const list = [
    {
        title: "Member 1",
    },
    {
        title: "Member 2",
    },
    {
        title: "Member 3",
    },
    {
        title: "Member 4",
    },
];



//Create columns
const columns = [
    {
        title: "Labeler",
        dataIndex: "labeler",
    },
    {
        title: "Submitted",
        dataIndex: "submitted",
    },
    {
        title: "Remaining",
        dataIndex: "remaining",
    }
];


class AdminTabAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            members: [],
            data: [],
            options: [],
            selected_member: null,
            max_image_assignment:0,
            current_assignment: 0,
            maximum:0,
            selected_index: -1,
            admin_index:-1,
        };
        this.assignmentChange = this.assignmentChange.bind(this);
        this.setModalVisible = this.setModalVisible.bind(this);
    }

    componentDidMount() {
        axios.get(`${config.apiUrl}/api/getassignments`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Token " + localStorage.getItem('token')
            },
            params: {
                project_id: this.props.project.id,
            }
        }).then((res) => {
            let members = res.data.members;
            let data = [];
            let options = [];
            for (let i = 0; i < members.length; i++) {
                let member = members[i];
                data.push({
                    key: i,
                    labeler: member.member.username,
                    submitted: member.number_image_completed,
                    remaining: member.number_image_labeler - member.number_image_completed,
                })
                if (member.member.id !== member.project.created_by.id) {
                    options.push(<Option key={i} value={i}>{member.member.username}</Option>)
                }else{
                    this.setState({
                        admin_index:i,
                    })
                }
            }
            console.log("Data "+data.length);
            this.setState({
                members: members,
                data: data,
                options: options,
                max_image_assignment:res.data.max_image_assignment
            })
        })
    }

    handleChange(value) {
        let member = this.state.members[value];
        this.setState({
            selected_member:this.state.members[value],
            current_assignment:this.state.members[value].number_image_labeler,
            maximum:this.state.members[value].number_image_labeler+this.state.max_image_assignment,
            selected_index:value
        })
    }

    assignmentChange(value){
        this.setState({
            current_assignment:value,
        })
    }

    setModalVisible(modalVisible) {
        this.setState({
            modalVisible:modalVisible
        });
    }

    onOK(){
        this.setModalVisible(false);
        axios.post(`${config.apiUrl}/api/addassignments`,{
                project_id: this.props.project.id,
                number_images: this.state.current_assignment-this.state.selected_member.number_image_labeler,
                member_id: this.state.selected_member.id,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Token " + localStorage.getItem('token')
                }
            }
        ).then((res)=>{
            let member = {
                ...this.state.selected_member,
                number_image_labeler:res.data.number_image_labeler,
                number_image_completed: res.data.number_image_labeler-res.data.number_image_incomplete
            }
            let members = this.state.members;
            members[this.state.selected_index] = member;
            let data = [...this.state.data]
            data[this.state.selected_index]={
                ...this.state.data[this.state.selected_index],
                submitted: res.data.number_image_labeler-res.data.number_image_incomplete,
                remaining: res.data.number_image_incomplete,
            }
            data[this.state.admin_index] = {
                ...this.state.data[this.state.admin_index],
                submitted: res.data.max_image_assignment-res.data.number_incomplete_admin,
                remaining: res.data.number_incomplete_admin,
            }
            this.setState({
                max_image_assignment: res.data.max_image_assignment,
                members: members,
                data:data,
                selected_member: member
            })
        }).catch((err)=>{
            console.log(err)
        })
    }

    render() {
        const {current_assignment} = this.state;
        const {maximum} = this.state;
        const {data} = this.state;
        return (
            <div>
                <div>
                    <Row>
                        <Col span={12}>
                            <Search
                                onSearch={(value) => console.log(value)}
                                style={{width: 300}}
                            />
                        </Col>
                        <Col span={12}>
                            <Button
                                type="primary"
                                onClick={() => this.setModalVisible(true)}
                                style={{float: "right"}}
                                disabled={this.state.data.length<2}
                            >
                                Add task assignment
                            </Button>
                        </Col>
                    </Row>
                </div>

                <br/>
                <Table
                    key = {this.state.data}
                    columns={columns}
                    dataSource={data}
                />

                <Modal
                    title="Add task assignment"
                    centered
                    visible={this.state.modalVisible}
                    okButtonProps={{disabled: !this.state.selected_member}}
                    onOk={() => this.onOK()}
                    onCancel={() => this.setModalVisible(false)}
                >
                    <div>
                        <Form.Item
                            name="select"
                            label="Select"
                            hasFeedback
                            rules={[
                                {required: true, message: "Please select your labeler!"},
                            ]}
                        >
                            <Select
                                placeholder="Please select a labeler"
                                onChange={(value)=>this.handleChange(value)}
                            >
                                {this.state.options}
                            </Select>
                        </Form.Item>
                    </div>
                    <Divider/>
                    <div>
                        <Row>
                            <Col span={12}>
                                <Slider
                                    min={0}
                                    max={maximum}
                                    onChange={this.assignmentChange}
                                    value={current_assignment}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={0}
                                    max={maximum}
                                    style={{margin: "0 16px"}}
                                    value={current_assignment}
                                    onChange={this.assignmentChange}
                                />
                            </Col>
                        </Row>
                    </div>
                </Modal>
            </div>
        );
    }
}


export default AdminTabAssignment;
