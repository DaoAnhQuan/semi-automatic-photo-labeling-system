import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Modal, Button, Typography, List, AutoComplete, message } from "antd";
import {DeleteOutlined, SmileOutlined} from "@ant-design/icons";
import axios from "axios";
import config from "../../../config/config";


const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 8 },
};

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({ form, visible }) => {
    const prevVisibleRef = useRef();
    useEffect(() => {
        prevVisibleRef.current = visible;
    }, [visible]);
    const prevVisible = prevVisibleRef.current;

    useEffect(() => {
        if (!visible && prevVisible) {
            form.resetFields();
        }
    }, [visible]);
};


const ModalForm = ({ visible, onCancel, members }) => {
    const [form] = Form.useForm();
    const [options, setOptions] = useState([]);
    const [email,setEmail] = useState("");
    const [loading,setLoading] = useState(false);

    useResetFormOnCloseModal({
        form,
        visible,
    });

    const onOk = async () => {
        setLoading(true);
        await axios.post(`${config.apiUrl}/api/checkmemberexists`,{
            email:email
        },{
            headers: {
                "Content-Type": "application/json",
                Authorization: "Token " + localStorage.getItem("token"),
            }
        }).then(res=>{
            form.submit();
            setOptions([]);
            setLoading(false);
        }).catch(err=>{
            console.log(err.response.data);
            message.error("This email does not exist!");
            setLoading(false);
        })
    };

    const onSearch = (data) =>{
        setEmail(data.toString().trim());
        if (data.toString().length>4){
            axios.get(`${config.apiUrl}/api/findmember`,{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + localStorage.getItem("token"),
                },
                params: {
                    keyword:data
                }
            }).then((res)=>{
                let options = [];
                for (let user of res.data.members){
                    options.push({value:user.email});
                }
                setOptions(options);
            })
        }else{
            setOptions([]);
        }
    }

    const onSelect = (value, option)=>{
        setEmail(value);
    }

    return (
        <Modal title="Add Member" visible={visible} onOk={onOk} onCancel={onCancel} okButtonProps={{loading}}>
            <Form form={form} layout="vertical" name="userForm">
                <Form.Item
                    name="name"
                    label="User Email"
                    rules={[
                        {
                            type: "email",
                            message: "The input is not valid E-mail!",
                        },
                        {
                            required: true,
                            message: "Please input member E-mail!",
                        },
                        ({ getFieldValue }) => ({
                            validator(rule, value) {
                                for (let member of members){
                                    if (member === value){
                                        return Promise.reject('This member has already been added!');
                                    }
                                }
                                return Promise.resolve();
                            },
                        })
                    ]}
                    validateFirst = {true}

                >
                    <AutoComplete
                        options = {options}
                        onSearch = {onSearch}
                        onSelect = {onSelect}
                        placeholder = "Member email"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const ProjectMemberForm = (props) => {
    const [visible, setVisible] = useState(false);
    const [members, setMembers] = useState(new Set(props.members));
    const [update,setUpdate] = useState(false);

    const showUserModal = () => {
        setVisible(true);
    };

    const hideUserModal = () => {
        setVisible(false);
    };

    const onFinish = (values) => {
        console.log("Finish:", values);
    };

    const deleteItem = (item) => {
        members.forEach(x => x === item ? members.delete(x) : x)
        let member = members;
        setMembers(member);
        setUpdate(true);
        setTimeout(()=>setUpdate(false),100);
    }

    return (
        <div style={{ paddingTop: 10 + 'vh' }}>
            <Form.Provider
                onFormFinish={(name, { values, forms }) => {
                    if (name === "userForm") {
                        let member_list = members;
                        member_list.add(values.name);
                        setMembers(member_list)
                        props.handleChange("members", member_list)
                        const { basicForm } = forms;
                        const users = basicForm.getFieldValue("users") || [];
                        basicForm.setFieldsValue({ users: [...users, values] });
                        setVisible(false);
                    }
                }}
            >
                <Form {...layout} name="basicForm" onFinish={onFinish}>
                    <Form.Item
                        label="Member"
                        shouldUpdate={update}
                    >
                        {members.size>0 ? (
                            <List
                                size="small"
                                bordered
                                dataSource={members}
                                renderItem={item => <List.Item
                                    actions={[<Button  shape = "circle"  icon = {<DeleteOutlined/>} key={item} onClick={()=>deleteItem(item)}/>]}
                                >
                                    {item}
                                </List.Item>
                                }
                            />
                        ) : (
                            <Typography.Text className="ant-form-text" type="secondary">
                                ( <SmileOutlined /> No member yet. )
                            </Typography.Text>
                        )}
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button
                            htmlType="button"
                            onClick={showUserModal}
                        >
                            Add Member
                        </Button>
                    </Form.Item>
                </Form>
                <ModalForm visible={visible} onCancel={hideUserModal} members={members}/>
            </Form.Provider>
        </div>
    );
};

export default ProjectMemberForm;
