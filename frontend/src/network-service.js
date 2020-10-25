import axios from 'axios';
import {history} from "./_helpers";
import {userConstants} from "./_constants/user.constants";



export const NetworkService = {
    setupInterceptors: (store) => {

        // Add a response interceptor
        axios.interceptors.response.use(function (response) {
            return response;
        }, function (error) {
            if (error.response.status === 401){
                store.dispatch({type: userConstants.LOGOUT});
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                history.replace('/login');
            }
            return Promise.reject(error);
        });

    }
};