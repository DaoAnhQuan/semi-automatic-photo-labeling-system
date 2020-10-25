import React from "react";
import {Tabs, Col, Row, Modal} from "antd";
import MemberTabSettingMember from "./components/MemberTabSettingMember";
import MemberTabSettingLabel from "./components/MemberTabSettingLabel";
import {ExclamationCircleOutlined} from "@ant-design/icons";
import axios from "axios";
import config from "../../../config/config";
import {history} from "../../../_helpers";

const { TabPane } = Tabs;

class MemberTabSetting extends React.Component {


    render() {
        return (
            <div>
                <Tabs
                    defaultActiveKey="0"
                    tabPosition='left'
                >
                    <TabPane tab={`Member`} key="0">
                        <MemberTabSettingMember />
                    </TabPane>
                    <TabPane tab={`Label`} key="1">
                        <MemberTabSettingLabel />
                    </TabPane>
                    <TabPane tab={`Leave Project`} key="3">
                        Content of tab
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default MemberTabSetting;
