import {createSlice} from '@reduxjs/toolkit';

const progress = createSlice({
    name: 'progress',
    initialState: {
        loading: {},
        notices: {},
        colorMode: process.env.NODE_ENV === 'production' ? 'light' : 'dark',
        sideBarWidth : 0 // window.innerWidth > 900 ? 211 : Math.max(125, Math.round(window.innerWidth / 4)),
    },
    reducers: {
        _setLoader(draft, action) {
            draft.loading[action.key] = action.loading;
        },
        _addNotice(draft, action) {
            draft.notices[action.key] = action.msg;
        },
        dismissNotice(draft, action) {
            delete draft.notices[action.key];
        }
    }
});

const { _setLoader, _addNotice, _dismissNotice } = progress.actions;

export const setLoader = (key, loading) => _setLoader(key, loading);

export const addNotice = (key, msg) => {
    _addNotice(key, msg);
    setTimeout(() => {
        _dismissNotice(key);
    }, 4000)
}

export const dismissNotice = (key) => _dismissNotice(key);

export default progress.reducer;
