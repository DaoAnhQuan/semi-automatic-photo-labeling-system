import React, { Component } from 'react';
import {
    Form,
    Input,
    Button, Breadcrumb
} from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { userActions } from '../_actions';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';

const ResetPasswordForm =(props)=>{
    const [form] = Form.useForm();
    const handleSubmit = ()=>{
        form.submit();
    }
    return (
        <Form
            style={{ padding: '35px 35px 20px' }}
            name="register"
            scrollToFirstError
            form={form}
        >
            <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}>Reset Password</h1>

            <Form.Item
                name="password"
                label=""
                rules={[
                    {
                        required: true,
                        message: 'Please input your password!',
                    },
                    {
                        min: 8,
                        message: 'Minimum 8 characters'
                    }
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
            <Form.Item  >
                <Button style={{ width: '100%' }} type="primary" onClick={handleSubmit}>
                    Reset Password
                </Button>
            </Form.Item>
        </Form>
    )
}
class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(password) {
        const { id, reset_password_code } = this.props.match.params;
        this.props.resetPassword(id, reset_password_code, password);
    }

    render() {

        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Reset Password
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="reset-password-form">
                    <Form.Provider
                        onFormFinish={(name, { values, forms })=>{
                            this.handleSubmit(values.password);
                        }}
                    >
                        <ResetPasswordForm />
                    </Form.Provider>
                </div>
            </div>
        );
    };
}
function mapState(state) {
    const { loggedIn } = state.authentication;

    return { loggedIn };
}

const actionCreators = {
    resetPassword: userActions.resetPassword
};


const connectedResetPassword = connect(mapState, actionCreators)(ResetPassword);
export { connectedResetPassword as ResetPassword };
