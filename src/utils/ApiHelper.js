import NetInfo from '@react-native-community/netinfo';
import Axios from 'axios';
import { showMessage } from 'react-native-flash-message';
import strings from '../Language';
import CommonFunctions from '../utils/CommonFunctions';
import AsyncStorage from '@react-native-community/async-storage';
import ImageResizer from 'react-native-image-resizer';

const CONSTANTS = require('../utils/CONSTANTS');
const ApiHelper = {
    _fetchDataReponse(context, method, ApiUrl, data, successHandler, { disableHTMLParse = false, offlineVerisionKey, onUploadProgress = null, skipError = false } = {}) {
        /**
         * This is common network call to fetch resonse from server
         */
        NetInfo
            .fetch()
            .then(async state => {
                let isInternetReachable = state.isInternetReachable;
                if (!isInternetReachable) {
                    if (offlineVerisionKey) {
                        const data = await AsyncStorage.getItem(offlineVerisionKey);
                        if (!data) {
                            throw new Error('This data is not avaliable now, please connect to internet!!!')
                        } else {
                            successHandler(JSON.parse(data));
                        }
                        return;
                    } else {
                        throw new Error("Please check you internet connection, try again")
                    }
                }

                let formData = [];
                const config = {
                    method: method,
                    url: ApiUrl,
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'multipart/form-data',
                    }
                    //data: formData,
                    /* headers: {
                        Authorization: sessionKey
                    } */
                }
                if (onUploadProgress && typeof onUploadProgress === 'function') {
                    config.onUploadProgress = onUploadProgress
                }
                if (Array.isArray(data)) {
                    // when dta is rray then we would assume to send it in formdata format
                    if (formData != null) {
                        if (data.length > 0) {
                            formData = new FormData();
                            data.forEach((keyPair) => {
                                formData.append(keyPair.key, keyPair.value);
                            });
                        }
                    }
                    if (data.length) {
                        config.data = formData
                    }
                } else {
                    if (data && Object.keys(data).length) {
                        config.data = data
                    }
                }

                const _successHandler = async (response) => {
                    try {
                        if (!disableHTMLParse) {
                            var _response = JSON.stringify(response).replace("<br>", "\\n").replace(/<\/?[^>]+(>|$)/g, "");
                            response = JSON.parse(_response)
                        } else {
                            response = JSON.parse(response)
                        }
                    } catch (e) {
                        console.log("Failed to remove html tags in api helper")
                    }
                    if (offlineVerisionKey) {
                        await AsyncStorage.setItem(offlineVerisionKey, JSON.stringify(response));
                    }
                    successHandler(response)
                }
                const _errorHandler = (error) => {
                    
                    //console.warn("Error at fetching response "+error.message);
                    console.warn("Error two is " + JSON.stringify(error));
                    if(skipError){
                        successHandler(error)
                    }else{
                        showMessage({
                            message: error.message,
                            type: 'danger',
                        });
                    }
                    if (context.state.loading) {
                        context.setState({
                            loading: false,
                        });
                    }
                    if (context.state.isRefreshing) {
                        context.setState({
                            isRefreshing: false,
                        });
                    }
                }

                if (onUploadProgress) {
                    Axios.post(ApiUrl, data, {
                        onUploadProgress,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Host': 'www.metrositeinspections.com'
                        }
                    }).then(_successHandler)
                        .catch(_errorHandler);
                } else {
                    //console.warn("APiulr is "+ApiUrl);
                    Axios(config)
                        .then(_successHandler)
                        .catch(_errorHandler);
                }


            })
            .catch((error) => {
                showMessage({
                    message: error.message,
                    type: 'danger',
                });
                if (context.state.loading) {
                    context.setState({
                        loading: false,
                    });
                }
                if (context.state.isRefreshing) {
                    context.setState({
                        isRefreshing: false,
                    });
                }
            })
    },
    _submitForm(context, ApiUrl, data, successHandler, sessionRequired = false, { offlineVerisionKey } = {}) {
        /**
         * Common submit api call function
         * context ==== this
         * apiUrl === Api url except common base url
         * data === Array of parameters
         * successhandler === function to handle response
         */
        //console.warn("Api url is "+ApiUrl);
        context.setState({
            loading: true,
        });
        let formData = new FormData();
        //formData.append('user_app_key', CONSTANTS.API_KEYS.TOKEN);
        for (let i = 0; i < data.length; i++) {
            if (data[i].required == true) {
                if (data[i].value == "") {
                    //console.warn("here");
                    context.setState({
                        loading: false,
                    });
                    showMessage({
                        message: data[i].name + " " + strings["is empty"],
                        type: 'danger',
                    });
                    return true;
                }
                if (data[i].type == CONSTANTS.INPUT_TYPES.EMAIL) {
                    if (!CommonFunctions._validate(data[i].value, CONSTANTS.INPUT_TYPES.EMAIL)) {
                        //console.warn("here two");
                        context.setState({
                            loading: false,
                        });
                        showMessage({
                            message: strings["Email is invalid"],
                            type: 'danger',
                        });
                        return true;
                    }
                    if (data[i].hasOwnProperty('isVerified')) {
                        if (!data[i].isVerified) {
                            context.setState({
                                loading: false,
                            });
                            showMessage({
                                message: strings["Email not verified"],
                                type: 'danger',
                            });
                            return true;
                        }
                    }
                    data[i].value = (data[i].value).toLowerCase();
                }

                if (data[i].type == CONSTANTS.INPUT_TYPES.MOBILE) {
                    if (!CommonFunctions._validate(data[i].value, CONSTANTS.INPUT_TYPES.MOBILE)) {
                        //console.warn("here two");
                        context.setState({
                            loading: false,
                        });
                        showMessage({
                            message: strings["Mobile is invalid"],
                            type: 'danger',
                        });
                        return true;
                    }
                    if (data[i].hasOwnProperty('isVerified')) {
                        if (!data[i].isVerified) {
                            context.setState({
                                loading: false,
                            });
                            showMessage({
                                message: strings["Mobile number not verified"],
                                type: 'danger',
                            });
                            return true;
                        }
                    }
                }
                if (data[i].type == CONSTANTS.INPUT_TYPES.PASSWORD) {
                    if (data[i].key == 'repeatpassword') {
                        if (context.state.password != context.state.repeatpassword) {
                            //console.warn("here threee");
                            context.setState({
                                loading: false,
                            });
                            showMessage({
                                message: strings["Passwords should match"],
                                type: 'danger',
                            });
                            return true;
                        }
                    }
                }
            }
            if (data[i].type == CONSTANTS.INPUT_TYPES.FILE) {
                ImageResizer.createResizedImage((Platform.OS == 'android') ? data[i].value.path : data[i].value.uri.replace('file://', ''), CONSTANTS.COMPRESS_IMAGE.WIDTH, CONSTANTS.COMPRESS_IMAGE.HEIGHT, CONSTANTS.COMPRESS_IMAGE.COMPRESSFORMAT, CONSTANTS.COMPRESS_IMAGE.QUALITY).then((res) => {
                    formData.append("avatar", {
                        name: data[i].value.fileName,
                        type: data[i].value.type,
                        uri: Platform.OS === "android" ? res.uri : res.uri.replace("file://", "")
                    });
                }).catch((err) => {
                    formData.append("avatar", {
                        name: data[i].value.fileName,
                        type: data[i].value.type,
                        uri: Platform.OS === "android" ? data[i].value.uri : data[i].value.uri.replace("file://", "")
                    });
                })
            } else {
                formData.append(data[i].key, data[i].value);
            }
        }
        /**
         * This is common network call to submit form
         */
        NetInfo
            .fetch()
            .then(async state => {
                let isInternetReachable = state.isInternetReachable;
                if (!isInternetReachable) {
                    if (offlineVerisionKey) {
                        const data = await AsyncStorage.getItem(offlineVerisionKey);
                        if (!data) {
                            throw new Error('This data is not avaliable now, please connect to internet!!!')
                        } else {
                            successHandler(JSON.parse(data));
                        }
                        return;
                    } else {
                        throw new Error("Please check you internet connection, try again")
                    }
                }


                /**
                 * if Form type is resetpassword
                 * we will check for session
                 */
                if (sessionRequired) {
                    AsyncStorage
                        .getItem(CONSTANTS.SESSIONKEYS.SESSIONKEY)
                        .then((sessionKey) => {
                            if (sessionKey == null) {
                                showMessage({
                                    message: strings["Session Expired"],
                                    type: 'danger',
                                });
                                if (context.state.loading) {
                                    context.setState({
                                        loading: false,
                                    });
                                }
                                if (context.state.isRefreshing) {
                                    context.setState({
                                        isRefreshing: false,
                                    });
                                }
                                context.props.navigation.navigate(CONSTANTS.ROUTENAMES.Auth);
                                return true;
                            }
                            Axios({
                                method: 'POST',
                                url: ApiUrl,
                                data: formData,
                                headers: {
                                    Authorization: sessionKey,
                                    'Content-Type': 'multipart/form-data',
                                }
                            })
                                .then(successHandler)
                                .catch((error) => {
                                    console.warn("Error at fetching response " + error.message);
                                    if (context.state.loading) {
                                        context.setState({
                                            loading: false,
                                        });
                                    }
                                    showMessage({
                                        message: error.message,
                                        type: 'danger',
                                    });
                                });
                        })
                        .catch((error) => {
                            showMessage({
                                message: strings["Session Expired"],
                                type: 'danger',
                            });
                            if (context.state.loading) {
                                context.setState({
                                    loading: false,
                                });
                            }
                            if (context.state.isRefreshing) {
                                context.setState({
                                    isRefreshing: false,
                                });
                            }
                            context.props.navigation.navigate(CONSTANTS.ROUTENAMES.Auth);
                            return true;
                        });
                    return;
                }
                Axios
                    .post(ApiUrl, formData)
                    .then(async (response) => {
                        if (offlineVerisionKey) {
                            await AsyncStorage.setItem(offlineVerisionKey, JSON.stringify(response));
                        }
                        successHandler(response)
                    })
                    .catch((error) => {
                        console.warn("Error two is " + JSON.stringify(error));
                        showMessage({
                            message: error.message,
                            type: 'danger',
                        });
                        if (context.state.loading) {
                            context.setState({
                                loading: false,
                            });
                        }
                        if (context.state.isRefreshing) {
                            context.setState({
                                isRefreshing: false,
                            });
                        }
                    });
            })
            .catch((error) => {
                showMessage({
                    message: error.message,
                    type: 'danger',
                });
                if (context.state.loading) {
                    context.setState({
                        loading: false,
                    });
                }
                if (context.state.isRefreshing) {
                    context.setState({
                        isRefreshing: false,
                    });
                }
            })
    }
}

export default ApiHelper;