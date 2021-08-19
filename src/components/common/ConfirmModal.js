import React from 'react';
import { CustomOverlay } from './CustomOverlay';
import { Text, TouchableOpacity, View } from 'react-native';
import { AppText } from './AppText';
import CONSTANTS from '../../utils/CONSTANTS';

const ConfirmModal = ({
    isVisible = false,
    title = "",
    message = "",
    positiveBtnText = "",
    negativeBtnText = "",
    positiveBtnPress = null,
    negativeBtnPress = null,
}) => {
    return (
        <CustomOverlay 
            width={'85%'}
            borderRadius={2}
            isVisible={isVisible}>
            <View
                style={{
                    //alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: 10,
                }}>
                <AppText
                    text={title}
                    color={CONSTANTS.COLORS.BLACK}
                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                    customStyle={{
                        fontWeight: '600',
                    }}
                />
                <AppText
                    text={message}
                    color={CONSTANTS.COLORS.BLACK}
                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                    customStyle={{
                        fontWeight: '100',
                        textAlign: 'left',
                        marginTop: 10,
                    }}
                />
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 15,
                    }}>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'flex-start',
                        }}>
                        {/* <AppButton
                            text={negativeBtnText}
                            shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                            textStyle={{
                                fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                color: '#39ac73'
                            }}
                            btnStyle={{
                                height: 'auto',
                                backgroundColor: CONSTANTS.COLORS.RED,
                            }}
                            onPress={negativeBtnPress}
                        /> */}
                        <TouchableOpacity
                            onPress={negativeBtnPress}>
                            <Text
                                style={styles.textStyle}>
                                {negativeBtnText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'flex-end'
                        }}>
                        {/* <AppButton
                            text={positiveBtnText}
                            shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                            textStyle={{
                                fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                color: '#39ac73',
                            }}
                            btnStyle={{
                                height: 'auto',
                                backgroundColor: CONSTANTS.COLORS.TRANSPERANT,
                            }}
                            onPress={positiveBtnPress}
                        /> */}
                        <TouchableOpacity
                            onPress={positiveBtnPress}>
                            <Text
                                style={styles.textStyle}>
                                {positiveBtnText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </CustomOverlay>
    )
}

const styles = {
    textStyle: {
        fontSize: CONSTANTS.FONT_SIZES.SMALL,
        color: '#39ac73',
        fontWeight: '600',
        textTransform: 'uppercase',
    }
}

export { ConfirmModal };