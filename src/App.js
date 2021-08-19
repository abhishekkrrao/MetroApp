import React, { Component } from 'react';
import { BackHandler, Platform, StatusBar } from 'react-native';
import { createAppContainer, StackActions, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { View } from 'native-base';
import FlashMessage, { showMessage, hideMessage } from 'react-native-flash-message';
import NetInfo from '@react-native-community/netinfo'

import Splash from './components/screens/Splash';
import { Login, Forgotpassword } from './components/screens/auth';
import { Orders, Sorting, ViewOrder } from './components/screens';
import { AppSideMenu } from './components/common';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Inspection, Instructions, Photos, SurveyQuestions } from './components/screens/inspection';
import CONSTANTS from './utils/CONSTANTS';
import CommonFunctions from './utils/CommonFunctions';
import strings from './Language';
import { NativeBaseProvider } from 'native-base';

const menuDrawer = createDrawerNavigator({
    All: {
        screen: Orders,
        params: { filterType: 'all_list' }
    },
    InProgress: {
        screen: Orders,
        params: { filterType: 'inprogress' }
    },
    Completed: {
        screen: Orders,
        params: { filterType: 'completed_list' }
    },
    Problem: {
        screen: Orders,
        params: { filterType: 'problem_list' }
    },
    ActionRequired: {
        screen: Orders,
        params: { filterType: 'action_list' }
    },
    Delay: {
        screen: Orders,
        params: { filterType: 'delay_list' }
    },
    CompletedAwaitingPayout: {
        screen: Orders,
        params: { filterType: 'payout_list' }
    },
    Paid: {
        screen: Orders,
        params: { filterType: 'paid_list' }
    }
}, {
    initialRouteName: 'InProgress',
    contentComponent: props => <AppSideMenu {...props} />,
    drawerWidth: 300,
});

/**
 * this will route configuration
 * if you add any component in route 
 * please mention here
 */
const mainContainer = createStackNavigator({

    Splash: { screen: Splash },
    App: menuDrawer,
    /**
     * Authentication Routes
     */
    Login: {
        screen: Login
    },
    Forgotpassword: {
        screen: Forgotpassword
    },

    /**
     * screens
     */
    ViewOrder: {
        screen: ViewOrder
    },

    /**
     * Inspection
     */
    Inspection: {
        screen: Inspection
    },
    Instructions: {
        screen: Instructions
    },
    Photos: {
        screen: Photos
    },
    SurveyQuestions: {
        screen: SurveyQuestions
    },
    Sorting: {
        screen: Sorting
    },


}, {
    headerMode: 'none',
    navigationOptions: {
        headerVisible: false,
    },
    //initialRouteName: CONSTANTS.ROUTENAMES.Sorting
});

const AppContainer = createAppContainer(mainContainer);
let _navigator;
class App extends Component {

    constructor(props) {
        super(props);
        this.currentScreen = null;
        this.unsubscribeNWStatus = null;
        this.isInternetReachable = null
    }

    handleBackPress = () => {
        /**
         * Back button handler for entire application
         */
        if (this.currentScreen == CONSTANTS.ROUTENAMES.InProgress) {
            CommonFunctions
                .showAlert(strings.Confirmation, strings["Are you sure you want to exit ?"], [strings.No, strings.Yes], () => null, () => {
                    BackHandler.exitApp();
                });
            return true;
        }
        this.navigate(CONSTANTS.ROUTENAMES.App, this.props.navigation);
        return true;
        /* if(this.currentScreen == CONSTANTS.ROUTENAMES.App) {
            BackHandler.exitApp();
            return true;
        } */
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.unsubscribeNWStatus = NetInfo.addEventListener(state => {
            if (this.isInternetReachable !== null && this.isInternetReachable != state.isInternetReachable) {
                state.isInternetReachable ? showMessage({
                    message: "You are online now ",
                    type: "success",
                }) : showMessage({
                    message: "You are offline now ",
                    description: "Offline version of application will work with last stored data.",
                    type: "danger",
                });
            }
            this.isInternetReachable = state.isInternetReachable;
        });
    }

    //Remove listeners allocated in createNotificationListeners()
    componentWillUnmount() {
        //console.warn("Called unmount");
        this.backHandler.remove();
        this.unsubscribeNWStatus !== null && this.unsubscribeNWStatus()
    }

    // gets the current screen from navigation state
    getActiveRouteName = (navigationState) => {
        if (!navigationState) {
            return null;
        }
        const route = navigationState.routes[navigationState.index];
        // dive into nested navigators
        if (route.routes) {
            return this.getActiveRouteName(route);
        }
        return route.routeName;
    }

    setTopLevelNavigator(navigatorRef) {
        _navigator = navigatorRef;
    }

    navigate(routeName, params) {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: routeName, params: (params == null) ? {} : params })
            ],
        });
        if (_navigator != null) {
            _navigator.dispatch(resetAction);
        }
    }

    render() {
        return (
            <NativeBaseProvider>


                <View style={{ flex: 1 }}>

                    <AppContainer
                        ref={navigatorRef => {
                            this.setTopLevelNavigator(navigatorRef);
                        }}
                        onNavigationStateChange={(prevState, currentState, action) => {
                            const currentScreen = this.getActiveRouteName(currentState);
                            this.currentScreen = currentScreen;
                        }}
                    />
                    <FlashMessage position={Platform.OS === 'ios' ? "top" : { top: StatusBar.currentHeight, left: 0, right: 0 }} floating={Platform.OS !== 'ios'} autoHide={true} duration={3000} />

                </View>
            </NativeBaseProvider>
        )
    }
}

export default App;