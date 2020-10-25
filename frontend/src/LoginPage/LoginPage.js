import React, { Component } from "react";
import { Form, Input, Button, Checkbox, Breadcrumb } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { userActions } from '../_actions';
import { Link, Redirect } from 'react-router-dom';

const SignInForm = (props)=>{
    const [form] = Form.useForm();

    const handleSubmit = ()=>{
        form.submit();
    }
    return (
        <Form
            style={{ padding: '35px 35px 20px' }}
            form={form}
        >
            <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}> Sign In</h1>
            <Form.Item
                name="email"
                rules={[
                    {
                        type: 'email',
                        message: 'The input is not valid E-mail!',
                    },
                    {
                        required: true,
                        message: 'Please input your E-mail!' }
                        ]}
            >
                <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="Email"
                />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[
                    {
                        required: true,
                        message: 'Please input your Password!'
                    },
                    {
                        min:8,
                        message: 'Minimum 8 characters'
                    }
                    ]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Password"
                />
            </Form.Item>
            <Form.Item>
                {/*<Form.Item valuePropName="checked" noStyle>*/}
                {/*    <Checkbox>Remember me</Checkbox>*/}
                {/*</Form.Item>*/}
                <Link style={{ float: 'right' }} to="/forgot-password">Forgot password</Link>
            </Form.Item>
            <Form.Item>
                <Button style={{ width: '100%' }} type="primary" onClick={handleSubmit} className="login-form-button">
                    Login
                </Button>
                Or <Link to="/register">register now!</Link>
            </Form.Item>
        </Form>
    )
}

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(email,password) {
        this.props.login(email, password);
    }

    render() {
        if (localStorage.getItem("user")) {
            return <Redirect to="/projects" />
        }

        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh" }}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Login
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="sign-in-form">
                    <Form.Provider
                        onFormFinish={(name,{values,forms})=>{
                            this.handleSubmit(values.email,values.password);
                        }}
                    >
                        <SignInForm />
                    </Form.Provider>
                </div>
            </div>
        );
    }
}


function mapState(state) {
    const { loggedIn } = state.authentication;

    return { loggedIn };
}

const actionCreators = {
    login: userActions.login,
    logout: userActions.logout
};

const connectedLoginPage = connect(mapState, actionCreators)(LoginPage);
export { connectedLoginPage as LoginPage };