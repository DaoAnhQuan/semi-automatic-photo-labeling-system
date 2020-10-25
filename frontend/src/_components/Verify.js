import React, { Component } from 'react';
import { Form, Input, Button, Breadcrumb } from 'antd';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { userActions } from '../_actions';
import { MailOutlined } from '@ant-design/icons';

const VerificationForm = (props)=>{
    const [form] = Form.useForm();

    const handleSubmit = ()=>{
        form.submit();
    }

    return (
        <Form
            style={{ padding: '35px 35px 20px' }}
            form={form}
            name="normal_login"
        >
            <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}>Verify Your Email Address</h1>
            <p style={{ textAlign: "justify" }}>Before proceeding, please check your email for a verification link. If you did not receive the email.</p>
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
            <Form.Item>
                <Button style={{ width: '100%' }} type="primary"
                        onClick={handleSubmit}
                        className="login-form-button">
                    Request Another
                </Button>
            </Form.Item>
        </Form>
    )
}

class Verify extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleSubmit(email) {
        this.props.reSendVerifyEmail(email);
    }

    render() {

        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh" }}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Verify Email
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="forgot-password-form">
                    <Form.Provider
                        onFormFinish={(name, { values, forms })=>{
                            this.handleSubmit(values.email);
                        }}
                    >
                        <VerificationForm />
                    </Form.Provider>
                </div>
            </div>
        );
    };
}
function mapState(state) {
    const { user } = state.authentication;
    return { user };
}

const actionCreators = {
    reSendVerifyEmail: userActions.reSendVerifyEmail
};

const connectedVerify = connect(mapState, actionCreators)(Verify);

export { connectedVerify as Verify };

