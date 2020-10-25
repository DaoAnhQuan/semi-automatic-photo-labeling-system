import React, { Component} from 'react';
import {
    Form,
    Input,
    Button,
    Breadcrumb
} from 'antd';
import { Link } from "react-router-dom";

import { LockOutlined } from '@ant-design/icons';
import { userActions } from '../_actions';
import { connect } from 'react-redux';

const ChangePasswordForm= (props)=>{
    const [form] = Form.useForm();

    const handleSubmit = () =>{
        form.submit();
    }

    return (
        <Form
            style={{ padding: '35px 35px 20px' }}
            name="changePW"
            scrollToFirstError
            form={form}
        >
            <h1 style={{ textAlign: 'center', margin: '0 0 35px' }}>Change Your Password</h1>
            <Form.Item
                name="oldPassword"
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
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Old Password" />
            </Form.Item>
            <Form.Item
                name="newPassword"
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
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />} placeholder="New Password" />
            </Form.Item>

            <Form.Item
                name="confirm"
                dependencies={['newPassword']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: 'Please confirm your password!',
                    },
                    {
                        min: 8,
                        message: 'Minimum 8 characters'
                    },
                    ({ getFieldValue }) => ({
                        validator(rule, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                            }

                            return Promise.reject('The two passwords that you entered do not match!');
                        },
                    })
                ]}
                validateFirst={true}
            >
                <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Confirm New Password" />
            </Form.Item>
            <Form.Item  >
                <Button style={{ width: '100%' }} type="primary" onClick={handleSubmit} loading={props.loading}>
                    Reset Password
                </Button>
            </Form.Item>
        </Form>
    )
}

class ChangePassword extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    handleSubmit(oldPassword,newPassword) {
        this.props.start_loading();
        this.props.changePassword(oldPassword, newPassword);
    }

    render() {

        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Change Password
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className="change-password-form">
                    <Form.Provider
                        onFormFinish = {(name, { values, forms })=>{
                            this.handleSubmit(values.oldPassword,values.newPassword);
                        }
                        }
                    >
                        <ChangePasswordForm loading={this.props.loading} key={this.props.loading}/>
                    </Form.Provider>
                </div>
            </div>
        );
    };
}
function mapState(state) {
    const { loggedIn } = state.authentication;
    const {loading} = state.users;

    return { loggedIn, loading };
}

const actionCreators = {
    changePassword: userActions.changePassword,
    start_loading: userActions.updateProfileStartLoading
};


const connectedChangePassword = connect(mapState, actionCreators)(ChangePassword);
export { connectedChangePassword as ChangePassword };
