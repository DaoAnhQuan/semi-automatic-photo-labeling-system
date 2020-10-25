export function projects(state = {}, action) {
    switch (action.type) {
        case 'SET_PROJECT':
            return {
                ...state,
                project: action.project
            }
        default:
            return state
    }
}