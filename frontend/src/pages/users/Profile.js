import React, { Component } from "react";
import { ProfileForm } from './ProfileForm';
import { Card, Breadcrumb } from 'antd';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

const tabList = [
    {
        key: 'tab1',
        tab: 'Profile',
    },
];

const contentList = {
    tab1: <ProfileForm />,
};

class Profile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            key: 'tab1',
            noTitleKey: 'app',
        };
    }

    onTabChange = (key, type) => {
        console.log(key, type);
        this.setState({ [type]: key });
    };
    render() {
        const { user } = this.props
        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Profile
                    </Breadcrumb.Item>

                </Breadcrumb>
                <div style={{ minHeight: '74vh', backgroundColor: '#fff' }}>
                    <Card
                        style={{ width: '100%' }}
                        title={user.username}
                        tabList={tabList}
                        activeTabKey={this.state.key}
                        onTabChange={key => {
                            this.onTabChange(key, 'key');
                        }}
                    >
                        {contentList[this.state.key]}
                    </Card>
                </div>
            </div>
        );
    }
}


function mapState(state) {
    const { user } = state.authentication;

    return { user };
}
const connectedProfile = connect(mapState)(Profile);

export { connectedProfile as Profile };

