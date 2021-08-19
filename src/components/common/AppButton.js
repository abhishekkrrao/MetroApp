import React from 'react';
import { Button, Text } from 'native-base';
const CONSTANTS = require('../../utils/CONSTANTS');

const AppButton = ({
    text, 
    onPress = null, 
    btnStyle = null,
    height = 50,
    width = '100%',
    shadowColor = CONSTANTS.COLORS.BLACK,
    textStyle = null,
}) => {
    return (
        <Button
            style={[{
                backgroundColor: CONSTANTS.COLORS.PRIMARY2,
                width: width,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
                height: height,
                shadowColor: shadowColor,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.8,
                shadowRadius: 5,
                elevation: 5,
            }, btnStyle]}
            onPress={onPress}>
            <Text
                style={[{
                    color: CONSTANTS.COLORS.WHITE,
                    alignSelf: 'center',
                    fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                    textTransform: 'uppercase',
                    fontWeight: '600',
                }, textStyle]}>
                {text}
            </Text>
        </Button>
    )
}

export { AppButton };