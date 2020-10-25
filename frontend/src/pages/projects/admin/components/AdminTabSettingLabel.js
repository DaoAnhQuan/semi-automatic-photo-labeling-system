import React, {useEffect, useRef, useState} from "react";
import { Table, Button, Input, Space, Modal, Form, Row, Col } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Popconfirm, message } from "antd";
import config from "../../../../config/config";

const { Search } = Input;
const columnsForAdmin = [
  {
    title: "Label",
    dataIndex: "label",
  },
  {
    title: "Count",
    dataIndex: "count",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];
const columnsForMember = [
  {
    title: "Label",
    dataIndex: "label",
  },
  {
    title: "Count",
    dataIndex: "count",
  },
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

// Delete Multiple Row
const DeleteMulRow = (props) => {
  const [visible, setVisible] = useState(false);
  const labelId_list = props.labelIds;
  const confirm = () => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure?",
      okText: "Yes",
      cancelText: "Cancel",
      onOk: async () => {

        await labelId_list.map(async (labelId) => {
          await axios
              .post(
                  `http://localhost:8000/api/deletelabel`,
                  {
                    label_id: labelId,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                  }
              )
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });
        });
        await props.refetch();
      },
    });
  };

  return (
    <div>
      <Button style={{ float: "right", marginRight: "10px" }} onClick={confirm} disabled={props.disabled}>
        Delete
      </Button>
    </div>
  );
};

const DynamicFieldSet = (props) => {
  const [loading, setLoading] = useState(false);
  const { projectId, labels } = props;
  const onFinish = async (values) => {
    props.handleChange("addLabels", values.names);
    console.log("Received values of form:", Array.from(new Set(values.names)));
    const valuesList = Array.from(new Set(values.names));
    const labelsMap = [];
    labels.map((label) => {
      labelsMap.push(label.label);
    });
    const reuslt = valuesList.filter((label) => labelsMap.indexOf(label) == -1);
    setLoading(true);
    //fetch data here
    await axios
      .post(
        `http://localhost:8000/api/createlabels`,
        {
          project_id: projectId,
          label_list: reuslt,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
    props.setModalVisible(false);
    await props.refetch();
  };

  return (
    <Form
      name="dynamic_form_item"
      {...formItemLayoutWithOutLabel}
      onFinish={onFinish}
      onChange={(props) => {
        console.log(props);
      }}
    >
      <Form.List name="names">
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Form.Item
                  {...(index === 0
                    ? formItemLayout
                    : formItemLayoutWithOutLabel)}
                  label={index === 0 ? "Label" : ""}
                  required={false}
                  key={field.key}
                >
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "Please input label or delete this field.",
                      },
                    ]}
                    noStyle
                  >
                    <Input placeholder="label" style={{ width: "60%" }} />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      style={{ margin: "0 8px" }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  ) : null}
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    add();
                  }}
                  style={{ width: "60%" }}
                >
                  <PlusOutlined /> Add more
                </Button>
              </Form.Item>
            </div>
          );
        }}
      </Form.List>

      <Form.Item>
        <Button
          onClick={() => {
            props.setModalVisible(false);
          }}
          style={{
            marginRight: "10px",
          }}
        >
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

const EditLabelModal = (props) => {
  const [visible, setVisible] = useState(false);
  const [labelName, setLabelName] = useState(props.label);
  const [loading,setLoading] = useState(false);
  const onOk = async (event) => {
    setLoading(true);
    await axios
      .post(
        `http://localhost:8000/api/updatelabel`,
        {
          label_id: props.label.id,
          label_name: labelName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        setLoading(false);
        console.log(res);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err.response.data);
      });
    setVisible(false);
    await props.refetch();
  };
  return (
    <>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        <EditOutlined />
      </Button>
      <Modal
        title="Edit Label"
        visible={visible}
        onOk={onOk}
        onCancel={() => {
          setVisible(false);
        }}
        okButtonProps={{loading}}
      >
        <Input
          name="label"
          label="label"
          defaultValue={props.label.label}
          onChange={(event) => {
            setLabelName(event.target.value);
          }}
        />
      </Modal>
    </>
  );
};

const useResetFormOnCloseModal = ({ form, visible }) => {
  const prevVisibleRef = useRef();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;

  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible]);
};

const ModalForm = ({ visible, onCancel, label_list, loading }) => {
  const [form] = Form.useForm();

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = () => {
    form.submit();
  };


  return (
      <Modal title="Add Label" visible={visible} onOk={onOk} onCancel={onCancel} okButtonProps={{loading}}>
        <Form form={form} layout="vertical" name="userForm">
          <Form.Item name="name" label="Label Name" rules={[
            { required: true, message: "Please input label name!" },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!label_list.includes(value.toString().trim())) {
                  return Promise.resolve();
                }
                return Promise.reject('This label is already existed!');
              },
            }),
          ]}
            validateFirst={true}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
  );
};

class AdminTabSettingLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // Check here to configure the default column
      loading: true,
      modalVisible: false,
      labels: [],
      projectId: this.props.projectId,
      addLabels: [],
      labelNames:[],
      disabled: false
    };
  }

  refetch= ()=> {
    this.setState({
      loading:true,
    })
    axios.get(
      `http://localhost:8000/api/labelList/${this.state.projectId}`
    ).then(res=>{
      this.setState({
        labels: res.data,
        labelNames: res.data.map((item)=>{return item.label}),
        loading: false,
        disabled:res.data.length<2
      });
    }).catch(err=>{
      this.setState({
        labels: [],
        labelNames: [],
        loading: false,
        disabled:true
      });
    });
  }
  async componentDidMount() {
    const response = await axios.get(
      `http://localhost:8000/api/labelList/${this.state.projectId}`
    );

    this.setState({
      loading: false,
    });

    this.setState({
      labels: response.data,
      labelNames: response.data.map((item)=>{return item.label}),
      disabled:response.data.length<2,
    });

  }

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }
  handleChange(state_name, state_value) {
    this.setState({
      [state_name]: state_value,
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

  onFormFinish = (label)=>{
    this.setState({
      loading:true
    })
    axios.post(`${config.apiUrl}/api/addlabel`,{
      label_name:label,
      project_id:this.state.projectId
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      }
    }).then((res) => {
      this.setState({
        loading:false,
      })
      this.setModalVisible(false);
      this.refetch();
    }).catch(err=>{
      this.setState({
        loading:false,
      })
    })
  }

  onSelectChange = (selectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys });
  };
  onOk = () => {
    this.setModalVisible(false);
  };
  onCancel = () => {
    this.setModalVisible(false);
  };

  onDeleteLabel = async (idx) => {
    const label = this.state.labels[idx];
    this.setState({
      loading:true
    })
    await axios
      .post(
        `http://localhost:8000/api/deletelabel`,
        {
          label_id: label.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    await this.refetch();
  };

  render() {
    const { selectedRowKeys } = this.state;

    const rowSelection = !this.props.isMember
      ? {
          selectedRowKeys,
          onChange: this.onSelectChange,
          getCheckboxProps: record => ({
            disabled: record.key === 0, // Column configuration not to be checked
          })
        }
      : null;
    const hasSelected = selectedRowKeys.length > 0;
    const { labels } = this.state;
    console.log(labels);
    const data = [];
    labels.map((label, idx) => {
      data.push({
        key: idx,
        label: label.label,
        count: label.num_shape,
        action: (
          <Space size={10}>
            <EditLabelModal label={label} refetch={this.refetch.bind(this)} />
            <Popconfirm
              title="Are you sure delete this task?"
              onConfirm={() => {
                this.onDeleteLabel(idx);
              }}
              okText="Yes"
              cancelText="No"
              disabled = {this.state.disabled}
            >
              <Button disabled={this.state.disabled}>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Space>
        ),
      });
    });
    if (this.props.isMember) {
      data.map((label, index) => {
        return {
          key: index,
          label: label.label,
          count: label.num_shape,
        };
      });
    }
    const columns = this.props.isMember ? columnsForMember : columnsForAdmin;

    return (
      <div>
        <Row>
          <Col span={6}>
            <Search placeholder="" />
          </Col>
          {!this.props.isMember?(
              <Col span={8} offset={10}>
                <Button
                    style={{ float: "right" }}
                    type="primary"
                    onClick={() => this.setModalVisible(true)}
                >
                  New label
                </Button>
                <DeleteMulRow
                    labelIds={this.state.labels
                        .filter((val, id) => {
                          return selectedRowKeys.indexOf(id) > -1;
                        })
                        .map((label) => label.id)}
                    refetch={this.refetch.bind(this)}
                    disabled={this.state.disabled}
                />
              </Col>
          ):""}
        </Row>
        <div style={{ marginBottom: 8 }}>
          {/*<span style={{ marginLeft: 8 }}>*/}
          {/*  {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}*/}
          {/*</span>*/}
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          loading={this.state.loading}
        />
        <Form.Provider
            onFormFinish={(name, { values, forms })=>{
              this.onFormFinish(values.name);
            }}
        >
          <ModalForm
              visible={this.state.modalVisible}
              onCancel={this.onCancel}
              label_list={this.state.labelNames}
              loading ={this.state.loading}
          />
        </Form.Provider>
        {/*<Modal*/}
        {/*  title="Add new label"*/}
        {/*  centered*/}
        {/*  visible={this.state.modalVisible}*/}
        {/*  onCancel={() => this.setModalVisible(false)}*/}
        {/*  footer={[]}*/}
        {/*  destroyOnClose={true}*/}
        {/*>*/}
        {/*  <DynamicFieldSet*/}
        {/*    handleChange={this.handleChange.bind(this)}*/}
        {/*    addLabels={this.state.addLabels}*/}
        {/*    projectId={this.state.projectId}*/}
        {/*    setModalVisible={this.setModalVisible.bind(this)}*/}
        {/*    refetch={this.refetch.bind(this)}*/}
        {/*    labels={this.state.labels}*/}
        {/*  />*/}
        {/*</Modal>*/}
      </div>
    );
  }
}

export default AdminTabSettingLabel;
