import React, { Component } from 'react';
import { Card } from 'native-base';
import { AppText } from './AppText';
import moment from 'moment';
import timeZone from 'moment-timezone';
import strings from '../../Language';
import AsyncStorage from '@react-native-community/async-storage';
import CommonFunctions from '../../utils/CommonFunctions';
const CONSTANTS = require('../../utils/CONSTANTS');

const AppDate = ({
    name = null,
}) => {
    return (
        <Card
            style={{
                backgroundColor: CONSTANTS.COLORS.PRIMARY3,
                paddingVertical: 15,
                borderRadius: 6,
                paddingHorizontal: 10,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.7,
                shadowRadius: 5,
                elevation: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                
            }}>
            <AppText
                text={moment.tz(timeZone.tz.guess()).format('ddd, MMM D, YYYY, hh:mm a (z)')}
                fontSize={CONSTANTS.FONT_SIZES.NORMAL}
            />
            {
                name == null
                ?   null
                :   <AppText
                        text={name}
                        fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                    />   
            }
        </Card>
    )
}

export { AppDate };