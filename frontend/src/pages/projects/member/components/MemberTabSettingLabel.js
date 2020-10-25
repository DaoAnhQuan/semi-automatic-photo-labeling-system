import React from "react";
import { Table, Input, Divider, Row, Col } from "antd";

const { Search } = Input;
const columns = [
    {
        title: "Label",
        dataIndex: "label",
    },
    {
        title: "Count",
        dataIndex: "count",
    },
];

const data = [];
for (let i = 0; i < 10; i++) {
    data.push({
        key: i,
        label: `Dog`,
        count: 40,
    });
}

class MemberTabSettingLabel extends React.Component {
    state = {
        selectedRowKeys: [], // Check here to configure the default column
        loading: false,
        modalVisible: false,
    };
    setModalVisible(modalVisible) {
        this.setState({ modalVisible });
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
        console.log("selectedRowKeys changed: ", selectedRowKeys);
        this.setState({ selectedRowKeys });
    };

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
            </div>
        );
    }
}

export default MemberTabSettingLabel;
