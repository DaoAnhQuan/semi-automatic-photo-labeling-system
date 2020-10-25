import { combineReducers } from 'redux';
import { authentication } from './authentication.reducer';
import { registration } from './registration.reducer';
import { users } from './users.reducer';
import { alert } from './alert.reducer';
import { verify } from './verify.reducer';
import {projects} from './project.reducer';

const rootReducer = combineReducers({
  authentication,
  registration,
  alert,
  verify,
  users,
  projects,
});

export default rootReducer;