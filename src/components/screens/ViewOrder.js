// Dont forget to write code for removing order apis from async storage

import React, { Component } from 'react';
import { Content, Container, Card, Left, Right, Item, View, Icon, Fab } from 'native-base';
import { Dropdown } from 'react-native-material-dropdown';
import { AppHeader, AppDate, AppButton, AppText, InputText, DateTimeModal, ConfirmModal } from '../common';
import strings from '../../Language';
import STYLE from '../css/STYLE';
import moment from 'moment';
import ImagePicker from 'react-native-image-picker';
import timeZone from 'moment-timezone';
import { TouchableOpacity, TextInput, Text, Linking, Image } from 'react-native';
import { Divider, Avatar, CheckBox } from 'react-native-elements';
import CommonFunctions from '../../utils/CommonFunctions';
const CONSTANTS = require('../../utils/CONSTANTS');
import Spinner from 'react-native-loading-spinner-overlay';
import ApiUrls from '../../utils/ApiUrls';
import ApiHelper from '../../utils/ApiHelper';
import AsyncStorage from '@react-native-community/async-storage';
import { showMessage } from 'react-native-flash-message';

class ViewOrder extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showInstructions: false,
            loading: false,
            orderInfo: this.props.navigation.getParam('orderInfo', null),
            userInformation: {},
            orderDetails: {},
            comment: "",
            internetConnection: false,
            calendarMode: null,
            appointmentDate: null,
            appointmentTime: null,
            letInspMsgs: [],
            beginedJust: false,
            inspectorMsgs: [],
            reportPhotos: [],
            photoProgress: null,
            addtionalImages: [],
            orderConfirm: false,
            orderConfirmC: '',
            orderDecline1: false,
            orderDecline1C: '',
            orderDecline2: false,
            orderDecline2C: ''
        }
        this.imageConfig = {
            mediaType: 'photo',
            noData: true,
            quality: 0.8,
            maxWidth: 1800,
            maxHeight: 1800
        }
    }

    UNSAFE_componentWillMount() {
        if (this.state.orderInfo == null) {
            CommonFunctions
                ._goBack(this.props.navigation);
            return;
        }
        AsyncStorage
            .getItem(CONSTANTS.SESSIONKEYS.USERINFORMATION)
            .then(userInformation => {
                if (userInformation == null) {
                    CommonFunctions
                        ._pushPage(CONSTANTS.ROUTENAMES.Login, this.props.navigation);
                    return;
                }
                userInformation = JSON.parse(userInformation);
                this.setState({
                    userInformation: userInformation,
                }, () => {
                    this._viewOrder();
                })
            });
            
            this.focusListener = this.props.navigation.addListener('willFocus', (e) => {
                if (!global.shouldRefetchViewOrder) {
                    return
                }
                global.shouldRefetchViewOrder = false
                this._viewOrder();
            })
    }

    componentWillUnmount() {
        if (this.focusListener != null) {
            this.focusListener.remove();
        }
    }



    _viewOrder = () => {
        this.setState({
            loading: true,
        });
        ApiHelper
            ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.ORDERDETAILS + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id, [], (response) => {
                let posts = response.data.posts;
                if (this.state.userInformation.userId != posts[0].inspectorId) {
                    this.setState({
                        loading: false,
                    });
                    CommonFunctions
                        ._pushPage(CONSTANTS.ROUTENAMES.App, this.props.navigation);
                    return;
                }

                // For finding the address
                let json = { 'posts': [posts[0]] }
                const letInspMsgs = json['posts'][0].late_reason_options.match(/<(\w+)>[^\<]+<\/\1>|[^<>]+/g).filter((item, i) => i % 3 == 1) || []
                json = JSON.stringify(json).replace("<br>", "\\n").replace(/<\/?[^>]+(>|$)/g, "");
                json = JSON.parse(json)
                posts = JSON.stringify(posts).replace("<br>", "\\n").replace(/<\/?[^>]+(>|$)/g, "");
                posts = JSON.parse(posts)
                var address_both = "";
                if (json['posts'][0].businessMeetingAddress != "" && json['posts'][0].businessMeetingAddress != null) {
                    address_both = json['posts'][0].businessMeetingAddress;
                } else {
                    if (json['posts'][0].businessAddress != "" && json['posts'][0].businessAddress != null) {
                        address_both = json['posts'][0].businessAddress;
                    }
                }
                if (json['posts'][0].businessMeetingAddress2 != "" && json['posts'][0].businessMeetingAddress2 != null) {
                    address_both = address_both + ", " + json['posts'][0].businessMeetingAddress2;
                } else {
                    if (json['posts'][0].businessAddress2 != "" && json['posts'][0].businessAddress2 != null) {
                        address_both = address_both + ", " + json['posts'][0].businessAddress2;
                    }
                }
                var finaladrs = "";
                if (address_both != "") {
                    finaladrs += address_both;
                }
                if (json['posts'][0].businessMeetingCity != "" && json['posts'][0].businessMeetingCity != null) {
                    if (finaladrs != "") {
                        finaladrs += ", " + json['posts'][0].businessMeetingCity;
                    } else {
                        finaladrs += json['posts'][0].businessMeetingCity;
                    }
                } else {
                    if (json['posts'][0].businessCity != "" && json['posts'][0].businessCity != null) {
                        if (finaladrs != "") {
                            finaladrs += ", " + json['posts'][0].businessCity;
                        } else {
                            finaladrs += json['posts'][0].businessCity;
                        }
                    }
                }
                if (json['posts'][0].businessMeetingState != "" && json['posts'][0].businessMeetingState != null) {
                    if (finaladrs != "") {
                        finaladrs += ", " + json['posts'][0].businessMeetingState;
                    } else {
                        finaladrs += json['posts'][0].businessMeetingState;
                    }
                } else {
                    if (json['posts'][0].businessState != "" && json['posts'][0].businessState != null) {
                        if (finaladrs != "") {
                            finaladrs += ", " + json['posts'][0].businessState;
                        } else {
                            finaladrs += json['posts'][0].businessState;
                        }
                    }
                }

                if (json['posts'][0].businessMeetingZip != "" && json['posts'][0].businessMeetingZip != null) {
                    if (finaladrs != "") {
                        finaladrs += ", " + json['posts'][0].businessMeetingZip;
                    } else {
                        finaladrs += json['posts'][0].businessMeetingZip;
                    }
                } else {
                    if (json['posts'][0].businessZip != "" && json['posts'][0].businessZip != null) {
                        if (finaladrs != "") {
                            finaladrs += ", " + json['posts'][0].businessZip;
                        } else {
                            finaladrs += json['posts'][0].businessZip;
                        }
                    }
                }
                let inspectorLateReason = json['posts'][0].inspectorLateReason;

                let showLateReason = true
                if (inspectorLateReason == "") {
                    showLateReason = false
                }


                let beginedJust = false
                if (json['posts'][0].date_time_appoinment == "" && json['posts'][0].clientId != CONSTANTS.CLIENT_ID.hiltonClientId) {
                    beginedJust = true
                }

                if (posts == "0" || posts == null) {
                    this.setState({
                        loading: false,
                    });
                    return;
                }
                this.setState({
                    orderDetails: posts[0],
                    finaladrs,
                    showLateReason,
                    letInspMsgs,
                    beginedJust
                })


                // For loading photos
                ApiHelper._fetchDataReponse(this,
                    CONSTANTS.REQUESTMETHODS.GET,
                    ApiUrls.REPORT_PHOTOS + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id,
                    [], (response) => {
                        this.setState({
                            reportPhotos: response.data.posts || [],
                            loading: false
                        })
                    }, { offlineVerisionKey: `order_reportphotos-${this.state.orderInfo.id}` })

            },
                { disableHTMLParse: true, offlineVerisionKey: `order_orderdetails-${this.state.orderInfo.id}` }
            );
        this.loadMessages()
    }

    loadMessages = () => {
        // fetching inspector message
        ApiHelper
            ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.FETCH_INSPECTOR_MESSAGE + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id, [], (response) => {

                let posts = response.data.posts;
                posts = posts.filter(post => typeof post === 'object')
                this.setState({
                    inspectorMsgs: posts
                })
            }, { offlineVerisionKey: `order_insp_messages-${this.state.orderInfo.id}` })
    }

    orderConfirmDescline = (action) => {
        let isChecked = this.state[action]

        if (!isChecked) {
            alert('You must check the checkbox above')
            return
            const msg = ''
            // if(action === 'orderDecline2'){
            // }
        } else {
            if (action == 'orderDecline1') {
                if (this.state.orderDecline1C == '') {
                    alert('Please use the Please Explain box to let us know when you will be available again to do inspections in your area for us')
                    return
                }
                this.setState({ loading: true })
                ApiHelper
                    ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.DECLINE_ORDER + "&email=" + this.state.orderDetails.insp_email + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id + '&comments=' + this.state.orderDecline1C, [], (response) => {
                        this.setState({
                            loading: false
                        })
                        this.props.navigation.goBack()
                    })
            } else if (action == 'orderDecline2') {
                if (this.state.orderDecline2C == '') {
                    alert('Please use the Please Explain box to let us know the reason')
                    return
                }
                this.setState({ loading: true })
                ApiHelper
                    ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.DECLINE_ORDER + "&email=" + this.state.orderDetails.insp_email + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id + '&comments=' + this.state.orderDecline2C + '&decline=2', [], (response) => {
                        this.setState({
                            loading: false
                        })
                        this.props.navigation.goBack()
                    })
            } else {
                this.setState({ loading: true })
                ApiHelper
                    ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.CONFIRM_ORDER + "&email=" + this.state.orderDetails.insp_email + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id, [], (response) => {
                        this.setState({
                            loading: false
                        })
                        this.props.navigation.goBack()
                    })
            }
        }
    }

    _submitComment = () => {
        if (this.state.comment == "") {
            showMessage({
                message: strings["Comment should not be empty"],
                type: 'danger',
            })
            return;
        }
        this.setState({
            loading: true,
        });
        ApiHelper._fetchDataReponse(this,
            CONSTANTS.REQUESTMETHODS.POST,
            ApiUrls.INSPECTOR_MESSAGE + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id + "&newComment=" + this.state.comment,
            {
                newComment: this.state.comment
            },
            (response) => {
                this.setState({
                    comment: '',
                    loading: false
                })
                alert('Message Submitted')
                this.loadMessages()
            });
    }

    handleCalendar = (calendarMode = null) => {
        this.setState({
            calendarMode
        })
    }
    _saveAppointment = () => {
        const { appointmentTime, orderDetails: {
            date_time_appoinment,
            PCD_compare: pcdCompare,
            inspectorLateReason
        } } = this.state
        if (!(date_time_appoinment || appointmentTime)) {
            alert('Appointment Date Time Missing, Please Add Date Time to Save')
            return
        }
        const app_date = this.state.appointmentTime ? this.state.appointmentDate + ' ' + this.state.appointmentTime : date_time_appoinment
        // Code for on save
        var PCD_compare_parts = pcdCompare.split(',');
        var startDateTime = new Date(PCD_compare_parts[0] + '/ ' + PCD_compare_parts[1] + '/' + PCD_compare_parts[2] + ' ' + PCD_compare_parts[3] + ':' + PCD_compare_parts[4]);
        var selected_datetime_parts = app_date.split(' ');
        var selected_date_parts = selected_datetime_parts[0].split('/');
        var selected_time_parts = selected_datetime_parts[1].split(':');
        var AMPM = selected_datetime_parts[2];
        var SelectedHour = parseInt(selected_time_parts[0]);
        if (AMPM == "PM" && SelectedHour < 12)
            SelectedHour = SelectedHour + 12;
        if (AMPM == "AM" && SelectedHour == 12)
            SelectedHour = SelectedHour - 12;
        var endDateTime = new Date(selected_date_parts[2] + '/ ' + selected_date_parts[0] + '/' + selected_date_parts[1] + ' ' + SelectedHour + ':' + selected_time_parts[1]);

        if (startDateTime < endDateTime) {
            //You have Set an Appointment Date/Time which is past the Due Date for this order. Please provide additional information which can be communicated to our Client. Select from the following reasons or if the reason does not exist, please provide a brief explanation below
            if (inspectorLateReason.trim().length < 4) {
                alert('You have Set an Appointment Date/Time which is past the Due Date for this order. Please provide additional information which can be communicated to our Client. Select from the following reasons or if the reason does not exist, please provide a brief explanation below.\nAppointment Date Past Deadline');
                this.setState({
                    showLateReason: true
                })
                return
            }
        }
        this.setState({
            loading: true,
        });

        ApiHelper._fetchDataReponse(this,
            CONSTANTS.REQUESTMETHODS.GET,
            ApiUrls.SAVE_APPOINTMENT_DATE + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id + "&date_time_appoinment=" + app_date + "&inspectorLateReason=" + inspectorLateReason,
            {
                newComment: this.state.comment
            },
            (response) => {
                this.setState({
                    loading: false
                })
                alert('Appointment Date Saved')
                CommonFunctions
                    ._goBack(this.props.navigation);
            });

    }

    openCamera = (qid) => {
        ImagePicker.launchCamera(this.imageConfig, (photo) => {
            if (!photo.didCancel) {
                photo.isUploaded = false
                this.uploadAdditionalPhoto(photo, 1)
            }
        });
    }


    openGallery = (qid) => {
        ImagePicker.launchImageLibrary(this.imageConfig, (photo) => {
            if (!photo.didCancel) {
                photo.isUploaded = false
                this.uploadAdditionalPhoto(photo, 2)
            }
        });
    }

    uploadAdditionalPhoto = (photo) => {
        let data = new FormData();
        if (!photo.type.includes('jp')) {
            alert('Only JPG/JPEG images are allowed.')
        }
        data.append('name', {
            uri: photo.uri,
            type: photo.type,
            name: photo.fileName
        })
        this.setState({
            loading: true,
            photoProgress: `0 KB uploaded of ${Math.floor(photo.fileSize / 1024)} KB`
        })
        ApiHelper._fetchDataReponse(this,
            CONSTANTS.REQUESTMETHODS.POST,
            ApiUrls.ADDITIONAL_PHOTOS + "&inspector_id=" + this.state.userInformation.userId + "&orderId=" + this.state.orderInfo.id,
            data,
            (response) => {
                this.setState({
                    loading: false,
                    addtionalImages: [...this.state.addtionalImages, response?.data?.thumb_url]
                }, () => {

                })
            }, {
            onUploadProgress: (progressEvent) => {
                this.setState({ photoProgress: `${Math.floor(progressEvent.loaded / 1024)} KB uploaded of ${Math.floor(progressEvent.total / 1024)} KB` })
            }
        })
    }

    render() {
        const { id, clientId } = this.state.orderInfo;
        const { name, userId } = this.state.userInformation;
        const { InspectionType, businessName, businessDBA, contactName, businessPhone, businessPhoneExt, date_time_appoinment, clientname, li_contact_show, inspection_type, dueDate, PCD_compare, homePhone, mobilePhone, businessMeetingAddress, businessMeetingAddress2, businessAddress, businessAddress2, businessMeetingCity, businessMeetingState, businessMeetingZip, businessCity, businessState, businessZip, product_sold, general_instruction, createDate, status, dateCompleted, inspectorId, inspectorName, insp_companyName, insp_businessPhone, insp_homePhone, insp_cellPhone, insp_email, inspectorFee, best_daytime_to_contact, comments, late_reason_options, inspectorLateReason, projectedCompletion, hide_after_complete, confirm_decline_box, quick_guide } = this.state.orderDetails;
        const { calendarMode, finaladrs, showLateReason, letInspMsgs, beginedJust, inspectorMsgs } = this.state

        return (
            <Container style={{ backgroundColor: '#E4E4E4' }} >
                <AppHeader
                    navigation={this.props.navigation}
                    title={strings["View Order"]}
                    showBack
                />
                <Spinner
                    visible={this.state.loading}
                    textContent={this.state.photoProgress || strings.Loading}
                    textStyle={{ color: 'white', fontSize: 16 }}

                />
                <Content
                    ref={c => (this.contentRef = c)}
                >
                    <AppDate
                        name={
                            (name != null)
                                ? this.state.userInformation.name
                                : null
                        }
                    />
                    <AppButton
                        text={
                            (clientId == null)
                                ? strings["IMPORTANT! Tap Here to Review Quick Guide"]
                                : (clientId == CONSTANTS.CLIENT_ID.hiltonClientId)
                                    ? strings["TAP HERE to Open/Review Quick Guide"]
                                    : strings["IMPORTANT! Tap Here to Review Quick Guide"]
                        }
                        textStyle={{
                            textTransform: 'capitalize',
                            fontStyle: 'normal',
                        }}
                        onPress={() => {
                            Linking.openURL(ApiUrls.DOCURL + quick_guide);
                        }}
                    />
                    <Card
                        style={[STYLE.cardStyle, { marginTop: 15 }]}>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Metro Order Number"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={id}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Order Date/Time"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={createDate}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Current Status"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={status}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Inspection Deadline"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={projectedCompletion}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Appointment Date/Time"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={date_time_appoinment || (this.state.appointmentTime ? this.state.appointmentDate + ' ' + this.state.appointmentTime : '')}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        {
                            (dateCompleted == "0000-00-00 00:00:00")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Date Completed"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={dateCompleted}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings.Client}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={clientname}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        {
                            (InspectionType == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Inspection Type"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={InspectionType}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (businessName == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={
                                                (clientId == CONSTANTS.CLIENT_ID.hiltonClientId)
                                                    ? strings["Location ID"]
                                                    : strings["Business Name"]
                                            }
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessName}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (businessDBA == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Business DBA"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessDBA}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (contactName == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Contact Name"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={contactName}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (businessPhone == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Business Phone"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessPhone}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (businessPhoneExt == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Business Phone Ext."]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessPhoneExt}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (homePhone == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Merchant Home Phone"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={homePhone}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (mobilePhone == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Merchant Mobile Phone"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={mobilePhone}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (businessMeetingAddress != null && businessMeetingAddress != "")
                                ? <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={
                                                (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                    ? strings["Meeting Address"]
                                                    : strings["Business Address"]
                                            }
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessMeetingAddress}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                                : (businessAddress != null && businessAddress != "")
                                    ? <Item
                                        style={styles.itemStyle}>
                                        <Left
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={
                                                    (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                        ? strings["Meeting Address"]
                                                        : strings["Business Address"]
                                                }
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.headingStyle}
                                            />
                                        </Left>
                                        <Right
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={businessAddress}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.valueStyle}
                                            />
                                        </Right>
                                    </Item>
                                    : null
                        }
                        {
                            (businessMeetingAddress2 != null && businessMeetingAddress2 != "")
                                ? <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={
                                                (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                    ? strings["Meeting Address"] + " 2"
                                                    : strings["Business Address"] + " 2"
                                            }
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessMeetingAddress2}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                                : (businessAddress2 != null && businessAddress2 != "")
                                    ? <Item
                                        style={styles.itemStyle}>
                                        <Left
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={
                                                    (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                        ? strings["Meeting Address"] + " 2"
                                                        : strings["Business Address"] + " 2"
                                                }
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.headingStyle}
                                            />
                                        </Left>
                                        <Right
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={businessAddress2}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.valueStyle}
                                            />
                                        </Right>
                                    </Item>
                                    : null
                        }
                        {
                            (businessMeetingCity != null && businessMeetingCity != "")
                                ? <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={
                                                (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                    ? strings["Meeting City"]
                                                    : strings["Business City"]
                                            }
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessMeetingCity}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                                : (businessCity != null && businessCity != "")
                                    ? <Item
                                        style={styles.itemStyle}>
                                        <Left
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={
                                                    (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                        ? strings["Meeting City"]
                                                        : strings["Business City"]
                                                }
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.headingStyle}
                                            />
                                        </Left>
                                        <Right
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={businessCity}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.valueStyle}
                                            />
                                        </Right>
                                    </Item>
                                    : null
                        }
                        {
                            (businessMeetingState != "" && businessMeetingState != null)
                                ? <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={
                                                (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                    ? strings["Meeting State"]
                                                    : strings["Business State"]
                                            }
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessMeetingState}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                                : (businessState != null && businessState != "")
                                    ? <Item
                                        style={styles.itemStyle}>
                                        <Left
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={
                                                    (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                        ? strings["Meeting State"]
                                                        : strings["Business State"]
                                                }
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.headingStyle}
                                            />
                                        </Left>
                                        <Right
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={businessState}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.valueStyle}
                                            />
                                        </Right>
                                    </Item>
                                    : null
                        }
                        {
                            (businessMeetingZip != "" && businessMeetingZip != null)
                                ? <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={
                                                (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                    ? strings["Meeting Zip"]
                                                    : strings["Business Zip"]
                                            }
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={businessMeetingZip}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.valueStyle}
                                        />
                                    </Right>
                                </Item>
                                : (businessZip != null && businessZip != "")
                                    ? <Item
                                        style={styles.itemStyle}>
                                        <Left
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={
                                                    (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                                        ? strings["Meeting Zip"]
                                                        : strings["Business Zip"]
                                                }
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.headingStyle}
                                            />
                                        </Left>
                                        <Right
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={businessZip}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.valueStyle}
                                            />
                                        </Right>
                                    </Item>
                                    : null
                        }
                        {
                            (product_sold != null)
                                ? (product_sold.length < 2)
                                    ? null
                                    : <Item
                                        style={styles.itemStyle}>
                                        <Left
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={strings["Product/Service Sold"]}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.headingStyle}
                                            />
                                        </Left>
                                        <Right
                                            style={{
                                                flex: 1
                                            }}>
                                            <AppText
                                                text={product_sold}
                                                color={CONSTANTS.COLORS.BLACK}
                                                customStyle={styles.valueStyle}
                                            />
                                        </Right>
                                    </Item>
                                : null
                        }
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["General Instructions"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={general_instruction}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        {
                            (best_daytime_to_contact == "")
                                ? null
                                : <Item
                                    style={styles.itemStyle}>
                                    <Left
                                        style={{
                                            flex: 1
                                        }}>
                                        <AppText
                                            text={strings["Merchant's Best Windows (day/time) of Availability to Meet with Inspector"]}
                                            color={CONSTANTS.COLORS.BLACK}
                                            customStyle={styles.headingStyle}
                                        />
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                        <InputText
                                            placeholder={strings.Availability}
                                            editable={false}
                                            value={best_daytime_to_contact}
                                        />
                                    </Right>
                                </Item>
                        }
                        {
                            (comments == "")
                                ? null
                                : <View
                                    style={{ width: '100%', padding: 13 }}>
                                    <AppText
                                        text={strings["Special Instructions Given by Client:"]}
                                        color={CONSTANTS.COLORS.RED}
                                        customStyle={{ ...styles.headingStyle, fontSize: 20, marginBottom: 10 }}
                                    />
                                    <View style={{ width: '100%', borderWidth: 1, borderColor: '#cccccc' }} >
                                        <AppText
                                            text={comments}
                                            color={'#555555'}
                                            customStyle={{ ...styles.headingStyle, margin: 10, marginBottom: 40 }}
                                        />
                                    </View>
                                    {/* <InputText
                                        multiline
                                        editable={false}
                                        value={comments}
                                    /> */}
                                    {/* <Left
                                        style={{
                                            flex: 1
                                        }}>
                                      
                                    </Left>
                                    <Right
                                        style={{
                                            flex: 1
                                        }}>
                                       
                                    </Right> */}
                                </View>
                        }
                    </Card>
                    <Card
                        style={[STYLE.cardStyle, { alignItems: 'center' }]}>
                        <AppText
                            text={strings["Inspector Information"]}
                            color={CONSTANTS.COLORS.PRIMARY2}
                            fontSize={CONSTANTS.FONT_SIZES.LARGE}
                            customStyle={{
                                fontWeight: 'bold',
                            }}
                        />
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Inspector ID"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={inspectorId}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings.Name}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={inspectorName}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Business Name"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={insp_companyName}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Business Phone"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={insp_businessPhone}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Home Phone"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={insp_homePhone}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Cell Phone"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={insp_cellPhone}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={styles.itemStyle}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings.Email}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={insp_email}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        <Item
                            style={[styles.itemStyle, { borderTopWidth: 1, borderColor: 'black' }]}>
                            <Left
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={strings["Inspector Fee"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.headingStyle}
                                />
                            </Left>
                            <Right
                                style={{
                                    flex: 1
                                }}>
                                <AppText
                                    text={inspectorFee}
                                    color={CONSTANTS.COLORS.BLACK}
                                    customStyle={styles.valueStyle}
                                />
                            </Right>
                        </Item>
                        {
                            this.state.showInstructions
                                ? <View
                                    style={{
                                        padding: 10,
                                        alignSelf: 'flex-start',
                                    }}>
                                    <AppText
                                        text={'Special Instructions Given by Client:'}
                                        color={CONSTANTS.COLORS.RED}
                                        fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                        customStyle={{
                                            alignSelf: 'flex-start',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    <AppText
                                        text={'PLEASE use the Metro Mobile App to complete this assignment! You can find the APP in the Google Play or App Store. "Metro Insp" The icon is a magnifying glass that says "Metro" accross the front'}
                                        color={CONSTANTS.COLORS.TEXTCOLOR4}
                                        fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                        customStyle={{
                                            alignSelf: 'flex-start',
                                            padding: 10,
                                            borderColor: CONSTANTS.COLORS.TEXTCOLOR4,
                                            borderWidth: 1,
                                            borderRadius: 10,
                                            marginTop: 10,
                                            fontWeight: '100',
                                        }}
                                    />
                                </View>
                                : null
                        }
                    </Card>

                    {
                        (confirm_decline_box)
                            ? <Card
                                style={[STYLE.cardStyle, { width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 }]}>
                                <Text
                                    style={[STYLE.textStyle, {
                                        fontWeight: 'normal',
                                        textAlign: 'center',
                                        color: CONSTANTS.COLORS.RED,
                                        fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                    }]}>
                                    <Text
                                        style={{
                                            textDecorationLine: 'underline',
                                        }}>
                                        {strings["Important Note to Inspector: "]}
                                    </Text>
                                    {strings["Thank you for logging into our Inspection System. If you are unable to accept or complete this order, please indicate by checking the applicable box below and providing explanation or comments. Doing this will remove this inspection from your inspection queue. Otherwise please confirm below:"]}
                                </Text>
                                <AppText
                                    text={strings["Accept and Confirm Inspection"]}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                    customStyle={{
                                        marginTop: 15,
                                    }}
                                />
                                <CheckBox
                                    onPress={() => this.setState(({ orderConfirm }) => ({ orderConfirm: !orderConfirm }))}
                                    checked={this.state.orderConfirm}
                                    title={strings["I am confirming that I have received this assignment and agree to complete the site verification to the guidelines as set forth in the Quick Guide and within the time specified by Metro Inspections."]}
                                    textStyle={{
                                        fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                        fontWeight: 'normal',
                                        color: '#999999',
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        textTransform: 'capitalize',
                                        paddingRight: 10,
                                        letterSpacing: 0.9,
                                        lineHeight: 18

                                    }}
                                    containerStyle={{
                                        backgroundColor: CONSTANTS.COLORS.TRANSPERANT,
                                        borderWidth: 0,
                                    }}
                                    wrapperStyle={{
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                    }}
                                />
                                <AppButton
                                    onPress={() => this.orderConfirmDescline('orderConfirm')}
                                    text={strings.Confirm}
                                    btnStyle={{
                                        borderRadius: 0,
                                        width: '95%',
                                        elevation: 0,
                                        shadowColor: CONSTANTS.COLORS.TRANSPERANT,
                                        marginBottom: 30,
                                        marginHorizontal: 0,
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        textTransform: 'capitalize',
                                        fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                    }}
                                />
                                <Divider
                                    style={{
                                        height: 1,
                                        backgroundColor: CONSTANTS.COLORS.GRAY,
                                        width: '95%',
                                    }}
                                />
                                <AppText
                                    text={strings["Decline Inspection and Remain as an Active Inspector with Metro Inspections"]}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                    customStyle={{
                                        marginTop: 15,
                                        textAlign: 'center',
                                    }}
                                />
                                <CheckBox
                                    onPress={() => this.setState(({ orderDecline1 }) => ({ orderDecline1: !orderDecline1 }))}
                                    checked={this.state.orderDecline1}
                                    title={strings["I am unable to complete this inspection but would like to remain as an active inspector with Metro Inspections. I wish to be contacted in the future for other inspections. (Please notate the dates you will be unavailable to do inspection work for Metro Inspections.)"]}
                                    textStyle={{
                                        fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                        fontWeight: 'normal',
                                        color: '#999999',
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        textTransform: 'capitalize',
                                        paddingRight: 10,
                                        letterSpacing: 0.9,
                                        lineHeight: 18

                                    }}
                                    containerStyle={{
                                        backgroundColor: CONSTANTS.COLORS.TRANSPERANT,
                                        borderWidth: 0,
                                    }}
                                    wrapperStyle={{
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                    }}
                                />
                                <AppText
                                    text={strings["Please use the box below to let us know when you will be available to do inspections in your area again"]}
                                    color={CONSTANTS.COLORS.BLACK}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                    customStyle={{
                                        marginTop: 15,
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        letterSpacing: 0.6,
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        textTransform: 'capitalize'
                                    }}
                                />
                                <AppText
                                    text={strings["Please Explain"]}
                                    customStyle={{
                                        marginTop: 15,
                                        fontSize: 14,
                                        letterSpacing: 0.6,
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        color: 'black',
                                        fontWeight: 'bold',
                                    }}
                                />
                                <TextInput
                                    onChangeText={(text) => this.setState({ orderDecline1C: text })}
                                    multiline
                                    placeholder={strings["Your Comments"]}
                                    style={{
                                        textAlign: 'left',
                                        height: 100,
                                        borderColor: CONSTANTS.COLORS.GRAY,
                                        borderWidth: 1,
                                        width: '95%',
                                        marginBottom: 20,
                                        padding: 10,
                                    }}
                                />
                                <AppButton
                                    onPress={() => this.orderConfirmDescline('orderDecline1')}
                                    text={strings.Decline}
                                    btnStyle={{
                                        borderRadius: 0,
                                        width: '95%',
                                        elevation: 0,
                                        shadowColor: CONSTANTS.COLORS.TRANSPERANT,
                                        marginBottom: 30,
                                        marginHorizontal: 0,
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        textTransform: 'capitalize',
                                        fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                    }}
                                />
                                <Divider
                                    style={{
                                        height: 1,
                                        backgroundColor: CONSTANTS.COLORS.GRAY,
                                        width: '95%',
                                    }}
                                />
                                <AppText
                                    text={strings["Decline Inspection and Discontinue My Inspector Status with Metro Inspections"]}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                    customStyle={{
                                        marginTop: 15,
                                        textAlign: 'center',
                                        color: 'red'
                                    }}
                                />
                                <CheckBox
                                    onPress={() => this.setState(({ orderDecline2 }) => ({ orderDecline2: !orderDecline2 }))}
                                    checked={this.state.orderDecline2}
                                    title={strings["I am declining this inspection and wish to discontinue my status as an inspector with Metro Inspections. (This will remove you from our list of active inspectors and you will no longer be offered inspections or be able to login to our Inspection System)."]}
                                    textStyle={{
                                        fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                        fontWeight: 'normal',
                                        color: '#999999',
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        textTransform: 'capitalize',
                                        paddingRight: 10,
                                        letterSpacing: 0.9,
                                        lineHeight: 18

                                    }}
                                    containerStyle={{
                                        backgroundColor: CONSTANTS.COLORS.TRANSPERANT,
                                        borderWidth: 0,
                                    }}
                                    wrapperStyle={{
                                        alignItems: 'flex-start',
                                        justifyContent: 'flex-start',
                                    }}
                                />
                                <AppText
                                    text={strings["Please Explain"]}
                                    color={CONSTANTS.COLORS.BLACK2}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                    customStyle={{
                                        marginTop: 15,
                                        fontSize: 14,
                                        letterSpacing: 0.6,
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        color: 'black',
                                        fontWeight: 'bold',
                                    }}
                                />
                                <TextInput
                                    onChangeText={(text) => this.setState({ orderDecline2C: text })}
                                    multiline
                                    placeholder={strings["Your Comments"]}
                                    style={{
                                        textAlign: 'left',
                                        height: 100,
                                        borderColor: CONSTANTS.COLORS.GRAY,
                                        borderWidth: 1,
                                        width: '95%',
                                        marginBottom: 20,
                                        padding: 10,
                                    }}
                                />
                                <AppButton
                                    onPress={() => this.orderConfirmDescline('orderDecline2')}
                                    text={strings['Decline and disable my account']}
                                    btnStyle={{
                                        borderRadius: 0,
                                        width: '95%',
                                        elevation: 0,
                                        shadowColor: CONSTANTS.COLORS.TRANSPERANT,
                                        marginBottom: 20,
                                        marginHorizontal: 0,
                                        alignSelf: 'center'
                                    }}
                                    textStyle={{
                                        textTransform: 'capitalize',
                                        fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                    }}
                                />
                            </Card>
                            : null
                    }

                    {clientId !== CONSTANTS.CLIENT_ID.hiltonClientId && < Card
                        style={[STYLE.cardStyle, {
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            paddingVertical: 20,
                        }]}>
                        <AppText
                            text={strings["Appointment Date and Time"]}
                            color={CONSTANTS.COLORS.PRIMARY2}
                            fontSize={CONSTANTS.FONT_SIZES.HEADING}
                            customStyle={{
                                fontWeight: 'bold',
                            }}
                        />
                        {
                            (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                ? null
                                : <AppText
                                    text={strings["Note to Inspector: This inspection requires that you make an appoinment before proceeding to conduct the inspection."]}
                                    color={CONSTANTS.COLORS.RED}
                                    fontSize={CONSTANTS.FONT_SIZES.SMALL}
                                    customStyle={{
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        marginVertical: 15,
                                    }}
                                />
                        }
                        <TouchableOpacity
                            style={{
                                width: '100%',
                                borderTopColor: CONSTANTS.COLORS.GRAY,
                                borderTopWidth: 1,
                                borderBottomColor: CONSTANTS.COLORS.GRAY,
                                borderBottomWidth: 1,
                                alignItems: 'center',
                                paddingVertical: 10,
                            }}
                            activeOpacity={0.8}
                            onPress={() => hide_after_complete || (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId) ? null : this.handleCalendar("date")}
                        >

                            <Text
                                style={{
                                    fontSize: CONSTANTS.FONT_SIZES.LARGE,
                                    color: CONSTANTS.COLORS.BLACK2,

                                }}>
                                {this.state.appointmentTime ? this.state.appointmentDate + ' ' + this.state.appointmentTime : (date_time_appoinment ? date_time_appoinment : strings["set date and time"])}
                            </Text>
                        </TouchableOpacity>
                        {
                            (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                ? <AppText
                                    text={strings["Note to Inspector: This is a pre-set appointment which you have agreed to attend. Please arrive at the Meeting address on-time! If for any reason, you are unable to keep this appointment or will be late, Please call Metro ASAP at 1-800-339-0547, Option 1.2."]}
                                    color={CONSTANTS.COLORS.RED}
                                    fontSize={CONSTANTS.FONT_SIZES.SMALL}
                                    customStyle={{
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 15,
                                        marginBottom: 0
                                    }}
                                />
                                : null
                        }
                        {/* <InputText
                            placeholder={moment().format("DD/MM/YYYY hh:mm A")}
                            placeholderTextColor={CONSTANTS.COLORS.TEXTCOLOR4}
                            borderColor={CONSTANTS.COLORS.TEXTCOLOR4}
                            borderWidth={1}
                            customStyle={{
                                textAlign: 'center',
                                fontSize: CONSTANTS.FONT_SIZES.ABOVELARGE,
                                padding: 0,
                                width: '100%',
                                paddingHorizontal: 10,
                                fontFamily: 'arial',
                            }}
                            editable={false}
                        /> */}

                        {/* {late reasone code} */}
                        <Text>{`\n`}</Text>
                        {!!showLateReason && <>
                            <AppText
                                text={strings["Select Reason Appointment Set Past Due Date:"]}
                                color={CONSTANTS.COLORS.PRIMARY2}
                                fontSize={CONSTANTS.FONT_SIZES.SMALL}
                                customStyle={{
                                    fontWeight: 'bold',
                                    marginBottom: -10
                                }}
                            />
                            <Dropdown
                                label='Select Inspector Late Reason'
                                containerStyle={{ width: '100%' }}
                                value={inspectorLateReason
                                    // letInspMsgs.includes(inspectorLateReason) ? inspectorLateReason : ""
                                }
                                fontSize={13}
                                onChangeText={comment => {
                                    this.setState({
                                        orderDetails: {
                                            ...this.state.orderDetails,
                                            inspectorLateReason: comment
                                        }
                                    })
                                }}
                                data={letInspMsgs.map(val => ({ value: val }))}
                            />
                            <TextInput
                                multiline
                                style={{
                                    borderWidth: 2,
                                    borderColor: CONSTANTS.COLORS.PRIMARY2,
                                    paddingHorizontal: 5,
                                    borderRadius: 5,
                                    margin: 10,
                                    width: '100%',
                                    fontSize: 16,
                                    minHeight: 70,
                                }}
                                value={inspectorLateReason}
                                onChangeText={comment => {
                                    this.setState({
                                        orderDetails: {
                                            ...this.state.orderDetails,
                                            inspectorLateReason: comment
                                        }
                                    })
                                }}
                            /></>}
                        {
                            (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId || hide_after_complete)
                                ? null
                                : <AppButton
                                    text={strings["Save My Appointment"]}
                                    onPress={this._saveAppointment}
                                    shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                                />
                        }
                    </Card>
                    }
                    {!beginedJust && !hide_after_complete &&
                        <TouchableOpacity
                        activeOpacity={0.9}
                            onPress={() => CommonFunctions._openPage(CONSTANTS.ROUTENAMES.Inspection, this.props.navigation, {
                                inspectorId: this.state.userInformation.userId,
                                orderId: this.state.orderInfo.id,
                                clientId: clientId,
                                contactName: contactName,
                                orderDetails: this.state.orderDetails
                            })}>
                            <View
                                style={{
                                    backgroundColor: CONSTANTS.COLORS.PRIMARY2,
                                    padding: 10,
                                    alignItems: 'center',
                                    paddingVertical: 5
                                }}>
                                <Text
                                    style={{
                                        textAlign: 'center',
                                        fontSize: 15,
                                        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                        color: CONSTANTS.COLORS.WHITE,
                                    }}>
                                    <Text
                                        style={{
                                            textDecorationLine: (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId) ? 'underline' : 'none',
                                        }}>
                                        {strings.After + " "}
                                    </Text>
                                    {strings["you have arrived at following address"] + ":"}
                                </Text>
                                <AppText
                                    text={finaladrs || 'njk, njk, njk'}
                                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                    color={CONSTANTS.COLORS.YELLOWPURE}
                                />
                                <AppText
                                    text={strings["Tap here to Begin Inspection"]}
                                    customStyle={{
                                        textTransform: 'uppercase',
                                        marginTop: 0,
                                    }}
                                    fontSize={CONSTANTS.FONT_SIZES.LARGE}
                                />
                            </View>
                        </TouchableOpacity>}
                    {!!hide_after_complete && !confirm_decline_box && <Card
                        style={[STYLE.cardStyle, {
                            alignItems: 'center',
                            paddingHorizontal: 10,
                            paddingVertical: 20,
                        }]}>
                        <AppText
                            text={strings["Additional Photos"]}
                            customStyle={{
                                fontWeight: 'bold',
                                color: '#cc0000',
                                marginBottom: 5,
                                alignSelf: 'flex-start'
                            }}
                            color={CONSTANTS.COLORS.PRIMARY2}
                            fontSize={CONSTANTS.FONT_SIZES.LARGE}
                        />
                        {
                            (clientId == CONSTANTS.CLIENT_ID.hiltonClientId)
                                ? <AppText
                                    text={`01. ${strings["If You Have Taken Additional Photos Please Upload Here"]}`}
                                    color={CONSTANTS.COLORS.BLACK}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                />
                                : <AppText
                                    text={`01. ${strings["If You Have Taken Additional Photos to Help Depict the Nature of This Business, Upload Here"]}`}
                                    color={CONSTANTS.COLORS.BLACK}
                                    fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                />
                        }
                        <View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap' }} >
                            {this.state.addtionalImages.map((img) => (<Image
                                resizeMode={'contain'}
                                source={{ uri: img }}
                                style={{ height: 100, width: 90, resizeMode: 'cover', borderWidth: 1, margin: 5 }}
                            />))}
                        </View>
                        <View style={{ alignItems: 'flex-start', width: '100%', flexDirection: 'row', justifyContent: 'flex-start' }} >
                            <AppButton
                                btnStyle={{ width: '30%', marginLeft: 0, margin: 10, height: 35, borderRadius: 10 }}
                                textStyle={{ fontSize: CONSTANTS.FONT_SIZES.NORMAL }}
                                text={strings.Camera}
                                onPress={this.openCamera}
                            />
                            <AppButton
                                btnStyle={{ width: '30%', margin: 10, height: 35, borderRadius: 10 }}
                                textStyle={{ fontSize: CONSTANTS.FONT_SIZES.NORMAL }}
                                text={strings.Gallery}
                                onPress={this.openGallery}
                            />
                        </View>
                    </Card>}
                    <Card
                        style={[STYLE.cardStyle, { alignItems: 'center' }]}>
                        {
                            (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                ? <AppText
                                    text={strings["Required Photos"]}
                                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    customStyle={{
                                        fontWeight: 'bold',
                                    }}
                                />
                                : <AppText
                                    text={strings["Report Photos"]}
                                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    customStyle={{
                                        fontWeight: 'bold',
                                    }}
                                />
                        }
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }} >
                            {this.state.reportPhotos.map(photo => {
                                if (!photo.thumb_src) {
                                    return
                                }
                                return (<TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(photo.href)}>
                                    <Image
                                        resizeMode={'contain'}
                                        source={{ uri: photo.thumb_src }}
                                        style={{ height: 100, width: 90, resizeMode: 'cover', borderWidth: 1, margin: 5 }}
                                    />
                                </TouchableOpacity>)
                            })}
                        </View>
                    </Card>

                    <Card
                        style={[STYLE.cardStyle, {
                        }]}
                    >
                        {
                            (clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId)
                                ?
                                <AppText
                                    text={strings["Inspector Message to Metro"]}
                                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    customStyle={{
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                    }}
                                /> :
                                <AppText
                                    text={strings["Inspector Messages"]}
                                    fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                    color={CONSTANTS.COLORS.PRIMARY2}
                                    customStyle={{
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginBottom: 10
                                    }}
                                />}
                        {inspectorMsgs.map(msg => {
                            return (
                                <>
                                    <AppText
                                        text={msg.type}
                                        fontSize={CONSTANTS.FONT_SIZES.HEADING}
                                        color={CONSTANTS.COLORS.PRIMARY2}
                                        customStyle={{
                                            marginLeft: 10,
                                            marginBottom: 0
                                        }}
                                    />
                                    <AppText
                                        text={msg.message}
                                        fontSize={CONSTANTS.FONT_SIZES.NORMAL}
                                        color={CONSTANTS.COLORS.BLACK2}
                                        customStyle={{
                                            marginLeft: 10,
                                        }}
                                    />
                                    <AppText
                                        text={`${msg.date_time} by ${msg.by_email}`}
                                        fontSize={CONSTANTS.FONT_SIZES.MICROSMALL}
                                        color={CONSTANTS.COLORS.BLACK2}
                                        customStyle={{
                                            marginTop: 5,
                                            marginLeft: 10
                                        }}
                                    />
                                    <Divider style={{ height: 2, marginBottom: 10, marginTop: 5, marginHorizontal: 10 }} />
                                </>
                            );


                        })}


                        <AppText
                            text={strings["Send Metro New Message"]}
                            fontSize={CONSTANTS.FONT_SIZES.HEADING}
                            color={CONSTANTS.COLORS.BLACK2}
                            customStyle={{
                                marginLeft: 10,
                                marginTop: 30,
                            }}
                        />
                        <TextInput
                            multiline
                            style={{
                                borderWidth: 1,
                                borderColor: CONSTANTS.COLORS.GRAY,
                                borderRadius: 5,
                                margin: 10,
                                minHeight: 100,
                            }}
                            value={this.state.comment}
                            onChangeText={comment => {
                                this.setState({
                                    comment
                                })
                            }}
                        />
                        {/* <HTML html={this.state.inspectorMsgHTML}  /> */}
                        <AppButton
                            text={(clientId == CONSTANTS.CLIENT_ID.bhgClientId || clientId == CONSTANTS.CLIENT_ID.fundexClientId) ? strings["Click to Send Message"] : strings["Send Message"]}
                            btnStyle={{
                                marginHorizontal: 10,
                                borderRadius: 0,
                                width: '95%',
                                height: 45
                            }}
                            onPress={this._submitComment}
                            shadowColor={CONSTANTS.COLORS.TRANSPERANT}
                        />
                    </Card>
                </Content>

                <Fab
                    onPress={() => this.contentRef._root.scrollToPosition(0, 0)}
                    style={{ backgroundColor: CONSTANTS.COLORS.PRIMARY2, height: 40, width: 40 }}
                    position="bottomRight">
                    <Icon
                        name="keyboard-arrow-up"
                        type='MaterialIcons'
                        style={{
                            fontSize: CONSTANTS.FONT_SIZES.LARGER
                        }}
                    />
                </Fab>
                {/* <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                    }}
                    onPress={() => {
                        
                    }}>
                    <Avatar
                        icon={{
                            name: 'arrow-upward',
                            type: 'Ionicons'
                        }}
                        size='medium'
                        rounded
                        iconStyle={STYLE.iconStyle}
                        overlayContainerStyle={{
                            backgroundColor: CONSTANTS.COLORS.PRIMARY2
                        }}
                    />
                </TouchableOpacity> */}
                {
                    calendarMode == 'date' && <DateTimeModal
                        onConfirm={(date) => {
                            this.handleCalendar('time')
                            this.setState({
                                appointmentDate: moment(date).tz(timeZone.tz.guess()).format("MM/DD/YYYY")// moment.tz(timeZone.tz.guess()).format('ddd, MMM D, YYYY, hh:mm a (z)')
                            })
                        }}
                        onCancel={() => {
                            this.setState({
                                appointmentDate: null,
                                appointmentTime: null,
                                calendarMode: null
                            })
                        }}
                        isVisible={true}
                        mode={'date'}
                    />
                }
                {
                    calendarMode == 'time' && <DateTimeModal
                        onConfirm={(time) => {
                            this.handleCalendar(null)
                            this.setState({
                                appointmentTime: moment(time).tz(timeZone.tz.guess()).format("hh:mm A")
                            })
                        }}
                        onCancel={() => {
                            this.setState({
                                appointmentDate: null,
                                appointmentTime: null,
                                calendarMode: null
                            })
                        }}
                        isVisible={true}
                        mode={'time'}
                    />
                }
            </Container >
        )
    }
}

const styles = {
    itemStyle: {
        padding: 5,
    },
    headingStyle: {
        fontWeight: 'bold',
        letterSpacing: 0.6
    },
    valueStyle: {
        fontWeight: '100',
        // letterSpacing: 0.6,
        color: '#666666'
    },
}

export default ViewOrder;