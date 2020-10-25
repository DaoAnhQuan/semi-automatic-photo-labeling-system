import React from "react";
import { Tabs, Button, Modal } from "antd";
import AdminTabSettingMember from "./components/AdminTabSettingMember";
import AdminTabSettingLabel from "./components/AdminTabSettingLabel";
import AdminTabSettingData from "./components/AdminTabSettingData";
import AdminTabSettingOverView from "./components/AdminTabSettingOverView";
import AdminTabSettingExport from "./components/AdminTabSettingExport";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import config from "../../../config/config";
import { Redirect } from "react-router-dom";
import { history } from "../../../_helpers";

const { TabPane } = Tabs;

class AdminTabSetting extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnDelete = this.handleOnDelete.bind(this);
    this.state = {
      activeKey: "0",
    }
  }

  handleChangeTab = (key) => {
    this.setState({
      activeKey: key
    });
    if (key == 5 && !this.props.isMember) {
      this.confirm();
    }
    if (key == 6 && this.props.isMember){
      this.confirmLeave();
    }
  };

  confirmLeave = () => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: "Do you want to leave this project?",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        this.handleOnLeave();
      },
      onCancel: () => {
        this.setState({
          activeKey: "0"
        })
      }
    });
  }

  handleOnLeave = ()=>{
    axios.post(`${config.apiUrl}/api/leaveproject`,{
      project_id:this.props.project.id,
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      },
    }).then((res)=>{
      history.replace('/projects')
    })
  }

  confirm = () => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: "Do you want to delete this project?",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        this.handleOnDelete();
      },
      onCancel: ()=>{
        this.setState({
          activeKey:"0",
        })
      }
    });
  };

  handleOnDelete = () => {
    axios
      .post(
        `${config.apiUrl}/api/deleteproject`,
        {
          project_id: this.props.projectId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + localStorage.getItem("token"),
          },
        }
      )
      .then((res) => {
        history.replace("/projects");
      });
  };

  render() {
    const {activeKey} = this.state;
    return (
      <div>
        <Tabs
          defaultActiveKey="0"
          tabPosition="left"
          onChange={this.handleChangeTab}
          activeKey = {activeKey}
        >
          <TabPane tab="Member" key="0">
            <AdminTabSettingMember {...this.props} />
          </TabPane>
          <TabPane tab="Label" key="1">
            <AdminTabSettingLabel {...this.props} />
          </TabPane>

          {!this.props.isMember && (
            <TabPane tab="Data" key="2">
              <AdminTabSettingData {...this.props} />
            </TabPane>
          )}
          {!this.props.isMember && (
            <TabPane tab="Overview" key="3">
              <AdminTabSettingOverView {...this.props} />
            </TabPane>
          )}
          {!this.props.isMember && (
            <TabPane tab="Export" key="4">
              <AdminTabSettingExport {...this.props} />
            </TabPane>
          )}
          {!this.props.isMember && (
            <TabPane tab={"Delete Project"} key="5">

            </TabPane>
          )}
          {this.props.isMember && (
            <TabPane tab={`Leave Project`} key="6">
            </TabPane>
          )}
        </Tabs>
      </div>
    );
  }
}

export default AdminTabSetting;
