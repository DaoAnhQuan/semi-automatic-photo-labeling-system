import React, { Component } from "react";
import { Tabs, Typography, Breadcrumb, Button, message } from "antd";
import MemberTabReview from "./components/MemberTabReview";
import MemberTabSetting from "./MemberTabSetting";
import MemberTabOverView from "./components/MemberTabOverView";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import AdminTabSetting from "../admin/AdminTabSetting";
import axios from "axios";
const { TabPane } = Tabs;
const { Title } = Typography;

function callback(key) {
  console.log(key);
}

class MemberProjectDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: props.project.id,
      project_name: props.project.project_name,
      description: props.project.description,
      user: JSON.parse(localStorage.getItem("user")),
      startImg: null,
      startReview: null,
    };
  }
  changeInfo = (project_name, description) => {
    this.setState({
      project_name: project_name,
      description: description,
    });
  };
  changeStartImg = (startImg) => {
    this.setState({
      startImg: startImg,
    });
  };
  componentDidMount() {
    axios
      .get(
        `http://localhost:8000/api/listImage/${
          this.state.projectId
        }?completed=${false}&user=${this.state.user.id}`
      )
      .then((res) => {
        const listIds = res.data.map((image) => image.id);
        this.setState({
          startImg: listIds[0],
        });
        // console.log(this.state.listIds);
        console.log(this.state.user.id);
      });
    axios
      .get(
        `http://localhost:8000/api/listImage/${
          this.state.projectId
        }?completed=${true}&user=${this.state.user.id}`
      )
      .then((res) => {
        const listIds = res.data.map((image) => image.id);
        this.setState({
          startReview: listIds[0],
        });
        // console.log(this.state.listIds);
        console.log(this.state.user.id);
      });
  }
  render() {
    return (
      <div style={{ paddingLeft: "22vh", paddingRight: "22vh" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>
            <Link to="/">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/projects">Projects</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{this.props.project.project_name}</Breadcrumb.Item>
        </Breadcrumb>
        <div className="project-detail">
          <Row>
            <Col span={8}>
              <Title level={2}>{this.props.project.project_name}</Title>
              <Title level={4}>{this.props.project.description}</Title>
            </Col>
            <Col span={8} offset={8}>
              <Button style={{ float: "right" }} type="primary">
                {/* <Link
                                    to={`/label/${this.state.projectId}/${this.state.startImg}`}
                                >
                                    Start Labeling
                                </Link> */}
                <Link
                  to={
                    this.state.startImg
                      ? `/label/${this.state.projectId}/${this.state.startImg}`
                      : "#"
                  }
                  onClick={() => {
                    if (!this.state.startImg) {
                      message.warning("No image");
                    }
                  }}
                >
                  Start Labeling
                </Link>
              </Button>
              <Button
                style={{ float: "right", marginRight: "10px" }}
                type="primary"
              >
                <Link
                  to={`/review/${this.state.projectId}/${this.state.startReview}`}
                >
                  Review
                </Link>
              </Button>
            </Col>
          </Row>
          <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="Over View" key="1">
              <MemberTabOverView projectId={this.props.project.id} />
            </TabPane>
            <TabPane tab="Review" key="2">
              <MemberTabReview
                projectId={this.state.projectId}
                user={this.state.user}
              />
            </TabPane>
            <TabPane tab="Setting" key="3">
              <AdminTabSetting
                projectId={this.state.projectId}
                isMember={true}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default MemberProjectDetail;
