import React, { useRef } from 'react';
import { TextInput, View } from 'react-native';
import strings from '../../Language';
import { Text } from 'native-base';

const CONSTANTS = require('../../utils/CONSTANTS');
const InputText = ({
    fref = null,
    placeholder = strings["Type here.."],
    borderColor = CONSTANTS.COLORS.WHITE,
    color = CONSTANTS.COLORS.WHITE,
    placeholderTextColor = CONSTANTS.COLORS.WHITE,
    borderWidth = 2,
    marginVertical = 10,
    customStyle = {},
    editable = true,
    multiline = false,
    autoCompleteType = 'off',
    keyboardType = 'default',
    onChangeText = null,
    returnKeyType = 'done',
    textContentType = 'none',
    errorMessage = null,
    secureTextEntry = false,
    value = null,
}) => {
    let _ref = null
    if (fref != null) {
        _ref = useRef(null)
        fref(_ref)
    }
    return (
        <View>
            <TextInput
                ref={_ref}
                placeholder={placeholder}
                style={[{
                    borderColor,
                    borderWidth,
                    width: '100%',
                    padding: 10,
                    color,
                    borderRadius: 5,
                    fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                    fontStyle: 'normal',
                    fontWeight: '100',
                    fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                    marginVertical,
                }, customStyle]}
                placeholderTextColor={placeholderTextColor}
                editable={editable}
                multiline={multiline}
                autoCompleteType={autoCompleteType}
                enablesReturnKeyAutomatically={false}
                keyboardType={keyboardType}
                onChangeText={onChangeText}
                returnKeyType={returnKeyType}
                textContentType={textContentType}
                secureTextEntry={secureTextEntry}
                value={value}
            />
            {
                (errorMessage == null)
                    ? null
                    : <Text
                        style={{
                            color: CONSTANTS.COLORS.ERROR,
                            fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                            fontSize: CONSTANTS.FONT_SIZES.SMALL,
                        }}
                        note>
                        {errorMessage}
                    </Text>
            }
        </View>
    )
}

export { InputText };