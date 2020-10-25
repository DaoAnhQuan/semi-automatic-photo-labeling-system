import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { userActions } from '../_actions';
import { Button } from 'antd';
import { connect } from 'react-redux';
import axios from "axios";
import config from "../config/config";

class Logout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            navigate: false
        }
        this.handleLogout = this.handleLogout.bind(this);
    }

    handleLogout(e) {
        e.preventDefault();
        // reset login status
        axios.post(`${config.apiUrl}/api/logout`,{},{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Token " + localStorage.getItem('token')
            }
        }
        ).then(res=>{
            this.props.logout();
            this.setState({ navigate: true });
        }).catch(err=>{
            this.props.logout();
            this.setState({ navigate: true });
        })
    }
    render() {
        const { navigate } = this.state;
        if (navigate) {
            return <Redirect to="/login" />
        }

        return <a type="text" onClick={this.handleLogout}>Log out</a>
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

const connectedLogout = connect(mapState, actionCreators)(Logout);
export { connectedLogout as Logout };