import React, { Component } from 'react';
import { Container, Content } from 'native-base';
import { Image, View, TouchableOpacity, Keyboard } from 'react-native';
import strings from '../../../Language';
import { AppText, AppButton, InputText, ConfirmModal } from '../../common';
import CommonFunctions from '../../../utils/CommonFunctions';
import Spinner from 'react-native-loading-spinner-overlay';
import ApiHelper from '../../../utils/ApiHelper';
import ApiUrls from '../../../utils/ApiUrls';

const CONSTANTS = require('../../../utils/CONSTANTS');

class Forgotpassword extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            emailError: null,
            internetConnection: false,
        }
    }

    _submitForgot = () => {
        let email = this.state.email.toLowerCase();
        this.setState({
            emailError: null,
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
        this.setState({
            loading: true,
        });
        Keyboard.dismiss();
        //console.warn("Api url is "+ApiUrls.FORGOTPASSWORD+"&email=" + email);
        ApiHelper
        ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.FORGOTPASSWORD+"&email=" + email, [], (response) => {
            //console.log("Reponse is "+JSON.stringify(response));
            this.setState({
                loading: false,
                emailError: response.data.posts[0]
            });
        });
    }

    render() {
        return (
            <Container
                style={styles.container}>
                <Spinner 
                    visible={this.state.loading} 
                    textContent={strings.Loading} 
                />
                <Content
                    contentContainerStyle={{
                        flex: 1,
                        alignItems: 'center',
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
                        text={strings["Enter Registered Email"]}
                        fontSize={CONSTANTS.FONT_SIZES.FONT23}
                        customStyle={{
                            marginTop: 50,
                        }}
                    />
                    <View
                        style={{
                            width: '100%',
                            paddingHorizontal: '10%',
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
                            value={this.state.email}
                        />
                        <AppButton 
                            text={strings.Submit}
                            onPress={this._submitForgot}
                            shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                        />
                        <TouchableOpacity
                            onPress={() => CommonFunctions._goBack(this.props.navigation)}>
                            <AppText
                                text={strings["Click here to login"]}
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
                        }, () => this._submitForgot())
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

export default Forgotpassword;
// export { Forgotpassword };