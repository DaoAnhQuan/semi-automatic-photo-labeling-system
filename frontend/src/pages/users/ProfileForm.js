import React, { Component } from "react";
import { Form, Input, Select, Button } from 'antd';
import { connect } from 'react-redux';
import { userActions } from '../../_actions';
import { history } from "../../_helpers";

const layout = {
    labelCol: { span: 9 },
    wrapperCol: { span: 8 },
};

const { Option } = Select;

const validateMessages = {
    required: '${label} is required!',
    types: {
        email: '${label} is not validate email!',
        number: '${label} is not a validate number!',
    },
    number: {
        range: '${label} must be between ${min} and ${max}',
    },
};
// const prefixSelector = (
//     <Form.Item name="prefix" noStyle>
//         <Select style={{ width: 70 }}>
//             <Option value="86">+86</Option>
//             <Option value="87">+87</Option>
//         </Select>
//     </Form.Item>
// );

class ProfileForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            username: this.props.user.username,
            organization: this.props.user.organization
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.start_loading();
        const { username, organization } = this.state;
        if (username) {
            this.props.updateProfile(username, organization);
        }
    }

    render() {
        const { user } = this.props;
        return (
            <Form {...layout} name="nest-messages" validateMessages={validateMessages}>
                <Form.Item name={['user', 'name']} label="User Name" rules={[{ required: true }]}>
                    <Input
                        name="username"
                        defaultValue={user.username}
                        value={this.state.username}
                        onChange={this.handleChange}
                    />
                </Form.Item>
                <Form.Item name={['user', 'email']} label="Email" rules={[{ type: 'email', required: true }]}>
                    <Input disabled defaultValue={user.email} />
                </Form.Item>
                {/*<Form.Item*/}
                {/*    name="phone"*/}
                {/*    label="Phone Number"*/}
                {/*    rules={[{ message: 'Please input your phone number!' }]}*/}
                {/*>*/}
                {/*    <Input addonBefore={prefixSelector} style={{ width: '100%' }} />*/}
                {/*</Form.Item>*/}
                <Form.Item name={['user', 'organization']} label="Organization">
                    <Input
                        name="organization"
                        defaultValue={user.organization}
                        value={this.state.organization}
                        onChange={this.handleChange}
                    />
                </Form.Item>
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 9 }}>
                    <Button type="primary" htmlType="submit" onClick={this.handleSubmit} loading = {this.props.loading}>
                        Submit
                    </Button>
                    <Button style={{ marginLeft: '16px' }} type="default" htmlType="reset" onClick={()=> history.goBack()}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

function mapState(state) {
    const { user } = state.authentication;
    const {loading} = state.users;

    return { user, loading };
}

const actionCreators = {
    updateProfile: userActions.updateProfile,
    start_loading: userActions.updateProfileStartLoading,
};

const connectedProfileForm = connect(mapState, actionCreators)(ProfileForm);

export { connectedProfileForm as ProfileForm };