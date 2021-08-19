import React, { useRef } from 'react';
import strings from '../../Language';
import { Text, View } from 'react-native';
const CONSTANTS = require('../../utils/CONSTANTS');
const AppText = ({
    fref = null,
    text,
    fontSize = CONSTANTS.FONT_SIZES.NORMAL,
    color = CONSTANTS.COLORS.WHITE,
    customStyle = null
}) => {

    let _ref = null
    if (fref != null) {
        _ref = useRef(null)
        fref(_ref)
    }

    if (_ref) {
        return (
            <View>
                <Text
                    ref={_ref}
                    style={[{
                        fontSize,
                        color,
                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                        fontWeight: '400',
                    }, customStyle]}>
                    {text}
                </Text>
            </View>
        )
    }
    return (
        <Text
            style={[{
                fontSize,
                color,
                fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                fontWeight: '400',
            }, customStyle]}>
            {text}
        </Text>
    )
}

export { AppText };