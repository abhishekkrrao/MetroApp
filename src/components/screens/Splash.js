import React, { Component } from 'react';
import { StatusBar, View, Image, Text, Platform, Linking, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';
import { Container } from 'native-base';
import strings from '../../Language';
import CommonFunctions from '../../utils/CommonFunctions';
import { ConfirmModal, UpgradeModal } from '../common';
import ApiHelper from '../../utils/ApiHelper';
import ApiUrls from '../../utils/ApiUrls';
import Spinner from 'react-native-loading-spinner-overlay';

const CONSTANTS = require('../../utils/CONSTANTS');
class Splash extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showUpgradePopup: false,
            showCancelPoupup: false,
            versionNum: DeviceInfo.getVersion(),
            internetConnection: false,
            showOflConMod: false
        }
    }

    UNSAFE_componentWillMount() {
        this._checkPermissions();
        //console.warn("Version number "+DeviceInfo.getVersion())
        setTimeout(() => {
            /**
             * By asyncstorage we can handle session management
             */
            AsyncStorage
                .multiGet([CONSTANTS.SESSIONKEYS.USERINFORMATION, CONSTANTS.SESSIONKEYS.FROMNOTIFICATION])
                .then((data) => {
                    /**
                     * parsing information from array
                     */
                    let fromNotification = data[1][1];
                    if (fromNotification != null) {
                        /**
                         * Here data contains key to handle the notification navigation
                         * you will recieve those data from backend
                         */
                        AsyncStorage
                            .removeItem(CONSTANTS.SESSIONKEYS.FROMNOTIFICATION);
                        /**
                         * Here you can handle notification navigation
                         * when app opened by tapping on notification
                         */

                        return;
                    }
                    /**
                     * parsing information from array
                     */
                    let sessionKey = data[0][1];
                    if (sessionKey != null) {
                        /**
                         * Here you can navigate user to the component
                         * where you want user to visit when authentication completes
                         */
                        this._callBackend();
                        return;
                    }
                    CommonFunctions
                        ._pushPage(CONSTANTS.ROUTENAMES.Login, this.props.navigation);
                })
                .catch(() => {
                    /**
                     * If you get error when parsing sessionkeys from Asyncstorage
                     * You will move user default page
                     * Authentication or Dashboard as per your project
                     */

                });
        }, 500);
    }

    async _checkPermissions() {
        /**
         * Sample permission
         * like below you can check for permission
         * when app bootup
         */
        /* try {
            const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: strings["Location Permission"],
                message: strings["Location access is required to show restaurants near by you"],
                buttonNegative: strings.CANCEL,
                buttonPositive: strings.OK,
            },
            );
        } catch (err) {
            console.warn(err);
        } */
    }

    _callBackend = async () => {

        const connectionState = await NetInfo.fetch()
        if (!connectionState.isInternetReachable) {
            this.setState({
                showOflConMod: true
            })
            return;
        }
        this.setState({
            loading: true,
        })
        ApiHelper
            ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.APPVERSIONCHECK + "&env=dev", [], (response) => {
                //console.warn("Response is "+JSON.stringify(response));
                if (Platform.OS == 'ios') {
                    response = response.data;
                    var iosObj = response['posts']['IOS'];
                    var remoteVersion = iosObj[0]['version'];
                    if (remoteVersion > this.state.versionNum) {
                        this.setState({
                            showUpgradePopup: true,
                            loading: false,
                        });
                        return;
                    }
                }
                if (Platform.OS == 'android') {
                    response = response.data;
                    var androidObj = response['posts']['ANDROID'];
                    var remoteVersion = androidObj[0]['version'];
                    if (remoteVersion > this.state.versionNum) {
                        this.setState({
                            showUpgradePopup: true,
                            loading: false,
                        });
                        return;
                    }
                }
                this.setState({
                    loading: false,
                })
                this._checkLogin();
            })
    }

    _checkLogin = () => {
        CommonFunctions
            ._pushPage(CONSTANTS.ROUTENAMES.App, this.props.navigation);
    }

    render() {
        return (
            <Container>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={CONSTANTS.COLORS.PRIMARY}
                />
                <Spinner
                    visible={this.state.loading}
                    textContent={strings.Loading}
                />
                <View style={styles.container}>
                    <StatusBar backgroundColor={CONSTANTS.COLORS.WHITE} barStyle="dark-content" />
                    <Image source={require('../../assets/images/logo.png')} style={styles.logoStyle} />
                    <Text style={styles.versionStyle}>
                        {strings.Version + " " + this.state.versionNum}
                    </Text>
                </View>
                <UpgradeModal
                    isVisible={this.state.showUpgradePopup}
                    message={strings["Please click \"Upgrade\" below to update to the latest version of The Metro App!"]}
                    positiveBtnText={strings.Upgrade}
                    negativeBtnText={strings.Cancel}
                    positiveBtnPress={() => {
                        if (Platform.OS == 'ios') {
                            Linking.openURL('https://apps.apple.com/us/app/playfully/id1203231252?ls=1');
                        } else {
                            Linking.openURL('https://play.google.com/store/apps/details?id=com.phonegap.metro');
                        }
                    }}
                    negativeBtnPress={() => {
                        this.setState({
                            showUpgradePopup: false,
                            showCancelPoupup: true,
                        })
                    }}
                />
                <UpgradeModal
                    isVisible={this.state.showCancelPoupup}
                    message={strings["By clicking \"Cancel\", you are opting to use an outdated version of The Metro App."]}
                    positiveBtnText={strings.Yes}
                    negativeBtnText={strings.No}
                    positiveBtnPress={() => {
                        this.setState({
                            showCancelPoupup: false,
                        }, () => this._checkLogin())
                    }}
                    negativeBtnPress={() => {
                        if (Platform.OS == 'ios') {
                            Linking.openURL('https://apps.apple.com/us/app/playfully/id1203231252?ls=1');
                        } else {
                            Linking.openURL('https://play.google.com/store/apps/details?id=com.phonegap.metro');
                        }
                    }}
                />

                <UpgradeModal
                    isVisible={this.state.showOflConMod}
                    disableNegative={true}
                    title={'Offline Verison'}
                    message={"You're not connected to internet.You would be using offline version of app in which you would have last stored data."}
                    positiveBtnText={strings.Yes}
                    positiveBtnPress={() => {
                        this.setState({
                            showCancelPoupup: false,
                        }, () => this._checkLogin())
                    }}
                />
            </Container>
        )
    }
}

const styles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CONSTANTS.COLORS.PRIMARY,
    },
    logoStyle: {
        width: '50%',
        height: '30%',
        resizeMode: 'contain',
    },
    versionStyle: {
        fontFamily: CONSTANTS.FONT_FAMILIES.ARIAL,
        fontWeight: 'bold',
        fontSize: CONSTANTS.FONT_SIZES.SMALL,
        color: CONSTANTS.COLORS.GRAY,
        marginVertical: 10,
    }
}

export default Splash;