import React from 'react';
import { ListItem, Left, Body, View } from 'native-base';
import { AppText } from './AppText';
import { AppRadioButton } from './AppRadioButton';
import { AppButton } from './AppButton';
import { InputText } from './InputText';
import SignatureCapture from 'react-native-signature-capture';
const CONSTANTS = require('../../utils/CONSTANTS');

const _onSaveEvent = (result) => {
    //result.encoded - for the base64 encoded png
    //result.pathName - for the file path name
    // console.warn(result);
}

const _onDragEvent = () => {
    // This callback will be called when the user enters signature
    // console.warn("dragged");
}

const RadioElement = ({
    sno = '01',
    title = '',
    radioGroup = [],
    buttons = [],
    inputObj = {},
    textAreaObj = {},
    singnatureObj = {},
    onSelect = () => null,
    middleElement = null,
    titleStyle = {},
    fref = null
}) => {
    let textProps = {}
    if (fref) {
        textProps.fref = fref
    }
    return (
        <ListItem
            noIndent
            noBorder>
            <Left
                style={{
                    flex: 0.08,
                    alignSelf: 'flex-start'
                }}>
                <AppText
                    text={sno + "."}
                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                    fontSize={CONSTANTS.FONT_SIZES.LARGE}
                    {...textProps}
                />
            </Left>
            <Body
                style={{
                    flex: 1,
                    paddingRight: 15,
                }}>
                <AppText
                    text={title}
                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                    customStyle={{
                        fontWeight: '400',
                        letterSpacing: 1,
                        ...titleStyle
                    }}
                />
                {
                    middleElement
                }
                {
                    radioGroup.map((radio, index) => {
                        const { title, value, selected, isOther, checkBoxStyle = null, showRange = null } = radio;
                        return (
                            <View>
                                <AppRadioButton
                                    key={index.toString()}
                                    text={title}
                                    selected={selected}
                                    isOther={isOther}
                                    checkBoxStyle={checkBoxStyle}
                                    onPress={() => onSelect(value)}
                                />
                                {
                                    (showRange)
                                        ? <View>
                                            <View>
                                                <AppText
                                                    text={'From'}
                                                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                                                />
                                                <InputText
                                                    placeholder={'From'}
                                                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                                                    placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                                                    borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                                                    borderWidth={1}
                                                    marginVertical={5}
                                                />
                                            </View>
                                            <View>
                                                <AppText
                                                    text={'To'}
                                                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                                                />
                                                <InputText
                                                    placeholder={'To'}
                                                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                                                    placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                                                    borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                                                    borderWidth={1}
                                                    marginVertical={5}
                                                />
                                            </View>
                                        </View>
                                        : null
                                }
                                {
                                    (isOther)
                                        ? <View
                                            style={{
                                                marginTop: 5,
                                            }}>
                                            <AppText
                                                text={'If ' + title + ', Explain'}
                                                color={CONSTANTS.COLORS.TEXTCOLOR4}
                                            />
                                            <InputText
                                                placeholder={'If ' + title + ', Explain'}
                                                color={CONSTANTS.COLORS.TEXTCOLOR4}
                                                placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                                                borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                                                borderWidth={1}
                                                marginVertical={5}
                                            />
                                        </View>
                                        : null
                                }
                            </View>
                        )
                    })
                }
                {
                    (buttons.length > 0)
                        ? <View
                            style={{
                                flexDirection: 'row',
                            }}>
                            {
                                buttons.map((button, index) => {
                                    return (
                                        <AppButton
                                            key={index.toString()}
                                            text={button.title}
                                            onPress={button.onPress}
                                            width={'auto'}
                                            btnStyle={{
                                                borderRadius: 15,
                                                marginRight: 10,
                                            }}
                                            height={42}
                                            shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                                        />
                                    )
                                })
                            }
                        </View>
                        : null
                }
                {
                    Object.keys(inputObj).length > 0
                        ? <InputText
                            placeholder={inputObj.placeholder}
                            color={CONSTANTS.COLORS.TEXTCOLOR4}
                            placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                            borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                            borderWidth={1}
                            marginVertical={5}
                        />
                        : null
                }
                {
                    Object.keys(textAreaObj).length > 0
                        ? <InputText
                            placeholder={textAreaObj.placeholder}
                            color={CONSTANTS.COLORS.TEXTCOLOR4}
                            placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                            borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                            borderWidth={1}
                            marginVertical={5}
                            multiline
                            customStyle={{
                                minHeight: 80,
                            }}
                        />
                        : null
                }
                {
                    Object.keys(singnatureObj).length > 0
                        ? <SignatureCapture
                            style={{
                                height: 250,
                                width: '100%',
                                marginTop: 10,
                            }}
                            onSaveEvent={_onSaveEvent}
                            onDragEvent={_onDragEvent}
                            saveImageFileInExtStorage={false}
                            showNativeButtons={true}
                            showTitleLabel={false}
                            viewMode={'potrait'}
                        />
                        : null
                }
            </Body>
        </ListItem>
    )
}

export { RadioElement };