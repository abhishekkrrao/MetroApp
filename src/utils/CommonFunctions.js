import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import strings from '../Language';

const CONSTANTS = require('../utils/CONSTANTS');
const CommonFunctions = {
    _openPage(page, navigation, params) {
        const { navigate } = navigation;
        navigate(page, (params == null) ? {} : params);
    },
    logoutuser(navigation, thisPage) {
        this.showAlert(strings["Logout Confirmation"], strings["Are you sure, You want to logout ?"], [strings.Yes, strings.No], () => {
            AsyncStorage
                .multiRemove([CONSTANTS.SESSIONKEYS.USERINFORMATION])
                .then(() => {
                    CommonFunctions
                        ._pushPage(CONSTANTS.ROUTENAMES.Login, navigation);
                })
        })
    },
    onPressLogout(navigation) {
        AsyncStorage
            .clear()
            .then(() => {
                CommonFunctions
                    ._pushPage(CONSTANTS.ROUTENAMES.Login, navigation);
            });
    },
    _pushPage(page, navigation, params) {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: page, params: (params == null) ? {} : params })
            ],
        });
        navigation.dispatch(resetAction);
    },
    _goBack(navigation, params) {
        let goBack = NavigationActions.back({ key: navigation.state.key, params: (params == null) ? {} : params });
        navigation.dispatch(goBack);
    },
    async _requestPermission(permission) {
        /* Permissions
        .request(permission)
        .then(response => {
          // Returns once the user has chosen to 'allow' or to 'not allow' access
          // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
          return response;
        }) */
    },
    async _checkPermission(permission) {
        /* Permissions
        .check(permission)
        .then(response => {
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            return response;
        }) */
    },
    showAlert(title, message, btns, success, cancel = () => null) {
        Alert.alert(
            title,
            message,
            [
                {
                    text: btns[1],
                    style: 'cancel',
                    onPress: cancel,
                },
                {
                    text: btns[0],
                    onPress: success,
                }
            ],
            {
                cancelable: true
            },
        );
    },
    showAlert2(title, message, btns, success) {
        Alert.alert(
            title,
            message,
            [
                {
                    text: btns[1],
                },
                {
                    text: null,
                },
                {
                    text: btns[0],
                    onPress: success,
                }
            ],
            {
                cancelable: true
            },
        );
    },
    _validate: (text, type) => {
        /**
         * Common function to validate form inputs
         * Params
         * text === 'input value'
         * type === 'type of input'
         */
        if (type == CONSTANTS.INPUT_TYPES.EMAIL) {
            let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return reg.test(text);
        }
        if (type == CONSTANTS.INPUT_TYPES.MOBILE) {
            let reg = /^\d{10}$/;;
            return reg.test(text);
        }
        return true;
    },
    _saveSession(item, value) {
        AsyncStorage.setItem(item, value).then((value) => {
            //console.warn("Response is "+value);
        }, (reason) => {
            console.warn("Error " + reason);
        });
    },
    okAlert(title, message) {
        /**
         * Common function to show alert
         * Params
         * title  === 'title of dialog'
         * message  === 'message of dialog'
         * btns == array of btn names
         * success = function of success gutton press
         */
        Alert.alert(
            title,
            message,
            [
                {
                    text: strings.Ok,
                    style: 'cancel',
                }
            ],
            {
                cancelable: true
            },
        );
    }
}

export default CommonFunctions;