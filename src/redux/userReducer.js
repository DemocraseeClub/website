export const SET_USER = "SET_USER";
const initialState = {
    data
};

const authReducer = (state = initialState, action) => {
   
    switch (action.type) {
      case SET_USER:
        draft.logInError = false;
        draft.loading = true;
        return draft;
     
      default:
        return draft;
    }
  };
  
  export default authReducer;
