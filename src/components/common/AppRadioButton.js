import React from 'react';
import { TouchableOpacity } from 'react-native';
import { View, Icon } from 'native-base';
import { AppText } from './AppText';
import ParsedText from 'react-native-parsed-text';
import { Linking } from 'react-native';
const CONSTANTS = require('../../utils/CONSTANTS');
const AppRadioButton = ({
    text = null,
    selected = false,
    checkBoxStyle = null,
    onPress=null,
}) => {
    return (
        <TouchableOpacity 
        activeOpacity={0.6}
        onPress = {onPress}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginTop: 5,
                }}>
                {
                    (checkBoxStyle == 'square')
                        ? (selected)
                            ? <Icon
                                name='md-checkbox-outline'
                                type='Ionicons'
                                style={styles.iconStyle}
                            />
                            : <Icon
                                name='md-square-outline'
                                type='Ionicons'
                                style={styles.iconStyle}
                            />
                        : (selected)
                            ? <Icon
                                name='md-radio-button-on'
                                type='Ionicons'
                                style={styles.iconStyle}
                            />
                            : <Icon
                                name='md-radio-button-off'
                                type='Ionicons'
                                style={styles.iconStyle}
                            />
                }
                {
                    (text == null)
                        ? null
                        : <ParsedText
                            style={{
                                fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                color: CONSTANTS.COLORS.BLACK2,
                                fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                flex: 1,
                                fontWeight: 'normal',
                            }}
                            parse={
                                [{
                                    type: 'url',
                                    style: styles.url,
                                    onPress: (url, matchIndex) => {
                                        Linking.openURL(url);
                                    }
                                }, {
                                    type: 'phone',
                                    style: styles.phone,
                                    onPress: (phone, matchIndex) => {
                                        Linking.openURL('tel:' + phone);
                                    }
                                }, {
                                    type: 'email',
                                    style: styles.email,
                                    onPress: (email, matchIndex) => {
                                        Linking.openURL('mailto:' + email);
                                    }
                                }, {
                                    pattern: /Bob|David/,
                                    style: styles.name,
                                }, {
                                    pattern: /42/,
                                    style: styles.magicNumber
                                }, {
                                    pattern: /#(\w+)/,
                                    style: styles.hashTag
                                }]
                            }
                            childrenProps={{ allowFontScaling: false }}>
                            {text}
                        </ParsedText>
                }
            </View>
        </TouchableOpacity>
    )
}

const styles = {
    iconStyle: {
        fontSize: CONSTANTS.FONT_SIZES.FONT20,
        color: CONSTANTS.COLORS.PRIMARY2,
        flex: 0.1,
        alignSelf: 'flex-start',
        justifyContent: 'center',
    },
    url: {
        color: CONSTANTS.COLORS.RED,
        textDecorationLine: 'underline',
    },
    email: {
        textDecorationLine: 'underline',
    },
    text: {
        color: 'black',
        fontSize: 15,
    },
    phone: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    name: {
        color: 'red',
    },
    username: {
        color: 'green',
        fontWeight: 'bold'
    },
    magicNumber: {
        fontSize: 42,
        color: 'pink',
    },
    hashTag: {
        fontStyle: 'italic',
    },
}

export { AppRadioButton };