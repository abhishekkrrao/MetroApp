import React from 'react';
import { CustomOverlay } from './CustomOverlay';
import { View } from 'react-native';
import { AppText } from './AppText';
import strings from '../../Language';
import { AppButton } from './AppButton';
import CONSTANTS from '../../utils/CONSTANTS';
import DateTimePicker from 'react-native-modal-datetime-picker';

const DateTimeModal = ({
    isVisible = false,
    onConfirm = null,
    onCancel = null,
    mode = 'date'
}) => {
    return (
        <DateTimePicker
            mode={mode}
            isVisible={isVisible}
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    )
}

export { DateTimeModal };