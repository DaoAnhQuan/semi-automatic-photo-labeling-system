import React from "react";
import "./App.css";
import { Logout } from "../_components/Logout"
import ProjectList from "../pages/projects/ProjectList";
import { Verify } from "../_components/Verify";
import { ForgotPassword } from "../_components/ForgotPassword";
import { ChangePassword } from "../_components/ChangePassword";
import { Confirm } from "../_components/Confirm";
import { Layout, Menu, Breadcrumb, message, Dropdown } from "antd";
import { Router, Switch, Route, Link, Redirect } from "react-router-dom";
import { history } from "../_helpers";
import { LoginPage } from "../LoginPage";
import { RegisterPage } from "../RegisterPage";
import ProjectNew from "../pages/projects/ProjectNew";
import LabelingLoader from "../labeling/label/LabelingLoader";
import { alertActions, userActions } from "../_actions";
import { connect } from "react-redux";
import { DownOutlined } from "@ant-design/icons";
import { PrivateRoute } from "../_components";
import { ResetPassword } from "../_components/ResetPassword";
import { Profile } from "../pages/users/Profile";
import ProjectRidirect from "../_components/ProjectRidirect";
import Home from "../Home"
const { Header, Content, Footer } = Layout;

const menu = (
    <Menu>
        <Menu.Item key="0">
            <Link to="/profile">Account</Link>
        </Menu.Item>
        <Menu.Item key="1">
            <Link to="/changepassword">Change Password</Link>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="2">
            <Logout />
        </Menu.Item>
    </Menu>
);

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { alert, user } = this.props;
        if (alert.message) {
            switch (alert.type) {
                case "alert-success":
                    message.success(alert.message);
                    break;
                case "alert-danger":
                    message.error(alert.message);
                    break;
            }
            this.props.clearAlerts();
        }

        return (
            <Layout style={{ minHeight: "100vh" }}>
                <Router history={history}>
                    <Header
                        style={{
                            position: "fixed",
                            zIndex: 1,
                            width: "100%",
                            paddingLeft: "22vh",
                            paddingRight: "22vh",
                        }}
                    >
                        <Link to={"/projects"}>
                            <div className="logo">
                            </div>
                        </Link>

                        {user ? (
                            <div style={{ float: "right" }}>
                                <Dropdown overlay={menu} trigger={['click']} placement={'bottomRight'} overlayStyle={{minWidth:'0px'}}>
                                    <div className="account-menu">
                                        <div className="account-info">
                                            {user.username}
                                            <br/>
                                            {user.organization}
                                        </div>
                                        <div className="account-dropdown-icon">
                                            <DownOutlined/>
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>
                        ) : (
                                <Menu style={{ float: "right" }} theme="dark" mode="horizontal">
                                    <Menu.Item key="1">
                                        <Link to="/login">Login</Link>
                                    </Menu.Item>
                                    <Menu.Item key="2">
                                        <Link to="/register">Register</Link>
                                    </Menu.Item>
                                </Menu>
                            )}
                    </Header>
                    <Content
                        className="site-layout"
                        style={{ marginTop: 64 }}
                    >
                        <div>
                            <Switch>
                                <Route exact path="/login" component={LoginPage} />
                                <Route exact path="/register" component={RegisterPage} />
                                <Route
                                    exact
                                    path="/forgot-password"
                                    component={ForgotPassword}
                                />
                                <Route exact path="/verify" component={Verify} />
                                <Route
                                    path="/email-verify/:id/:confirmation_code"
                                    component={Confirm}
                                />
                                <Route
                                    path="/reset-password/:id/:reset_password_code"
                                    component={ResetPassword}
                                />
                                <PrivateRoute exact path="/profile" component={Profile} />
                                <PrivateRoute
                                    exact
                                    path="/project/:id"
                                    component={ProjectRidirect}
                                />
                                <PrivateRoute exact path="/projects" component={ProjectList} />
                                <PrivateRoute
                                    exact
                                    path="/changepassword"
                                    component={ChangePassword}
                                />
                                <Route exact path="/projects/new" component={ProjectNew} />
                                <Route
                                    exact
                                    path="/label/:projectId/:imageId"
                                    render={(props) => <LabelingLoader {...props} />}
                                />
                                <Route
                                    exact
                                    path="/review/:projectId/:imageId"
                                    render={(props) => <LabelingLoader {...props} review={true} />}
                                />
                                <Route exact path="/" component={Home} />
                            </Switch>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: "center" }}>
                        Easy Labelling ©2020 Created by Team 05_OanhNT
                    </Footer>
                </Router>
            </Layout>
        );
    }
}

function mapState(state) {
    const { alert } = state;
    const { user } = state.authentication;

    return { alert, user };
}

const actionCreators = {
    getUsers: userActions.getAll,
    clearAlerts: alertActions.clear,
};

const connectedApp = connect(mapState, actionCreators)(App);
export { connectedApp as App };
