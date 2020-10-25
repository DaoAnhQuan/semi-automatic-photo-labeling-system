import React, { useState } from "react";
import { Table, Button, Input, Row, Col, Modal, Upload, Popover } from "antd";
import { Link } from "react-router-dom";
import {
  DeleteOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
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
  // {
  //   title: "Checker",
  //   dataIndex: "checker",
  //   render: (text) => <a>{text}</a>,
  // },
  {
    title: "Status",
    dataIndex: "stt",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const data = [];
for (let i = 0; i < 5; i++) {
  data.push({
    key: i,
    photo: `Photo1`,
    date: "14/01/2020",
    labeler: "Nguyen Van A",
    checker: "Nguyen Van B",
    stt: "DONE",
    action: (
      <Button>
        <DeleteOutlined />
      </Button>
    ),
  });
}

const props = {
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  onChange({ file, fileList }) {
    if (file.status !== "uploading") {
      console.log(file, fileList);
    }
  },
  defaultFileList: [],
};

class AdminTabSettingData extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    selectedRowKeys: [],
    loading: false,
    modalVisible: false,
    files: [],
    projectId: this.props.projectId,
    images: [],
    user: JSON.parse(localStorage.getItem("user")),
  };

  async refetch() {
    await axios
      .get(
        `http://localhost:8000/api/listImage/${
          this.state.projectId
        }?completed=${null}&user=${-1}`
      )
      .then((res) => {
        const images = res.data;
        this.setState({ images });
        console.log(images);
        console.log(this.state.projectId);
        console.log(this.state.images);
        if (images.length == 0) {
          this.props.changeStartImg(null);
        } else {
          this.props.changeStartImg(images[0].id);
        }
      });
  }
  componentDidMount() {
    this.refetch();
  }

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }

  start = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  };

  onSelectChange = (selectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  ///////////////////////////////////////////////

  handleChange = (event) => {
    console.log(event.target.files);
    this.setState({
      files: event.target.files,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    const File = this.state.files;
    const formData = new FormData();
    for (let i = 0; i < File.length; i++) {
      formData.append(`images[${i}]`, File[i]);
    }

    await axios
      .post(
        `http://localhost:8000/api/upload/${this.state.projectId}`,
        formData,
        {
          headers: {
            "content-type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      });
    this.setModalVisible(false);
    await this.refetch();
  };

  //////////////////////////////////////////////////
  render() {
    const { selectedRowKeys, images, projectId } = this.state;
    console.log(images);
    const data = [];

    const content = (
      <div>
        <p>Content</p>
      </div>
    );
    for (let i = 0; i < images.length; i++) {
      let image = images[i];
      data.push({
        key: i,
        photo: (
          <Link
            to={{
              pathname: `/label/${projectId}/${image.id}`,
            }}
          >
            {image.name}
          </Link>
        ),
        date: image.uploaded_at,
        labeler: (
          <Popover content={image.labeler.member.email} trigger="hover">
            {image.labeler.member.username}
          </Popover>
        ),
        // checker: "Nguyen Van B",
        stt: image.completed ? "completed" : "incompleted",
        action: (
          <Button
            onClick={async () => {
              await axios
                .post(`http://localhost:8000/api/deleteImage/${image.id}`, {
                  headers: {
                    "content-type": "multipart/form-data",
                  },
                })
                .then((response) => {
                  console.log(response.data);
                });
              await this.refetch();
            }}
          >
            <DeleteOutlined />
          </Button>
        ),
      });
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <Row>
          <Col span={6}>
            <Search placeholder="" />
          </Col>
          <Col span={8} offset={10}>
            <Button
              style={{ float: "right" }}
              type="primary"
              onClick={() => this.setModalVisible(true)}
            >
              New image
            </Button>
            <DeleteMulRow
              list_imageId={this.state.images
                .filter((image, id) => {
                  return this.state.selectedRowKeys.indexOf(id) != -1;
                })
                .map((image) => image.id)}
              refetch={this.refetch.bind(this)}
            />
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
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {}, // click row
              onDoubleClick: (event) => {}, // double click row
              onContextMenu: (event) => {}, // right button click row
              onMouseEnter: (event) => {
                console.log(record, rowIndex);
              }, // mouse enter row
              onMouseLeave: (event) => {}, // mouse leave row
            };
          }}
        />
        <Modal
          title="Add new images"
          centered={true}
          visible={this.state.modalVisible}
          footer={[]}
          destroyOnClose={true}
          onCancel={() => this.setModalVisible(false)}
        >
          <form onSubmit={this.handleSubmit}>
            <input
              type="file"
              id="file"
              multiple
              name="file"
              onChange={this.handleChange}
            />
            <button type="submit" className="btn btn-info">
              {" "}
              Update Images{" "}
            </button>
          </form>
        </Modal>
      </div>
    );
  }
}

// Delete Multiple Row
const DeleteMulRow = (props) => {
  const [visible, setVisible] = useState(false);
  const list_imageId = props.list_imageId;
  const confirm = () => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: "Do you want to delete images ?",
      okText: "confirm",
      cancelText: "cancel",
      onOk: async () => {
        // console.log(labelId_list);
        await list_imageId.map(async (imageId) => {
          await axios
            .post(`http://localhost:8000/api/deleteImage/${imageId}`, {
              headers: {
                "content-type": "multipart/form-data",
              },
            })
            .then((response) => {
              console.log(response.data);
            });
        });

        await props.refetch();
      },
    });
  };

  return (
    <div>
      <Button style={{ float: "right", marginRight: "10px" }} onClick={confirm}>
        Delete
      </Button>
    </div>
  );
};

export default AdminTabSettingData;
