import React, { Component } from 'react';
import { Container, Content, View, Button } from 'native-base';
import { StatusBar, Image, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import strings from '../../../Language';
import { InputText, AppButton, AppText, CustomOverlay, ConfirmModal } from '../../common';
import CommonFunctions from '../../../utils/CommonFunctions';
import { Overlay } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import ApiHelper from '../../../utils/ApiHelper';
import ApiUrls from '../../../utils/ApiUrls';
const CONSTANTS = require('../../../utils/CONSTANTS');
class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            email: "",
            emailError: null,
            password: "",
            passwordError: null,
            fcmToken: null,
            internetConnection: false,
        }
    }

    UNSAFE_componentWillMount(){
        AsyncStorage
        .getItem(CONSTANTS.SESSIONKEYS.FCM)
        .then(storageData => {
            if(storageData != null) {
                this.setState({
                    fcmToken: storageData
                });
            }
        })
    }

    _submitLogin = () => {
        global.screen = 'Inprogess'
        let email = this.state.email.toLowerCase();
        let password = this.state.password;
        this.setState({
            emailError: null,
            passwordError: null,
        });
        if(email == "") {
            this.setState({
                emailError: strings["Please Enter Email"],
            });
            return;
        }
        if(!CommonFunctions._validate(email, CONSTANTS.INPUT_TYPES.EMAIL)) {
            this.setState({
                emailError: strings["Invalid Email"],
            });
            return;
        }
        if(password == "") {
            this.setState({
                passwordError: strings["Please Enter Password"],
            });
            return;
        }
        this.setState({
            loading: true,
        });
        Keyboard.dismiss();
        ApiHelper
        ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.LOGIN+"&email=" + email + "&password=" + password, [], (response) => {
            //console.warn("Reponse is "+JSON.stringify(response));
            if(response.data.posts[0] == 0) {
                this.setState({
                    loading: false,
                    passwordError: strings["Invalid Credintidals"],
                });
                return;
            }
            CommonFunctions
            ._saveSession(CONSTANTS.SESSIONKEYS.USERINFORMATION, JSON.stringify(response.data.posts[0]));
            CommonFunctions
            ._pushPage(CONSTANTS.ROUTENAMES.App, this.props.navigation);
        });
    }

    render() {
        return (
            <Container
                style={styles.container}>
                <StatusBar barStyle='dark-content' />
                <Spinner 
                    visible={this.state.loading} 
                    textContent={strings.Loading} 
                />
                <Content
                    contentContainerStyle={{
                        flex: 1,
                        alignItems: 'center',
                        //justifyContent: 'center',
                        marginTop: '20%',
                    }}>
                    <Image
                        source={require('../../../assets/images/logo.png')}
                        style={{
                            resizeMode: 'contain',
                            width: 200,
                        }}
                    />
                    <AppText
                        text={strings["Get Started!"]}
                        fontSize={CONSTANTS.FONT_SIZES.FONT23}
                        customStyle={{
                            marginTop: 50,
                        }}
                    />
                    <View
                        style={{
                            width: '100%',
                            paddingHorizontal: '5%',
                            marginTop: 50,
                        }}>
                        <InputText
                            placeholder={strings.Email}
                            autoCompleteType='email'
                            textContentType='emailAddress'
                            keyboardType='email-address'
                            returnKeyType='next'
                            errorMessage={this.state.emailError}
                            onChangeText={(email) => {
                                this.setState({
                                    email
                                })
                            }}
                            customStyle={{
                                fontSize:14,
                                fontWeight:'bold'
                            }}
                            value={this.state.email}
                        />
                        <InputText
                            placeholder={strings.Password}
                            autoCompleteType='password'
                            textContentType='password'
                            returnKeyType='done'
                            errorMessage={this.state.passwordError}
                            secureTextEntry
                            onChangeText={(password) => {
                                this.setState({
                                    password
                                })
                            }}
                            value={this.state.password}

                            customStyle={{
                                fontSize:14,
                                fontWeight:'bold'
                            }}
                        />
                        <AppButton 
                            text={strings.Login}
                            onPress={this._submitLogin}  
                            shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                        />
                        <TouchableOpacity
                            onPress={() => CommonFunctions._openPage(CONSTANTS.ROUTENAMES.Forgotpassword, this.props.navigation)}>
                            <AppText
                                text={strings["Forgot Password?"]}
                                fontSize={CONSTANTS.FONT_SIZES.SMALL}
                                customStyle={{
                                    alignSelf: 'center',
                                    marginTop: 10,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </Content>
                <ConfirmModal
                    isVisible={this.state.internetConnection}
                    title={'No Internet'}
                    message={'It Appears you are not getting adequate service to complete this using The Metro App. Please use Paper documents to complete this assignment.'}
                    negativeBtnText={'Retry'}
                    positiveBtnText={'Ok'}
                    positiveBtnPress={() => {
                        this.setState({
                            internetConnection: false
                        }, () => {
                            if(Platform.OS == 'android') {
                                BackHandler.exitApp();
                                return;
                            }
                        })
                    }}
                    negativeBtnPress={() => {
                        this.setState({
                            internetConnection: false
                        }, () => this._submitLogin())
                    }}
                />
            </Container>
        )
    }

}

const styles = {
    container: {
        backgroundColor: CONSTANTS.COLORS.PRIMARY,
    },
}

export default Login;