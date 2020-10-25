import React, { Component } from 'react';
import {
    Form,
    Input,
    Checkbox,
    Button,
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';

const onFinish = values => {
    console.log('Received values of form: ', values);
};

class SignUp extends Component {
    render() {
        return (
            <div className="sign-up-form">
                <Form
                    style={{ padding: '35px 35px 20px' }}
                    name="register"
                    onFinish={onFinish}
                    scrollToFirstError
                >
                    <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}> Sign Up</h1>

                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Username!',
                                whitespace: true,
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            {
                                type: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            },
                        ]}
                    >
                        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="E-mail" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label=""
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            ({ getFieldValue }) => ({
                                validator(rule, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject('The two passwords that you entered do not match!');
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject('Should accept agreement'),
                            },
                        ]}
                    >
                        <Checkbox>
                            I have read the <a href="">agreement</a>
                        </Checkbox>
                    </Form.Item>
                    <Form.Item  >
                        <Button style={{ width: '100%' }} type="primary" htmlType="submit">
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    };
}

export default SignUp;
