import React from 'react';
import { enquireScreen } from 'enquire-js';

import Banner1 from './Banner1';
import Content11 from './Content11';
import Teams3 from './Teams3';

import {
    Banner10DataSource,
    Content110DataSource,
    Teams30DataSource,
} from './data.source';
import './less/antMotionStyle.less';

let isMobile;
enquireScreen((b) => {
    isMobile = b;
});

const { location = {} } = typeof window !== 'undefined' ? window : {};

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMobile,
            show: !location.port,
        };
    }

    componentDidMount() {
        enquireScreen((b) => {
            this.setState({ isMobile: !!b });
        });
        if (location.port) {
            setTimeout(() => {
                this.setState({
                    show: true,
                });
            }, 500);
        }
    }

    render() {
        const children = [
            <Banner1
                id="Banner1_0"
                key="Banner1_0"
                dataSource={Banner10DataSource}
                isMobile={this.state.isMobile}
            />,
            <Content11
                id="Content11_0"
                key="Content11_0"
                dataSource={Content110DataSource}
                isMobile={this.state.isMobile}
            />,
            <Teams3
                id="Teams3_0"
                key="Teams3_0"
                dataSource={Teams30DataSource}
                isMobile={this.state.isMobile}
            />,
        ];
        return (
            <div
                className="templates-wrapper"
                ref={(d) => {
                    this.dom = d;
                }}
            >
                {this.state.show && children}
            </div>
        );
    }
}
