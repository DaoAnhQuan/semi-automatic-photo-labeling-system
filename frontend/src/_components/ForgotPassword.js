import React, { Component } from "react";
import { Form, Input, Button, Breadcrumb } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { userActions } from '../_actions';
import { connect } from 'react-redux';

const ForgotPasswordForm = (props)=>{
    const [form] = Form.useForm();

    const handleSubmit = ()=>{
        form.submit();
    }
    return (
        <Form
            style={{ padding: '35px 35px 20px' }}
            name="normal_login"
            form = { form }
        >
            <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}>Forgot Your Password ?</h1>
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
                    Send
                </Button>
                Don't have an account yet? <Link to="/register">Create one now!</Link>
            </Form.Item>
        </Form>
    )
}
class ForgotPassword extends Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     email: ''
        // };
        //
        // this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // handleChange(e) {
    //     const { name, value } = e.target;
    //     this.setState({ [name]: value });
    // }

    handleSubmit(email) {
        // e.preventDefault();
        // const { email } = this.state;
        // if (email) {
        //     this.props.forgotPassword(email);
        // }
        this.props.forgotPassword(email);
    }
    render() {
        //const { email } = this.state;

        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Forgot Password
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="forgot-password-form">
                    {/*<Form*/}
                    {/*    style={{ padding: '35px 35px 20px' }}*/}
                    {/*    name="normal_login"*/}
                    {/*>*/}
                    {/*    <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}>Forgot Your Password ?</h1>*/}
                    {/*    <Form.Item*/}
                    {/*        name="email"*/}
                    {/*        rules={[*/}
                    {/*            {*/}
                    {/*                type: 'email',*/}
                    {/*                message: 'The input is not valid E-mail!',*/}
                    {/*            },*/}
                    {/*            {*/}
                    {/*                required: true,*/}
                    {/*                message: 'Please input your E-mail!',*/}
                    {/*            },*/}
                    {/*        ]}*/}
                    {/*    >*/}
                    {/*        <Input name="email" value={email}*/}
                    {/*            onChange={this.handleChange}*/}
                    {/*            prefix={<MailOutlined className="site-form-item-icon" />} placeholder="E-mail" />*/}
                    {/*    </Form.Item>*/}
                    {/*    <Form.Item>*/}
                    {/*        <Button style={{ width: '100%' }} type="primary" htmlType="submit"*/}
                    {/*            onClick={this.handleSubmit}*/}
                    {/*            className="login-form-button">*/}
                    {/*            Send*/}
                    {/*    </Button>*/}
                    {/*    Don't have an account yet? <Link to="/register">Create one now!</Link>*/}
                    {/*    </Form.Item>*/}
                    {/*</Form>*/}
                    <Form.Provider
                        onFormFinish={(name,{values,forms})=>{
                            this.handleSubmit(values.email)
                        }}
                    >
                        <ForgotPasswordForm />
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
    forgotPassword: userActions.forgotPassword
};


const connectedForgotPassword = connect(mapState, actionCreators)(ForgotPassword);
export { connectedForgotPassword as ForgotPassword };
