import React, { Component, useState } from 'react'
import { Text, View, FlatList } from 'react-native'
import { Card, Icon, ListItem, Left, Body, Right, Radio } from 'native-base';
import { WebView } from 'react-native-webview'
import STYLE from '../../css/STYLE';
import { AppText, AppRadioButton, RadioElement, AppButton } from '../../common';
import strings from '../../../Language';
import { Divider } from 'react-native-elements';

const CONSTANTS = require('../../../utils/CONSTANTS');
const Instructions = ({
    context,
    locationType,
    onsiteContact,
    setQuestion,
    contactShowImpNotes,
    insttructionData
}) => {
    const [state, setstate] = useState({
        instructions: [{
            point: "You are conducting the identity verification on behalf of Biz2Credit as part of approval/application process"
        }, {
            point: "If Borrower(s) would like to meet at a different location or job site, Please proceed the desired address"
        }, {
            point: 'You must meet with the Borrower(s), as you will be completing the Identiry verification'
        }]
    })

    return (
        <Card
            style={[STYLE.cardStyle, {
                padding: 10,
            }]}>
            <AppText
                text={strings["Please Read Instructions"]}
                color={CONSTANTS.COLORS.HEADINGCOLOR}
                customStyle={styles.headingStyle}
                fontSize={CONSTANTS.FONT_SIZES.LARGE}
            />
            {/* <AppText
                            text={'! ! ! IMPORTANT INSTRUCTIONS ! ! !'}
                            color={CONSTANTS.COLORS.BLACK2}
                            fontSize={CONSTANTS.FONT_SIZES.LARGE}
                            customStyle={{
                                letterSpacing: 1,
                                textAlign: 'center',
                                marginVertical: 10,
                            }}
                        /> */}
            {
                <AppText
                    text={insttructionData}
                    color={CONSTANTS.COLORS.TEXTCOLOR4}
                />
            }
            {/* {
                <WebView style={{height:400,width:'100%'}} source={{ html: insttructionData }} />
            } */}
            {/* <FlatList
                data={state.instructions}
                extraData={(item, index) => index.toString()}
                ListHeaderComponent={() => {
                    return (
                        <AppText
                            text={'! ! ! IMPORTANT INSTRUCTIONS ! ! !'}
                            color={CONSTANTS.COLORS.BLACK2}
                            fontSize={CONSTANTS.FONT_SIZES.LARGE}
                            customStyle={{
                                letterSpacing: 1,
                                textAlign: 'center',
                                marginVertical: 10,
                            }}
                        />
                    )
                }}
                renderItem={({ item }) => {
                    return (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                marginVertical: 5,
                            }}>
                            <Icon
                                name='panorama-fish-eye'
                                type='MaterialIcons'
                                style={{
                                    fontSize: CONSTANTS.FONT_SIZES.MICROSMALL,
                                    color: CONSTANTS.COLORS.TEXTCOLOR4,
                                    marginTop: 5,
                                    marginRight: 5,
                                }}
                            />
                            <AppText
                                text={item.point}
                                color={CONSTANTS.COLORS.TEXTCOLOR4}
                            />
                        </View>
                    )
                }}
            /> */}

            <Divider
                style={{
                    marginVertical: 10,
                }}
            />

            <AppText
                text={strings["Upon Arrival Please Answer Following Questions"]}
                color={CONSTANTS.COLORS.HEADINGCOLOR}
                customStyle={styles.headingStyle}
                fontSize={CONSTANTS.FONT_SIZES.LARGE}
            />

            <RadioElement
                sno={1}
                title={'What is the merchant Location Type ?'}
                titleStyle={{ textTransform: 'capitalize', fontSize: 16, fontWeight: 'bold' }}
                onSelect={(value) => setQuestion('locationType', value)}
                radioGroup={[{
                    id: 1,
                    title: 'Commercial Location Only',
                    selected: locationType == 'Commercial',
                    value: 'Commercial'
                }, {
                    id: 2,
                    title: 'Private Residence Only',
                    selected: locationType == 'Residential',
                    value: 'Residential'
                }]}
            />
            <RadioElement
                sno={2}
                title={'Did the disignated contact, Or An Authorized Individual Show for Your Appointment to meet with you ?'}
                titleStyle={{ textTransform: 'capitalize', fontSize: 16, fontWeight: 'bold' }}
                onSelect={(value) => setQuestion('onsiteContact', value)}
                radioGroup={[{
                    id: 1,
                    title: 'Yes',
                    selected: onsiteContact == 'Yes',
                    value: 'Yes'
                }, {
                    id: 2,
                    title: 'No-Show',
                    selected: onsiteContact == 'No',
                    value: 'No'
                }]}
            />

            <AppText
                text={contactShowImpNotes}
                fontSize={17}
                // color={CONSTANTS.COLORS.RED}
                customStyle={{
                    fontWeight: 'normal',
                    marginTop: 10,
                    letterSpacing: 1.6,
                    lineHeight: 20,
                    color: 'red'
                }}
            />
            {/* <AppText
                text={'Also, if you selected "No-show" and then, the contact arrives while you are still at the site, you must tap back on "Instructions" (above), change your answer to "Yes", and proceed with completion of your inspection.  The photos you have taken will remain but you will need to start over in answering the survey questions.'}
                fontSize={CONSTANTS.FONT_SIZES.HEADING}
                color={CONSTANTS.COLORS.RED}
                customStyle={{
                    fontWeight: 'normal',
                    marginTop: 10,
                }}
            /> */}

            <AppButton
                text={'Next to Take Photos'}
                onPress={() => context._setTab(1)}
            />

        </Card>
    )
}

const styles = {
    headingStyle: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
}

export default Instructions;
