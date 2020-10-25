import React from "react";
import { Route, Redirect } from "react-router-dom";
import config from "../config/config";
import Axios from "axios";
import AdminProjectDetail from "../pages/projects/admin/AdminProjectDetail";
import MemberProjectDetail from "../pages/projects/member/MemberProjectDetail";
import Error403 from "../pages/errors/Error403";
import { Spin, Alert } from "antd";

class ProjectRidirect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      project: "",
    };
  }

  componentDidMount() {
    Axios.get(`${config.apiUrl}/api/projectdetail`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      },
      params: {
        project_id: this.props.match.params.id,
      },
    })
      .then((res) => {
        this.setState({
          project: res.data.project,
        });
      })
      .catch((err) => {
        this.setState({
          project: {
            role: -1,
          },
        });
      });
  }

  render() {
    console.log(this.state.project);
    return this.state.project === "" ? (
      <div className="spin-project">
        <Spin />
      </div>
    ) : this.state.project.role === 1 ? (
      <AdminProjectDetail
        project={this.state.project}
      />
    ) : this.state.project.role === 0 ? (
      <MemberProjectDetail project={this.state.project} />
    ) : (
      <Error403 />
    );
  }
}

export default ProjectRidirect;
