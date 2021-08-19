import React from 'react';
import { Overlay } from 'react-native-elements';

const CONSTANTS = require('../../utils/CONSTANTS');
const CustomOverlay = ({children, isVisible = false, width = 'auto', borderRadius = 10}) => {
    return (
        <Overlay
            isVisible={isVisible}
            width='100%'
            height='auto'
            overlayBackgroundColor={CONSTANTS.COLORS.WHITE}
            overlayStyle={{
                width: width,
                borderRadius: borderRadius,
            }}
            windowBackgroundColor={CONSTANTS.COLORS.OVERLAYBACKGROUND}>
            {children}
        </Overlay>
    )
}

export { CustomOverlay }