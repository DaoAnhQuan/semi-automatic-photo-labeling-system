import { userConstants } from '../_constants';
import { userService } from '../_services';
import { alertActions } from './';
import { history } from '../_helpers';

export const userActions = {
    login,
    logout,
    register,
    verify,
    updateProfile,
    reSendVerifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfileStartLoading
};

function login(email, password) {
    return dispatch => {
        localStorage.removeItem('token');
        let apiEndpoint = 'api/login';
        let payload = {
            email: email,
            password: password
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                        dispatch(success(response.data.user));
                        dispatch(alertActions.success('Logged in successfully'))
                        history.push('/projects');
                    }
                }
            }).catch(error => {
                if (error.response.data.error !== undefined) {
                    dispatch(alertActions.error(error.response.data.error.toString()));
                    if (error.response.data.error == "Account isn't verified") {
                        history.replace('/verify');
                    }
                }
                if (error.response.data.email !== undefined) {
                    dispatch(alertActions.error(error.response.data.email.toString()));
                }
            })
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

function register(user) {
    return dispatch => {
        let apiEndpoint = 'api/register';
        let payload = {
            email: user.email,
            username: user.username,
            password: user.password
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    dispatch(alertActions.success('Check your email to verify your account'))
                    history.push('/verify');
                }
            }).catch(error => {
                console.log(error.response.data);
                if (error.response.data.error !== undefined) {
                    dispatch(alertActions.error(error.response.data.error.toString()));
                }
                if (error.response.data.email !== undefined) {
                    dispatch(alertActions.error(error.response.data.email.toString()));
                }
                if (error.response.data.password !== undefined) {
                    dispatch(alertActions.error(error.response.data.password.toString()));
                }
            })
    };
}

function verify(id, confirmation_code) {
    return dispatch => {
        let apiEndpoint = 'api/check_confirmation';
        let payload = {
            id: id,
            confirmation_code: confirmation_code
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    dispatch(alertActions.success('The account has been verified'));
                }
            }).catch(error => {
                if (error.response.data.res !== undefined) {
                    dispatch(alertActions.error(error.response.data.res.toString()));
                }
            })
    };
}

function reSendVerifyEmail(email) {
    return dispatch => {
        let apiEndpoint = 'api/resend_confirmation_email';
        let payload = {
            email: email
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    dispatch(alertActions.success('Check your email to verify your account'));
                    dispatch(success());
                }
            }).catch(error => {
                if (error.response.data.res !== undefined) {
                    dispatch(alertActions.error(error.response.data.res.toString()));
                }
                if (error.response.data.email !== undefined) {
                    dispatch(alertActions.error(error.response.data.email.toString()));
                }
            })
    };
    function success() { return { type: userConstants.VERIFY_SUCCESS } }
}

function forgotPassword(email) {
    return dispatch => {
        let apiEndpoint = 'api/sendresetpasswordcode';
        let payload = {
            email: email
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    dispatch(alertActions.success('Check your email to reset password'));
                }
            }).catch(error => {
                console.log(error.response.data)
                if (error.response.data.res !== undefined) {
                    dispatch(alertActions.error(error.response.data.res.toString()));
                }
                if (error.response.data.email !== undefined) {
                    dispatch(alertActions.error(error.response.data.email.toString()));
                }
            })
    };
}

function resetPassword(id, reset_password_code, password) {
    return dispatch => {
        let apiEndpoint = 'api/resetpassword';
        let payload = {
            id: id,
            reset_password_code: reset_password_code,
            password: password,
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    dispatch(alertActions.success('Password change successfully'));
                    history.push('/login');
                }
            }).catch(error => {
                if (error.response.data.res !== undefined) {
                    dispatch(alertActions.error(error.response.data.res.toString()));
                }
                if (error.response.data.password !== undefined) {
                    dispatch(alertActions.error(error.response.data.password.toString()));
                }
            })
    };
}

function updateProfile(username, organization) {
    return dispatch => {
        let apiEndpoint = 'api/updateuserprofile';
        let payload = {
            username: username,
            organization: organization
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    dispatch(success(response.data.user));
                    dispatch({type: userConstants.UPDATE_PROFILE_END_LOADING});
                    dispatch(alertActions.success('Update profile successfully'));
                }
            }).catch(error => {
                console.log(error.response.data)
            })
    };
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
}

function updateProfileStartLoading(){
    return dispatch=>dispatch({type: userConstants.UPDATE_PROFILE_START_LOADING});
}

function changePassword(old_password, new_password) {
    return dispatch => {
        let apiEndpoint = 'api/changepassword';
        let payload = {
            old_password: old_password,
            new_password: new_password
        }
        userService.post(apiEndpoint, payload)
            .then(response => {
                if (response !== undefined) {
                    dispatch({type:userConstants.UPDATE_PROFILE_END_LOADING})
                    dispatch(alertActions.success('Password change successfully'));
                }
            }).catch(error => {
                dispatch({type:userConstants.UPDATE_PROFILE_END_LOADING})
                if (error.response.data.res !== undefined) {
                    dispatch(alertActions.error(error.response.data.res.toString()));
                }
                if (error.response.data.new_password !== undefined) {
                    dispatch(alertActions.error(error.response.data.new_password.toString()));
                }
                if (error.response.data.old_password !== undefined) {
                    dispatch(alertActions.error(error.response.data.old_password.toString()));
                }
            })
    };
}
