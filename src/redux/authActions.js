import {SET_THEME_COLORS} from './authReducer'

export function setThemeMode(mode) {
    return {
        type: SET_THEME_COLORS,
        mode: mode
    };
}
