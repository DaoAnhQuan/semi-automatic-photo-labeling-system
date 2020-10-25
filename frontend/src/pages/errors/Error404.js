import React, { Component } from "react";
import { Result, Button } from 'antd';

class Error404 extends Component {
    render() {
        return (
            <Result
                style={{backgroundColor: '#fff', maxHeight: '74vh'}}
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
                extra={<Button type="primary">Back Home</Button>}
            />
        );
    }
}

export default Error404;
