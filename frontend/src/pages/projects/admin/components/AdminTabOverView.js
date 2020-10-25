import React, { Component } from "react";
import { Card, Row, Col, Typography, Progress } from "antd";
import axios from "axios";
import config from "../../../../config/config";

const { Title } = Typography;
class AdminTabOverView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      member: "",
      image: "",
      label: "",
      submitted: "",
      availabel: "",
    };
  }

  componentDidMount() {
    axios
      .post(
        `${config.apiUrl}/api/overviewadmin`,
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
      .then((response) => {
        if (response !== undefined) {
          this.setState({
            member: response.data.member,
            image: response.data.image,
            label: response.data.label,
            submitted: response.data.submitted,
            availabel: response.data.available,
          });
        }
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }

  render() {
    const { member, image, label, submitted, availabel } = this.state;
    return (
      <div style={{ textAlign: "center" }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card title="Member" bordered={true}>
              <Title style={{ color: "#40a9ff" }}>{member}</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Image" bordered={true}>
              <Title style={{ color: "#40a9ff" }}>{image}</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Label" bordered={true}>
              <Title style={{ color: "#40a9ff" }}>{label}</Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Complete" bordered={true}>
              <Title style={{ color: "#40a9ff" }}>
                {availabel + submitted != 0
                  ? ((submitted * 100) / (availabel + submitted)).toFixed(2)
                  : "0.00"}{" "}
                %
              </Title>
            </Card>
          </Col>
        </Row>
        <br />
        <br />
        <br />
        <br />
        <Row>
          <Col offset={2} span={6}>
            <Title level={4}>Labelling Progress</Title>
          </Col>
          <Col offset={1} span={13}>
            <Progress
              percent={Number(
                ((submitted * 100) / (availabel + submitted)).toFixed(2)
              )}
            />
          </Col>
        </Row>
        <br />
      </div>
    );
  }
}

export default AdminTabOverView;
