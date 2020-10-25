import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { Spin, Breadcrumb } from 'antd';
import { connect } from 'react-redux';
import { userActions } from '../_actions';
import { Link } from "react-router-dom";
import { history } from '../_helpers';

class Confirm extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount = () => {
        const { id, confirmation_code } = this.props.match.params;
        this.props.verify(id, confirmation_code);
        history.push('/login')
    }

    render() {
        const { verifying } = this.props;
        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Verify Email
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className='confirm-spin'>
                    {!verifying
                        ? <Spin style={{ height: '50%' }}>
                            <div style={{ background: '#eee', height: 500, margin: 24 }}></div>
                        </Spin>
                        : <Redirect to='/login'>login</Redirect>
                    }
                </div>
            </div>
        );
    }
}

function mapState(state) {
    const { verifying } = state.verify;
    return { verifying };
}

const actionCreators = {
    verify: userActions.verify
};

const connectedConfirm = connect(mapState, actionCreators)(Confirm);

export { connectedConfirm as Confirm };