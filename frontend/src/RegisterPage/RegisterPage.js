import React, { Component } from 'react';
import {
    Form,
    Input,
    Button,
    Breadcrumb
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { userActions } from '../_actions';

const SignUpForm = (props)=>{
    const [form] = Form.useForm();

    const handleSubmit = ()=>{
        form.submit();
    }

    return(
        <Form
            style={{ padding: '35px 35px 20px' }}
            form={form}
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
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username"
                />
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
                <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="E-mail"
                />
            </Form.Item>
            <Form.Item
                name="password"
                label=""
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                    {
                        min:8,
                        message: 'Minimum 8 characters'
                    }
                ]}
                hasFeedback
            >
                <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Password"
                />
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
            <Form.Item  >
                <Button style={{ width: '100%' }} type="primary" onClick={handleSubmit}>
                    Register
                </Button>
            </Form.Item>
        </Form>
    )
}

class RegisterPage extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(user) {
        this.props.register(user);
    }
    render() {

        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Register
                    </Breadcrumb.Item>

                </Breadcrumb>
                <div className="sign-up-form">
                    <Form.Provider
                        onFormFinish={(name,{values,forms})=>{
                            this.handleSubmit({
                                    email: values.email,
                                    username: values.username,
                                    password: values.password
                            })
                        }}
                    >
                        <SignUpForm />
                    </Form.Provider>
                </div>
            </div>
        );
    };
}

function mapState(state) {
    const { registering } = state.registration;
    return { registering };
}

const actionCreators = {
    register: userActions.register
}

const connectedRegisterPage = connect(mapState, actionCreators)(RegisterPage);
export { connectedRegisterPage as RegisterPage };
