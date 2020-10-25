import React, { Component } from "react";
import { Result, Button } from 'antd';

class Error500 extends Component {
    render() {
        return (
            <Result
                style={{ backgroundColor: '#fff', maxHeight: '74vh' }}
                status="500"
                title="500"
                subTitle="Sorry, something went wrong."
                extra={<Button type="primary">Back Home</Button>}
            />
        );
    }
}

export default Error500;
