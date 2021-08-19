import React from 'react';
import { StatusBar } from 'react-native';
const CONSTANTS = require('../../utils/CONSTANTS');
const AppStatusBar = () => {
    return (
        <StatusBar
            barStyle='dark-content'
            backgroundColor={CONSTANTS.COLORS.PRIMARY}
        />
    )
}
export { AppStatusBar };