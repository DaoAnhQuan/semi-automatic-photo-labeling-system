import { userConstants } from '../_constants';

export function verify(state = {}, action) {
    switch (action.type) {
        case userConstants.VERIFY_SUCCESS:
            return { verifying: true };
        default:
            return state
    }
}