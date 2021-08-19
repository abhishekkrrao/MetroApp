import React from 'react';
import { CustomOverlay } from './CustomOverlay';
import { View } from 'react-native';
import { AppText } from './AppText';
import strings from '../../Language';
import { AppButton } from './AppButton';

const UpgradeModal = ({
    isVisible = false,
    message = "",
    positiveBtnText = "",
    negativeBtnText = "",
    positiveBtnPress = null,
    negativeBtnPress = null,
    disableNegative = false
}) => {
    return (
        <CustomOverlay
            isVisible={isVisible}>
            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '80%',
                    padding: 10,
                }}>
                <AppText
                    text={strings["ALERT!"]}
                    color={CONSTANTS.COLORS.BLACK}
                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                    customStyle={{
                        fontWeight: '100',
                    }}
                />
                <AppText
                    text={message}
                    color={CONSTANTS.COLORS.BLACK}
                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                    customStyle={{
                        fontWeight: '100',
                        textAlign: 'center',
                        marginTop: 20
                    }}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        marginTop: 20,
                    }}>
                    <AppButton
                        text={positiveBtnText}
                        shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                        width={'auto'}
                        textStyle={{
                            fontSize: CONSTANTS.FONT_SIZES.EXTRASMALL,
                            padding: 5,
                        }}
                        btnStyle={{
                            height: 'auto',
                            marginRight: 15,
                        }}
                        onPress={positiveBtnPress}
                    />
                    {!disableNegative && <AppButton
                        text={negativeBtnText}
                        shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                        width={'auto'}
                        textStyle={{
                            fontSize: CONSTANTS.FONT_SIZES.EXTRASMALL,
                            padding: 5,
                        }}
                        btnStyle={{
                            backgroundColor: CONSTANTS.COLORS.BLACK2,
                            height: 'auto',
                            marginLeft: 15,
                        }}
                        onPress={negativeBtnPress}
                    />}
                </View>
            </View>
        </CustomOverlay>
    )
}

export { UpgradeModal };