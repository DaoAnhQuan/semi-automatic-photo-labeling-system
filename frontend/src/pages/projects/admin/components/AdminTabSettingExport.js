import React from "react";
import { Table, Button, Input, Row, Col, Popover, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { Popconfirm } from "antd";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import { DownloadFile } from "../download/DownloadFile";

const { Search } = Input;
const columns = [
  {
    title: "Photo",
    dataIndex: "photo",
  },
  {
    title: "Date",
    dataIndex: "date",
  },
  {
    title: "Labeler",
    dataIndex: "labeler",
    render: (text) => <a>{text}</a>,
  },
  {
    title: "Status",
    dataIndex: "stt",
  },
];

class AdminTabSettingExport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // Check here to configure the default column
      loading: false,
      image_list: [],
      projectId: this.props.projectId,
      user: JSON.parse(localStorage.getItem("user")),
      isExported: false,
    };
  }

  componentDidMount() {
    axios
      .get(
        `http://localhost:8000/api/listImage/${
          this.state.projectId
        }?completed=${true}&user=${-1}`
      )
      .then((res) => {
        const image_list = res.data;
        this.setState({ image_list });
        console.log(image_list);
      });
  }

  start = () => {
    this.setState({ loading: true });
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  };

  onSelectChange = (selectedRowKeys) => {
    const { image_list } = this.state;
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys });
    selectedRowKeys.map((idx) => {
      console.log(image_list[idx]);
    });
  };

  handleExport = async () => {
    const { selectedRowKeys, image_list } = this.state;
    const images = [];
    if (selectedRowKeys.length == 0) {
      message.warning("please choose at lease one image! ");
      return;
    }
    selectedRowKeys.map((idx) => {
      images.push(image_list[idx].id);
    });
    await fetch(`http://localhost:8000/api/export/${this.state.projectId}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images }),
    }).then((res) => {
      console.log(res);
      this.setState({
        isExported: true,
      });
      message.success("export successfully!");
    });
  };

  render() {
    const { selectedRowKeys, image_list } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const Download = this.state.isExported ? (
      <Button
        href="http://localhost:8000/image/headsets/datasets.zip"
        style={{ float: "right" }}
        type="primary"
        onClick={() => {
          this.setState({
            isExported: false,
          });
        }}
      >
        download
      </Button>
    ) : null;
    const data = [];
    for (let i = 0; i < image_list.length; i++) {
      let image = image_list[i];
      data.push({
        key: i,
        photo: image.name,
        date: image.uploaded_at,
        labeler: (
          <Popover content={image.labeler.member.email} trigger="hover">
            {image.labeler.member.username}
          </Popover>
        ),
        // checker: "Nguyen Van B",
        stt: image.completed ? "completed" : "incompleted",
      });
    }
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <Row>
          <Col span={6}>
            <Search placeholder="" />
          </Col>
          <Col span={4} offset={14}>
            <Popconfirm
              title="Are you sure？"
              onConfirm={this.handleExport.bind(this)}
            >
              <Button style={{ float: "right" }} type="primary">
                Export
              </Button>
            </Popconfirm>
            {Download}
          </Col>
        </Row>
        <div style={{ marginBottom: 8 }}>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
          </span>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          loading={this.state.image_list.length < 1 ? true : false}
        />
      </div>
    );
  }
}

export default AdminTabSettingExport;
