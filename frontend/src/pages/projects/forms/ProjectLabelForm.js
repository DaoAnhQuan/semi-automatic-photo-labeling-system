import React, { useState, useEffect, useRef, Component } from "react";
import { Form, Input, Modal, Button, Typography, Select, List } from "antd";
import { SmileOutlined, UserOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 8 },
};

interface ModalFormProps {
    visible: boolean;
    onCancel: () => void;
}

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

const ModalForm: React.FC<ModalFormProps> = ({ visible, onCancel, label_list }) => {
    const [form] = Form.useForm();

    useResetFormOnCloseModal({
        form,
        visible,
    });

    const onOk = () => {
        form.submit();
    };

    return (
        <Modal title="Add Label" visible={visible} onOk={onOk} onCancel={onCancel}>
            <Form form={form} layout="vertical" name="userForm">
                <Form.Item name="name" label="Label Name" rules={[
                    { required: true, message: "Please input label name!" },
                    ({ getFieldValue }) => ({
                        validator(rule, value) {
                            if (!label_list.has(value.toString().trim())) {
                                return Promise.resolve();
                            }
                            return Promise.reject('This label is already existed!');
                        },
                    })
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const ProjectLabelForm = (props) => {
    const [label_type, setLabel_Type] = useState(props.label_type);
    const [label_list, setLabel_List] = useState(props.label_list);
    const [update,setUpdate] = useState(false);

    const [visible, setVisible] = useState(false);

    const showUserModal = () => {
        setVisible(true);
    };

    const hideUserModal = () => {
        setVisible(false);
    };

    const onFinish = (values) => {
        console.log("Finish:", values);
    };
    //   console.log(label_list)
    const deleteItem = (item) => {
        label_list.forEach(x => x === item ? label_list.delete(x) : x)
        let label = label_list;
        setLabel_List(label);
        props.handleChange("label_list", label);
        setUpdate(true);
        setTimeout(()=>setUpdate(false),100);
    }
    return (
        <div style={{ paddingTop: 10 + 'vh' }}>
            <Form.Provider
                onFormFinish={(name, { values, forms }) => {
                    if (name === "userForm") {
                        let labels = label_list;
                        labels.add(values.name);
                        setLabel_List(labels);
                        props.handleChange("label_list", labels);
                        const { basicForm } = forms;
                        const users = basicForm.getFieldValue("users") || [];
                        console.log(users);
                        basicForm.setFieldsValue({ users: [...users, values] });
                        setVisible(false);
                    }
                }}
            >
                <Form
                    {...layout}
                    name="basicForm"
                    onFinish={onFinish}
                    onValuesChange={(changedValue, allValues) => {
                        console.log(allValues);
                    }}
                >
                    <Form.Item
                        name="select"
                        label="Label Type"
                        hasFeedback
                        rules={[{ required: true, message: "Please select label type!" }]}
                    >
                        <Select
                            placeholder="Please select a label type"
                            onChange={(value, event) => {
                                setLabel_Type(value);
                                props.handleChange("label_type", value);
                                console.log(value);
                            }}
                            defaultValue = {label_type?label_type:"bbox"}
                        >
                            <Option value="polygon">polygon</Option>
                            <Option value="bbox">bbox</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Label"
                        shouldUpdate = {update}
                    >
                        {label_list.size>0 ? (
                        <List
                            key = {label_list}
                            size="small"
                            bordered
                            dataSource={label_list}
                            renderItem={item => <List.Item
                                actions={[<Button  shape = "circle"  icon = {<DeleteOutlined/>} key={item} onClick={()=>deleteItem(item)}/>]}
                            >
                                {item}
                            </List.Item>
                            }
                        />
                        ) : (
                        <Typography.Text className="ant-form-text" type="secondary">
                            ( <SmileOutlined /> No label yet. )
                        </Typography.Text>
                        )}
                    </Form.Item>
                    <Form.Item {...tailLayout}>
                        <Button
                            htmlType="button"
                            onClick={showUserModal}
                        >
                            Add Label
                        </Button>
                    </Form.Item>
                </Form>
                <ModalForm visible={visible} onCancel={hideUserModal} label_list={label_list} />
            </Form.Provider>
        </div>
    );
};

export default ProjectLabelForm;
