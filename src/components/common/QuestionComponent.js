import React, { useState, useRef } from 'react';
import { Image, Alert } from 'react-native'
import { ListItem, Left, Body, View, Text, Button } from 'native-base';
import { AppText } from './AppText';
import { AppRadioButton } from './AppRadioButton';
import { AppButton } from './AppButton';
import { InputText } from './InputText';
import SignatureCapture from 'react-native-signature-capture';
const CONSTANTS = require('../../utils/CONSTANTS');

let QuestionComponent = ({
    sno = '01',
    question = {},
    clientId = '',
    contactName = '',
    answerHandler,
    context,
    disabledTexts,
    ...answers
}) => {
    const _refs = {}
    const [hideInitialValue, setHideInitialValue] = useState({})

    const handleCheckbox = async (key, value) => {
        if (value == 'Other') {
            // const arrKey = key.replace('_other', '[]')
            // await answerHandler(arrKey, [])
            if (answers[key]) {
                answerHandler(key, '')
            } else {
                answerHandler(key, value)
            }
        } else {
            const answersArr = answers[key] || []
            const _answersArr = [...answersArr]
            if (_answersArr.includes(value)) {
                await answerHandler(key, _answersArr.filter(val => val !== value))
            } else {
                await answerHandler(key, [..._answersArr, value])
            }
            // const othersKey = key.replace( '[]','_other')
            // answerHandler(othersKey, '')
        }
    }

    // on signature event
    const _onSaveEvent = (key, base64) => {
        answerHandler(key, `data:image/png;base64,${base64}`)
    }

    const handleRadio = ({ relation_answer_id, name_feild, answer }) => {
        if (relation_answer_id > 0) {
            Alert.alert('Alert', 'Explanation Required, click Okay to explain your answer in the box provided.', [{
                text: "OkAY",
                style: "cancel"
            }])
            context.answersRefs[relation_answer_id] &&
                context.answersRefs[relation_answer_id].current &&
                context.answersRefs[relation_answer_id].current.focus()
        }
        answerHandler(name_feild, answer)
    }


    const renderAnswer = (answer, i) => {
        let answerValue = answers[answer.name_feild]
        switch (answer.answer_type) {
            case 'radio':
                let ansProps = {}
                if (answerValue == answer.answer) {
                    ansProps.selected = true
                }
                return (<><AppRadioButton
                    key={answer.id}
                    text={answer.answer}
                    {...ansProps}
                    // selected={selected}
                    // isOther={isOther}
                    // checkBoxStyle={checkBoxStyle}
                    onPress={() => handleRadio(answer)}
                />
                    {answer.hasRadioResetButton && ansProps.selected && <Button onPress={() => { answerHandler(answer.name_feild, '') }} style={{ height: 30, marginTop: 10 }} ><Text>Reset</Text></Button>}
                </>);
            case 'checkbox':
                ansProps = {}
                if (Array.isArray(answerValue) && answerValue.includes(answer.answer)) {
                    ansProps.selected = true
                } else if (typeof answerValue === 'string' && answer.name_feild.includes('_other') && answerValue === 'Other') {
                    ansProps.selected = true
                }
                return (<AppRadioButton
                    key={answer.id}
                    text={answer.answer}
                    {...ansProps}
                    // selected={selected}
                    // isOther={isOther}
                    checkBoxStyle={'square'}
                    onPress={() => handleCheckbox(answer.name_feild, answer.answer)}
                />);
            case 'textarea': {
                if (answer.name_feild == 'inspectorSignature' || answer.name_feild == 'merchantSignature') {
                    return (
                        <>
                            {(clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId) &&
                                <AppText
                                    text={'With my signature below, I Hereby Certify that I Personally Conducted this Identity Verification and met with ' + contactName + ', and that all Information provided is True and Correct to the Best of My knowledge:'}
                                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                                    fontSize={CONSTANTS.FONT_SIZES.SMALL}
                                />
                            }
                            {
                                answers[answer.name_feild] !== '' && <Image
                                    style={{ width: 100, height: 50, resizeMode: 'contain', borderWidth: 1, borderColor: 'red' }}
                                    source={{ uri: answers[answer.name_feild] }}
                                />
                            }
                            <View style={{ borderWidth: 1, borderColor: 'black', alignItems: 'flex-start', width: '100%' }} >
                                <SignatureCapture
                                    style={{
                                        height: 200,
                                        width: '100%'
                                    }}
                                    ref={(ref) => _refs[answer.id] = ref}
                                    onSaveEvent={({ encoded }) => _onSaveEvent(answer.name_feild, encoded)}
                                    onDragEvent={() => _refs[answer.id].saveImage()}
                                    saveImageFileInExtStorage={false}
                                    showNativeButtons={false}
                                    showTitleLabel={false}
                                    viewMode={'potrait'}
                                />
                            </View>
                            <AppButton
                                text={'Clear'}
                                shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                                width={100}
                                btnStyle={{
                                    margin: 10,
                                    marginLeft: 0,
                                    borderRadius: 10,
                                    height: 30,
                                }}
                                onPress={() => {
                                    _refs[answer.id].resetImage()
                                    _onSaveEvent(answer.name_feild, '')
                                }}
                            />
                        </>);
                }
            }
            case 'text':
                ansProps = {}
                if (hideInitialValue[answer.name_feild] === undefined) {
                    let isAdminAnwser = false
                    if (typeof answerValue === "string") {
                        ([answerValue, isAdminAnwser] = answerValue.split("@@@@@"))

                        console.log('This is hte isAdminAnwser \n\n\n\n\n', answerValue, isAdminAnwser)
                    }
                    ansProps.value = answerValue
                    if (isAdminAnwser) {
                        ansProps.editable = false
                    }
                } else {
                    ansProps = {}
                }
                return (<View
                    style={{
                        marginTop: 5,
                    }}>
                    <AppText
                        text={answer.answer}
                        color={CONSTANTS.COLORS.TEXTCOLOR4}
                    />
                    <InputText
                        fref={ref => context.answersRefs[answer.id] = ref}
                        placeholder={answer.answer}
                        color={CONSTANTS.COLORS.TEXTCOLOR4}
                        placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                        borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                        borderWidth={1}
                        {...ansProps}
                        onChangeText={(text) => {
                            if (hideInitialValue[answer.name_feild] === undefined) {
                                hideInitialValue[answer.name_feild] = true
                                setHideInitialValue(hideInitialValue)
                            }
                            answerHandler(answer.name_feild, text)
                        }}
                        marginVertical={5}
                    />
                </View>);
            default: return <AppText text={`No element found - (${answer.answer_type})`} />
        }
    }

    let radiocount = 0;
    question.answers.forEach((answer) => {
        if (answer.answer_type == 'radio') {
            radiocount++;
        }
    })

    return (
        <ListItem
            noIndent
            noBorder>
            <Left
                style={{
                    flex: 0.09,
                    alignSelf: 'flex-start'
                }}>
                <AppText
                    fref={ref => context.questionsRefs[question.id] = ref}
                    text={sno + "."}
                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                    fontSize={CONSTANTS.FONT_SIZES.LARGE}
                />
            </Left>
            <Body
                style={{
                    flex: 1,
                    paddingRight: 15,
                }}>
                <AppText
                    text={question.question}
                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                    fontSize={16}
                    customStyle={{
                        fontWeight: 'bold',
                        letterSpacing: 1,
                        textTransform: 'capitalize'
                    }}
                />
                {
                    question.answers.map((answer, i) => {
                        answer.hasRadioResetButton = (radiocount == 1)
                        return (
                            <View>
                                {renderAnswer(answer)}
                            </View>)
                    })}
            </Body>
        </ListItem>
    )
}
QuestionComponent = React.memo(QuestionComponent)
export { QuestionComponent };