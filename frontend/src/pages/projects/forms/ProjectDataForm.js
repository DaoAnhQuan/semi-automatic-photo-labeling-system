import React, { Component } from "react";
import { Upload, Button, Col, Row, List, Tag } from "antd";
import {DeleteOutlined, UploadOutlined} from "@ant-design/icons";
import { Form } from "antd";
import InfiniteScroll from 'react-infinite-scroller';

class ProjectDataForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: this.props.fileList,
            total:this.props.fileList.length,
            check_total:true,
        };
        this.handleChange = this.handleChange.bind(this);
        this.beforeUpload = this.beforeUpload.bind(this);
        this.onUploadClick = this.onUploadClick.bind(this);
    }

    handleChange = (info) => {
        let fileList = [...info.fileList];
        this.setState({
            fileList: fileList,
        });
        this.props.handleChange("fileList", fileList);
    };

    onUploadClick(){
        this.setState({
            check_total:true
        })
    }


    deleteItem(item){
        let i = 0;
        for (;i<this.state.fileList.length;i++){
            if (this.state.fileList[i]===item){
                let file_list = this.state.fileList;
                file_list.splice(i,1);
                this.setState({
                    fileList:file_list,
                    total:this.state.total-1,
                })
                this.props.handleChange("fileList", file_list);
                break;
            }
        }
    }

    beforeUpload = (file, fileList) => {
        if (this.state.check_total){
            this.setState({
                total:this.state.total+fileList.length,
                check_total:false
            })
        }
    }

    render() {
        const { fileList } = this.props;
        const layout = {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        };

        const props_1 = {
            action: "",
            listType: "picture",
            fileList: fileList,
        };
        
        return (
            <div>
                <Row style={{ paddingTop: 10 + 'vh' }}>
                    <Col span={4} offset={6}>
                        <Upload
                            multiple={true}
                            {...props_1}
                            onChange={this.handleChange}
                            showUploadList={false}
                            beforeUpload={this.beforeUpload}
                        >
                            <Button onClick={this.onUploadClick}>
                                <UploadOutlined />
                                Click to Upload
                            </Button>
                        </Upload>
                    </Col>
                    <Col span={2} offset={6}>
                        <Tag color="green" style={{width:"100%",height: "100%",display:"flex",alignItems:"center",justifyContent:"center" }}>Total: {this.state.total} </Tag>
                    </Col>
                </Row>
                <Row style={{marginTop:"30px", marginBottom:"10px"}}>
                    <Col span={12} offset={6} style={{overflow:"auto",maxHeight:"300px"}}>
                        <List
                            size="small"
                            bordered
                            dataSource = {this.state.fileList}
                            renderItem ={item => <List.Item
                                actions={[<Button
                                    shape = "circle"
                                    icon = {<DeleteOutlined/>}
                                    onClick={()=>this.deleteItem(item)}
                                />]}
                            >
                                {item.name}
                            </List.Item>}
                        >
                        </List>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ProjectDataForm;
