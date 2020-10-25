import React, { Component } from 'react';
import { Button, Input, List, Avatar, Breadcrumb } from 'antd';
import { SearchOutlined, MessageOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons';
import { Row, Col, Divider } from 'antd';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import config from '../../config/config';
import { Pagination } from 'antd';
import { connect } from 'react-redux';

class ProjectList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,
            total: "",
            projects: [],
            keyword: "",
            loading: true
        };
        this.onChange = this.onChange.bind(this)
        this.getProject = this.getProject.bind(this)
        this.searchProject = this.searchProject.bind(this)

    }
    async searchProject(e) {
        await this.setState({
            current: '1',
            keyword: e.target.value,
            loading:true
        });
        this.getProject('api/findproject');
        if (this.state.keyword === "") {
            this.getProject('api/projectlist');
        }
    }

    onChange = page => {
        this.setState({
            current: page,
        });
    };

    componentDidMount() {
        let apiEndpoint = 'api/projectlist'
        this.getProject(apiEndpoint)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.current !== this.state.current) {
            if (this.state.keyword) {
                this.getProject('api/findproject')
            } else {
                this.getProject('api/projectlist')
            }
        }
    }

    getProject(apiEndpoint) {
        let token = "Token " + localStorage.getItem('token');
        Axios.get(`${config.apiUrl}/${apiEndpoint}`,
            {
                params: {
                    page: this.state.current,
                    keyword: this.state.keyword
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            }).then(response => {
                if (response !== undefined) {
                    if (response) {
                        this.setState({
                            total: response.data.total,
                            projects: response.data.projects,
                            loading:false
                        });
                    }
                }
            }).catch(error => {
                console.log(error)
            })
    }

    render() {
        return (
            <div style={{ paddingLeft: "22vh", paddingRight: "22vh"}}>
                <Breadcrumb style={{ margin: "16px 0" }}>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        Projects
                    </Breadcrumb.Item>

                </Breadcrumb>
                <div className="project-list">
                    <div>
                        <Row>
                            <Col span={8}>
                                <Input placeholder="Search project" name="keyword" onChange={this.searchProject} prefix={<SearchOutlined />} />
                            </Col>
                            <Col span={4} offset={12}>
                                <Button style={{ float: 'right' }} type="primary">
                                    <Link to='/projects/new'>New project</Link>
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    <div style={{ paddingTop: "24px", paddingBottom: "24px" }}>
                        <List
                            dataSource={this.state.projects}
                            renderItem={item => (
                                <List.Item key={item.id}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                                        }
                                        title={<Link to={item.href}>{item.project_name}</Link>}
                                        description={item.description}
                                    />
                                    <div>
                                        <p>{item.created_date}</p>
                                        <p> {item.created_by.username}</p>
                                    </div>
                                </List.Item>
                            )}
                            loading={this.state.loading}
                        >
                        </List>
                    </div>
                    <Pagination hideOnSinglePage current={this.state.current} onChange={this.onChange} total={this.state.total} />
                </div>
            </div>
        );
    }
}


export default ProjectList;
