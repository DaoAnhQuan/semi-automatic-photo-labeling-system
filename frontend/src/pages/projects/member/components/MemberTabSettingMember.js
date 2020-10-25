import React from "react";
import { Table, Input, Divider, Row, Col } from "antd";

const { Search } = Input;

const columns = [
    {
        title: "Team member",
        dataIndex: "mem",
        render: (text) => <a>{text}</a>,
    },
    {
        title: "Email",
        dataIndex: "email",
        render: (text) => <a>{text}</a>,
    },
    {
        title: "Labels",
        dataIndex: "label",
    },
];
const data = [
    {
        key: "1",
        mem: "Dao Anh Quan",
        email: "quan.da@gmail.com",
        label: 150,
    },
    {
        key: "1",
        mem: "Dao Anh Quan",
        email: "quan.da@gmail.com",
        label: 150,
    },
    {
        key: "1",
        mem: "Dao Anh Quan",
        email: "quan.da@gmail.com",
        label: 150,
    },
    {
        key: "1",
        mem: "Dao Anh Quan",
        email: "quan.da@gmail.com",
        label: 150,
    },
];

class MemberTabSettingMember extends React.Component {
    state = {
        modalVisible: false,
    };

    setModalVisible(modalVisible) {
        this.setState({ modalVisible });
    }
    render() {
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <Search
                            placeholder=""
                        />
                    </Col>
                </Row>
                <br />
                <Table columns={columns} dataSource={data} />
            </div >
        );
    }
}

export default MemberTabSettingMember;
