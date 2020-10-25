import React from "react";
import { Table, Tag, Col, Row, Input, Divider, Button, Radio } from "antd";
import axios from "axios";
const { Search } = Input;
const columns = [
  {
    title: "Photo",
    dataIndex: "photo",
    key: "photo",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Labeler",
    dataIndex: "labeler",
    key: "labeler",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "No. Like",
    key: "like",
    dataIndex: "like",
    render: (text) => {
      return <a>{text}</a>;
    },
  },
  {
    title: "No. Dislike",
    key: "dislike",
    dataIndex: "dislike",
    render: (text) => {
      return <a>{text}</a>;
    },
  },
];

const data = [
  {
    key: "1",
    photo: "Photo1",
    labeler: "Nguyen Van A",
    time: "20/02/2020",
    stt: ["accepted"],
  },
  {
    key: "2",
    photo: "Photo1",
    labeler: "Nguyen Van A",
    time: "20/02/2020",
    stt: ["rejected"],
  },
  {
    key: "3",
    photo: "Photo1",
    labeler: "Nguyen Van A",
    time: "20/02/2020",
    stt: ["pending"],
  },
];
class MemberTabReview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listImage: [],
    };
  }
  componentDidMount() {
    axios
      .get(
        `http://localhost:8000/api/listImage/${
          this.props.projectId
        }?completed=${true}&user=${-1}`
      )
      .then((res) => {
        this.setState({
          listImage: res.data,
        });
        console.log(this.state.listImage);
      });
  }

  render() {
    const data = [];
    this.state.listImage.map((image, idx) => {
      data.push({
        key: idx,
        photo: image.name,
        labeler: image.labeler.member.username,
        like: image.checker[0],
        dislike: image.checker[1],
      });
    });
    return (
      <div>
        <Row>
          <Col span={8}>
            <Search placeholder="" />
          </Col>
          {/* <Col offset={1}>
                        <Radio.Group>
                            <Radio.Button value="all">ALL</Radio.Button>
                            <Radio.Button value="pending">PENDING</Radio.Button>
                            <Radio.Button value="accepted">ACCEPTED</Radio.Button>
                            <Radio.Button value="rejected">REJECTED</Radio.Button>
                        </Radio.Group>
                    </Col> */}
        </Row>

        <Divider />
        <Table columns={columns} dataSource={data} />
      </div>
    );
  }
}

export default MemberTabReview;
