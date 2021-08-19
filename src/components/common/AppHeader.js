import React, { useState } from 'react';
import { Header, Left, Body, Title, Right, Icon } from 'native-base';
import STYLE from '../css/STYLE';
import { TouchableOpacity, View } from 'react-native';
import CommonFunctions from '../../utils/CommonFunctions';
import { ConfirmModal } from './ConfirmModal';
import strings from '../../Language';

const CONSTANTS = require('../../utils/CONSTANTS');
const AppHeader = ({ navigation, title, showMenu = null, showBack = null, showLogout = null, titleStyle = {} }) => {
    const [logoutModal, setLogoutModal] = useState(false);
    return (
        <View>
            <Header
                iosBarStyle='light-content'
                style={{
                    backgroundColor: CONSTANTS.COLORS.PRIMARY,
                }}>
                <Left
                    style={{
                        flex: 1,
                        marginLeft: 10,
                    }}>
                    {
                        (showMenu)
                            ? <TouchableOpacity
                                onPress={() => navigation.openDrawer()}>
                                <Icon
                                    name='menu'
                                    style={STYLE.iconStyle}
                                />
                            </TouchableOpacity>
                            : null
                    }
                    {
                        (showBack)
                            ? <TouchableOpacity
                                onPress={() => CommonFunctions._goBack(navigation)}>
                                <Icon
                                    name='arrow-back'
                                    style={STYLE.iconStyle}
                                />
                            </TouchableOpacity>
                            : null
                    }
                </Left>
                <Body
                    style={{
                        flex: 4
                    }}>
                    <Title
                        style={{
                            color: CONSTANTS.COLORS.WHITE,
                            fontSize: CONSTANTS.FONT_SIZES.FONT23,
                            fontWeight: 'normal',
                            ...titleStyle
                        }}>
                        {title}
                    </Title>
                </Body>
                <Right
                    style={{
                        flex: 1,
                        marginRight: 5,
                    }}>
                    {
                        (showLogout)
                            ? <TouchableOpacity
                                onPress={() => setLogoutModal(true)}>
                                <Icon
                                    name='ios-log-out'
                                    style={STYLE.iconStyle}
                                />
                            </TouchableOpacity>
                            : null
                    }
                </Right>
            </Header>

            <ConfirmModal
                isVisible={logoutModal}
                title={strings["Logout Confirmation"]}
                message={strings["Are you sure, You want to logout ?"]}
                positiveBtnText={strings.Yes}
                negativeBtnText={strings.No}
                positiveBtnPress={() => CommonFunctions.onPressLogout(navigation)}
                negativeBtnPress={() => setLogoutModal(false)}
            />
        </View>
    )
}

export { AppHeader };