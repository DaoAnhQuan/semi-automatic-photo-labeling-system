import React, {useEffect, useRef, useState} from "react";
import {
  Table,
  Input,
  Button,
  Space,
  AutoComplete,
  Modal,
  Row,
  Col,
  Form,
  message,
} from "antd";
import axios from "axios";
import DynamicFieldSet from "../components/AddMemberForm";
import config from "../../../../config/config";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import {history} from "../../../../_helpers";

const { Search } = Input;

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


const ModalForm = ({ visible, onCancel, members }) => {
  const [form] = Form.useForm();
  const [options, setOptions] = useState([]);
  const [email,setEmail] = useState("");
  const [loading,setLoading] = useState(false);

  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = async () => {
    setLoading(true);
    await axios.post(`${config.apiUrl}/api/checkmemberexists`,{
      email:email
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      }
    }).then(res=>{
      form.submit();
      setOptions([]);
      setLoading(false);
    }).catch(err=>{
      console.log(err.response.data);
      message.error("This email does not exist!");
      setLoading(false);
    })
  };

  const onSearch = (data) =>{
    setEmail(data.toString().trim());
    if (data.toString().length>4){
      axios.get(`${config.apiUrl}/api/findmember`,{
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + localStorage.getItem("token"),
        },
        params: {
          keyword:data
        }
      }).then((res)=>{
        let options = [];
        for (let user of res.data.members){
          options.push({value:user.email});
        }
        setOptions(options);
      })
    }else{
      setOptions([]);
    }
  }

  const onSelect = (value, option)=>{
    setEmail(value);
  }

  return (
      <Modal title="Add Member" visible={visible} onOk={onOk} onCancel={onCancel} okButtonProps={{loading}}>
        <Form form={form} layout="vertical" name="userForm">
          <Form.Item
              name="email"
              label="User Email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  required: true,
                  message: "Please input member E-mail!",
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    for (let member of members){
                      if (member === value){
                        return Promise.reject('This member has already been added!');
                      }
                    }
                    return Promise.resolve();
                  },
                })
              ]}
              validateFirst = {true}

          >
            <AutoComplete
                options = {options}
                onSearch = {onSearch}
                onSelect = {onSelect}
                placeholder = "Member email"
            />
          </Form.Item>
        </Form>
      </Modal>
  );
};

class AdminTabSettingMember extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    modalVisible: false,
    members: [],
    projectId: this.props.projectId,
    loading: false,
    addMembers: [],
    dataSource: [],
    nameSearch: "",
    tableData:[],
    rowsSelected:[],
    admin:null,
    memberEmail:[],
  };
  async refetch() {
    this.setState({
      loading: true,
    })
    await axios
      .get(`http://localhost:8000/api/memberList/${this.state.projectId}`)
      .then((res) => {
        const members = res.data.data;
        this.setState({ members });
        this.setState({
          dataSource: members.map((member) =>{
            return {
              key:member.id,
              name: member.name,
              email: member.email,
              num_photo: member.num_photo
            }
          }),
          loading:false,
          admin:res.data.admin,
          memberEmail:members.map((member) =>member.email),
        });
      });
  }

  handleChange(state_name, state_value) {
    this.setState({
      [state_name]: state_value,
    });
  }

  componentDidMount() {
    this.refetch();
  }

  handleOnDelete = ()=>{
    this.setState({
      loading: true,
    })
    axios.post(`${config.apiUrl}/api/deletemembers`,{
      members:this.state.rowsSelected,
    },{
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + localStorage.getItem("token"),
      },
    }).then((res)=>{
      this.refetch();
    })
  }

  confirm = () => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: "Do you want to delete these members?",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        this.handleOnDelete();
      },
      okButtonProps:{
        loading:this.state.loading
      }
    });
  };

  setModalVisible(modalVisible) {
    this.setState({ modalVisible });
  }

  rowSelection = !this.props.isMember?{
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        rowsSelected:selectedRowKeys,
      });
    },
    getCheckboxProps: record => ({
      disabled: record.key === this.state.admin, // Column configuration not to be checked
    }),
  }:null;

  onCancel = () => this.setModalVisible(false);

  render() {
    const columns = [
      {
        title: "Member",
        dataIndex: "name",
      },
      {
        title: "Email",
        dataIndex: "email",
      },
      {
        title: "Number Image",
        dataIndex: "num_photo",
      }
    ];

    const { members, dataSource } = this.state;

    return (
      <div>
        <Row>
          <Col span={6}>
            <AutoComplete dataSource={members.map((member) => member.name)}>
              <Input.Search
                placeholder="Member name"
                allowClear
                onSearch={(nameSearch) =>
                  this.setState({
                    dataSource: members.filter((member) =>
                      member.name.includes(nameSearch) || member.email.includes(nameSearch)
                    ).map((member) =>{
                      return {
                        key:member.id,
                        name: member.name,
                        email: member.email,
                        num_photo: member.num_photo
                      }
                    }),
                  })
                }
              />
            </AutoComplete>
          </Col>
          {!this.props.isMember && (
              <div style={{display:"contents"}}>
                <Col span={4} offset={10}>
                  <Button
                      style={{ float: "right" }}
                      type="primary"
                      onClick={this.confirm}
                      disabled={this.state.rowsSelected.length<1}
                  >
                    Delete
                  </Button>
                </Col>
                <Col span={4}>
                  <Button
                      style={{ float: "right" }}
                      type="primary"
                      onClick={() => this.setModalVisible(true)}
                  >
                    Add new member
                  </Button>
                </Col>
              </div>
          )}
        </Row>
        <br />
        <Table
            rowSelection={this.rowSelection}
            columns={columns}
            dataSource={dataSource}
            loading={this.state.loading}
        />
        <Form.Provider
            onFormFinish={(name, { values, forms })=>{
              this.setState({loading: true});
              this.setModalVisible(false);
              axios
                  .post(
                      `http://localhost:8000/api/createmembers`,
                      {
                        project_id: this.state.projectId,
                        members: [values.email],
                      },
                      {
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Token ${localStorage.getItem("token")}`,
                        },
                      }
                  )
                  .then((res) => {
                    this.refetch();
                  })
                  .catch((err) => {
                    console.log(err);
                  });
            }}
        >
          <ModalForm
              visible={this.state.modalVisible}
              onCancel={this.onCancel}
              members={this.state.memberEmail}
          />
        </Form.Provider>
        {/*<Modal*/}
        {/*  title="Add new member"*/}
        {/*  centered*/}
        {/*  visible={this.state.modalVisible}*/}
        {/*  footer={[]}*/}
        {/*  destroyOnClose={true}*/}
        {/*  onCancel={() => this.setModalVisible(false)}*/}
        {/*>*/}
        {/*  <DynamicFieldSet*/}
        {/*    handleChange={this.handleChange.bind(this)}*/}
        {/*    setModalVisible={this.setModalVisible.bind(this)}*/}
        {/*    addMembers={this.state.addMembers}*/}
        {/*    projectId={this.state.projectId}*/}
        {/*    refetch={this.refetch.bind(this)}*/}
        {/*  />*/}
        {/*</Modal>*/}
      </div>
    );
  }
}

export default AdminTabSettingMember;
