import React, { Component } from 'react';
import { View, Alert, Text, TouchableOpacity, findNodeHandle } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Container, Content, Card, Row, Col, Grid, Fab, Icon } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import ApiHelper from '../../../utils/ApiHelper';
import ApiUrls, { PHOTOQUESTIONS } from '../../../utils/ApiUrls';
import { AppHeader, AppDate, AppText } from '../../common';
import strings from '../../../Language';
import STYLE from '../../css/STYLE';
import moment from 'moment';
import { Instructions } from './Instructions';
import { Photos } from './Photos';
import { SurveyQuestions } from './SurveyQuestions';
import _, { includes } from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';

const CONSTANTS = require('../../../utils/CONSTANTS');
class Inspection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showFirstRow: true,
      showSecondRow: false,
      loading: false,
      activeIndex: 0,
      photosDatas: {},
      locationType: null,
      onsiteContact: null,
      insttructionData: '',
      contactShowImpNotes: '',
      photos: {

      },
      photoProgress: null,
      questions: [],
      isInspectionCompleted: false,
      surveyQuestionsAnswers: {}
    };
    this.inspectorId = this.props.navigation.getParam('inspectorId')
    this.orderId = this.props.navigation.getParam('orderId')
    this.clientId = this.props.navigation.getParam('clientId')
    this.contactName = this.props.navigation.getParam('contactName')
    this.orderDetails = this.props.navigation.getParam('orderDetails')
    this.scrollRef = null
    this.storageKeyIns = `order_cached_instructions_questions_${this.inspectorId}_${this.orderId}`
    this.storageKeyPhoto = `order_cached_photos_questions_${this.inspectorId}_${this.orderId}`
    this.photoQuestionsRefs = {}
    this.requiredQuestions = []
  }

  async componentDidMount() {


    // initialisnig the filled value of instructions questions

    let alreadyStored = await AsyncStorage.getItem(this.storageKeyIns)
    if (alreadyStored) {
      alreadyStored = JSON.parse(alreadyStored)
      if (alreadyStored['locationType']) {
        this.setState({ locationType: alreadyStored['locationType'] })
      }
      if (alreadyStored['onsiteContact']) {
        this.setState({ onsiteContact: alreadyStored['onsiteContact'] })
      }
    }

    try {
      this.setState({ loading: true })
      // for loading order info
      await ApiHelper._fetchDataReponse(this,
        CONSTANTS.REQUESTMETHODS.GET,
        ApiUrls.INSPECTION_INSTRUCTIONS + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId,
        [],
        (response) => {
          const data = response.data.posts[0]
          this.setState({
            loading: false,
            insttructionData: data.instruction_html_raw,
            contactShowImpNotes: data.contact_show_important_notes,
          })
          return true
        }, { offlineVerisionKey: `order_inspinstruction-${this.orderId}`, disableHTMLParse: false })

    } catch (e) {

      this.setState({
        loading: false
      })
      this.props.navigation.goBack();
    }
  }


  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeIndex !== this.state.activeIndex && this.state.activeIndex == 1) {
      this.setState({
        loading: true
      })
      ApiHelper._fetchDataReponse(this,
        CONSTANTS.REQUESTMETHODS.GET,
        ApiUrls.PHOTOS_QUESTIONS + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId + "&location_type=" + this.state.locationType + "&onsite_contact=" + this.state.onsiteContact,
        [],
        async (response) => {

          // checking for offline stored photos
          const storedPhotoStorageKey = this.storageKeyPhoto
          let storedPhoto = await AsyncStorage.getItem(storedPhotoStorageKey)
          if (storedPhoto) {
            storedPhoto = JSON.parse(storedPhoto)
          } else {
            storedPhoto = {}
          }
          const photos = response.data.posts
          const parents = photos.filter(photo => photo.parentId == "0")
          const photosDatas = {}
          parents.forEach(parent => {
            photosDatas[parent.id] = { ...parent, childs: [] }
          })
          photos.filter(photo => photo.parentId != "0").forEach(child => {
            // if already photo to this qid is uploaded then we apped here
            if (Array.isArray(child.uploaded_photos_url)) {
              child.uploaded_photos_url.forEach(uploadedPhoto => {
                if (storedPhoto[child.id]) {
                  storedPhoto[child.id].push({
                    uri: uploadedPhoto.photo_url
                  })
                } else {
                  storedPhoto[child.id] = [{
                    uri: uploadedPhoto.photo_url
                  }]
                }
              })
            }
            photosDatas[child.parentId].childs.push(child)
          })
          this.setState({ photos: storedPhoto, photosDatas, loading: false })
        }, { offlineVerisionKey: `order_photos_questions-${this.orderId}` })
    } else if (prevState.activeIndex !== this.state.activeIndex && this.state.activeIndex == 2) {
      this.setState({ loading: true })
      ApiHelper._fetchDataReponse(this,
        CONSTANTS.REQUESTMETHODS.GET,
        ApiUrls.SURVEY_QUESTIONS + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId + "&location_type=" + this.state.locationType + "&onsite_contact=" + this.state.onsiteContact,
        [],
        (response) => {
          
          ApiHelper._fetchDataReponse(this,
            CONSTANTS.REQUESTMETHODS.GET,
            ApiUrls.SURVEY_QUESTIONS_ANSWERS + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId + "&location_type=" + this.state.locationType + "&onsite_contact=" + this.state.onsiteContact,
            [],
            (response) => {
              this.setState({
                surveyQuestionsAnswers: response.data.posts[0], loading: false 
              })
            }, { offlineVerisionKey: `order_survey_questions-answers-${this.orderId}` });

          // collecting required questions
          response.data.posts.forEach(({ required_questionIds }) => {
            if (required_questionIds)
            this.requiredQuestions=  this.requiredQuestions.concat(required_questionIds.split(","))
          })
          console.log('Required questions ids', this.requiredQuestions)
          // console.log('The questions\n\n\n',JSON.stringify(response.data.posts))
          const parentQuestions = response.data.posts.filter(question => question.parentId == 0)
          // putting child questions in parent
          response.data.posts.filter(question => question.parentId != 0).forEach(childQue => {
            const parentQue = parentQuestions.find(que => que.id == childQue.parentId) || {}
            if (parentQue.childQuestions && Array.isArray(parentQue.childQuestions)) {
              parentQue.childQuestions.push(childQue)
            } else {
              parentQue.childQuestions = [childQue]
            }
          })
          this.setState({ rawQuestions: response.data.posts, questions: parentQuestions})
        }, { offlineVerisionKey: `order_survey_questions-${this.orderId}` })
    }
  }

  setPhoto = (id, photo) => {
    this.setState((prevState) => ({
      photos: {
        ...prevState.photos,
        [id]: photo !== null ? (prevState['photos'][id] ? [...prevState['photos'][id], photo] : [photo]) : null
      }
    }))
  }

  uploadPhoto = async (id, photo, capturedFrom) => {
    const storageKey = this.storageKeyPhoto
    if (typeof photo === 'object' && photo !== null) {
      let data = new FormData();
      const _photoObj = {
        uri: photo.uri,
        type: photo.type,
        name: photo.fileName
      }
      data.append('name', _photoObj)
      const { isInternetReachable } = await NetInfo.fetch()
      if (!isInternetReachable) {

        // 
        _photoObj.id = id
        _photoObj.capturedFrom = capturedFrom

        let alreadyStored = await AsyncStorage.getItem(storageKey)
        if (alreadyStored) {
          alreadyStored = JSON.parse(alreadyStored)
          if (alreadyStored[id]) {
            alreadyStored[id].push(_photoObj)
          } else {
            alreadyStored[id] = [_photoObj]
          }
          await AsyncStorage.setItem(storageKey, JSON.stringify(alreadyStored))
        } else {
          await AsyncStorage.setItem(storageKey, JSON.stringify({ [id]: [_photoObj] }))
        }
        this.setPhoto(id, photo)
        return
      }

      this.setState({
        loading: true,
        photoProgress: `0 KB uploaded of ${Math.floor(photo.fileSize / 1024)} KB`
      })
      ApiHelper._fetchDataReponse(this,
        CONSTANTS.REQUESTMETHODS.POST,
        ApiUrls.UPLOAD_PHOTO + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId + "&photoId=" + id + "&captured_from=" + capturedFrom,
        data,
        (response) => {
          this.setPhoto(id, response.data)
          this.setState({
            loading: false,
            photoProgress: null
          })
        }, {
        onUploadProgress: (progressEvent) => {
          this.setState({ photoProgress: `${Math.floor(progressEvent.loaded / 1024)} KB uploaded of ${Math.floor(progressEvent.total / 1024)} KB` })
        }
      })
    } else {
      this.setPhoto(id, photo)
      // const { isInternetReachable } = await NetInfo.fetch()
      // if (isInternetReachable) {
        let alreadyStored = await AsyncStorage.getItem(storageKey)
        if (alreadyStored) {
          alreadyStored = JSON.parse(alreadyStored)
          alreadyStored[id] = photo
          await AsyncStorage.setItem(storageKey, JSON.stringify(alreadyStored))
        } else {
          await AsyncStorage.setItem(storageKey, JSON.stringify({ [id]: photo }))
        }
      // }
    }
  }

  _setTab = (tabIndex = 0) => {
    if (this.state.activeIndex == tabIndex) { return }
    if (this.state.activeIndex == 0) {
      if (!this.state.locationType) {
        Alert.alert("Alert Message", 'What is the Merchant Location Type ?', [{
          text: "Ok",
          style: "cancel"
        }])
        return;
      }
      if (!this.state.onsiteContact) {
        Alert.alert("Alert Message", 'Did Contact Show for Your Appointment ?', [{
          text: "Ok",
          style: "cancel"
        }])

        return;
      }
    } else if (this.state.activeIndex == 1) {

      //"There are " + photos_error_count + " missing photos, Please upload photos or choose 'No image' if image not available", photos_error_count_validate, 'Missing Photos'
      const originalPhotos = []
      const questions = {}
      for (let key in this.state.photosDatas) {
        this.state.photosDatas[key].childs.forEach(photo => {
          originalPhotos.push(photo.id)
          questions[photo.id] = photo.question
        })
      }
      const filledPhotos = Object.keys(this.state.photos)
      let errorMessage = ""
      let count = 0, firstMissing = null
      for (let photoId of originalPhotos) {
        if (!filledPhotos.includes(photoId)) {
          errorMessage += (count + 1) + ")" + questions[photoId] + "\n";
          if (firstMissing == null) {
            firstMissing = photoId
          }
          count++;
        }
      }

      const scrollToPhoto = () => {
        // scroll logic
        try {
          let queRef = this.photoQuestionsRefs[firstMissing];
          const scrollRef = this.scrollRef
          queRef.current.measureLayout && queRef.current.measureLayout(
            findNodeHandle(scrollRef),
            (x, y) => {
              scrollRef._root.scrollToPosition(0, y - 20)
              // .scrollTo({ x: 0, y: y, animated: true })
            }
          )
        } catch (e) {

        }
      }

      if (count > 5) {
        Alert.alert('Missing Photos', `There are ${count} missing photos, do you want to finish taking the photos now? \n Yes – This will take you to the first missing photo \n No - This will take you directly to Survey Questions`, [
          {
            text: 'No',
            onPress: () => this.setState({
              activeIndex: tabIndex
            }),
            style: 'cancel'
          },
          {
            text: 'Yes', onPress: scrollToPhoto
          }
        ])
        return
      } else if (count > 0) {
        Alert.alert('Missing Photos', errorMessage + 'Yes – This will take you to the first missing photo \n No - This will take you directly to Survey Questions', [
          {
            text: 'No',
            onPress: () => this.setState({
              activeIndex: tabIndex
            }),
            style: 'cancel'
          },
          {
            text: 'Yes', onPress: scrollToPhoto
          }
        ])
        return
      }
    }

    this.setState({
      activeIndex: tabIndex
    })
  }

  submitQuestions = async (answers, questionsRefs) => {
    const { rawQuestions } = this.state
    const missingQues = []
    let noOfissing = 0
    let firstMissedQID = null
    rawQuestions.forEach(question => {
      let notFilled = true
      question.answers.forEach(ans => {
        const value = answers[ans.name_feild]
        if (typeof value === 'string' && value !== '') {
          notFilled = false
        } else if (typeof value === 'object' && value.length) {
          notFilled = false
        }
      })
      if (notFilled) {

        if (!firstMissedQID) {
          firstMissedQID = question.id
        }
        if (this.requiredQuestions.includes(question.id) || this.requiredQuestions.includes(question.parentId)) {
          missingQues.push(question.question)
          noOfissing++;
        }
      }
    })
    if (noOfissing) { //temp code 
      Alert.alert(
        "Missing Required Questions",
        `${
        missingQues.reduce((pre, question, i) => pre + (i + 1) + ') ' + question + '\n', '')
        } \n\nYou missed above required questions, Please Answer Now`,
        [
          {
            text: 'Answer Now', onPress: () => {
              // scroll logic
              let queRef = questionsRefs[firstMissedQID];
              const scrollRef = this.scrollRef
              queRef.current.measureLayout && queRef.current.measureLayout(
                findNodeHandle(scrollRef),
                (x, y) => {
                  scrollRef._root.scrollToPosition(0, y - 20)
                  // .scrollTo({ x: 0, y: y, animated: true })
                }
              )
            }
          }
        ],
        { cancelable: false }
      );

    } else {
      try {
        // Uploading offlie photos
        let storedPhoto = await AsyncStorage.getItem(this.storageKeyPhoto)
        storedPhoto = JSON.parse(storedPhoto)
        // await AsyncStorage.removeItem(this.storageKeyPhoto)
        // return order_insp_messages-${this.orderId}
        let orderKeysToRemoveFromAsyncStorage = [`order_orderdetails-${this.orderId}`, `order_reportphotos-${this.orderId}`, `order_insp_messages-${this.orderId}`, `order_inspinstruction-${this.orderId}`, `order_photos_questions-${this.orderId}`, `order_survey_questions-${this.orderId}`, `order_survey_questions-answers-${this.orderId}`, this.storageKeyIns, this.storageKeyPhoto]
        if (storedPhoto && Object.keys(storedPhoto)) {
          //uploading photos
          const uploadPhotoToServer = async (data, id, capturedFrom) => {

            return new Promise((resolve, reject) => {
              ApiHelper._fetchDataReponse(this,
                CONSTANTS.REQUESTMETHODS.POST,
                ApiUrls.UPLOAD_PHOTO + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId + "&photoId=" + id + "&captured_from=" + capturedFrom,
                data,
                (response) => {
                  resolve(response.data)
                })
            })
          }
          await AsyncStorage.removeItem(this.storageKeyPhoto)
          let formattedPhotosArray = []

          for (let key in storedPhoto) {
            const photosArray = storedPhoto[key]
            Array.isArray(photosArray) && photosArray.forEach(photo => {
              formattedPhotosArray.push(photo)
            })
          }

          let i = 1;
          for (const photo of formattedPhotosArray) {
            const data = new FormData()
            const { id, capturedFrom, ...photoObj } = photo
            this.setState({
              loading: true,
              photoProgress: `uploading ${i++}/${formattedPhotosArray.length} offline stored photos`
            })
            data.append('name', photoObj)
            await uploadPhotoToServer(data, id, capturedFrom)

          }
          this.setState({
            loading: false,
            photoProgress: ``
          })
        }
        const data = new FormData()
        for (let key in answers) {
          data.append(key, answers[key])

        }
        this.setState({ loading: true })
        ApiHelper._fetchDataReponse(this,
          CONSTANTS.REQUESTMETHODS.POST,
          ApiUrls.SAVE_QUESTION_ANSWERS + "&inspector_id=" + this.inspectorId + "&orderId=" + this.orderId,
          data,
          async (response) => {
            orderKeysToRemoveFromAsyncStorage.forEach(async asyncStorageKey => {
              // removing all the local storage related to order once its completed
              console.log(asyncStorageKey)
              await AsyncStorage.removeItem(asyncStorageKey)
            })
            this.setState({
              loading: false,
              isInspectionCompleted: true
            })
          }, {
          skipError: true
        });
      } catch (e) {
        this.setState({ loading: false })
      }
    }
  }

  render() {
    const { onsiteContact, locationType, insttructionData, contactShowImpNotes, photoProgress, questions, isInspectionCompleted } = this.state

    if (isInspectionCompleted) {
      global.shouldRefetch = true
      return (
        <Container style={{ backgroundColor: '#E4E4E4' }} >
          <AppHeader
            navigation={this.props.navigation}
            title={"Order Completed"}
            showBack
          />
          <Content>
            <AppDate />
            <View style={{
              padding: 10, backgroundColor: 'white', marginTop: 8,
              shadowColor: '#000',
              shadowOffset: { width: 10, height: 15 },
              shadowOpacity: 0.9,
              shadowRadius: 2,
              elevation: 5
            }} >
              <Text style={{ textAlign: 'center', fontSize: 20, marginBottom: 10, fontWeight: 'bold', color: CONSTANTS.COLORS.PRIMARY2 }} >
                Order Completed
            </Text>
              <Text style={{ fontSize: 18, lineHeight: 18, letterSpacing: 1, color: CONSTANTS.COLORS.BLACK2 }} >
                <Text style={{ fontWeight: 'bold' }} >Thank you</Text> for completing Metro Order <Text style={{ fontWeight: 'bold' }} >#{this.orderId}</Text>!The results are being transmitted to Metro Inspections for final completion and submission to <Text style={{ fontWeight: 'bold' }} >{this.orderDetails.clientname}</Text>.{`\n\n`}<Text style={{ fontWeight: 'bold', fontSize: 17 }} >IMPORTANT: If you find you have additional photos to include for this order #{this.orderId}, please navigate to the Additional Photos section and either take new photo(s) or upload them from your gallery.  Should you have additional information to convey to Metro Inspections, please <Text onPress={() => { global.shouldRefetchViewOrder = true; this.props.navigation.goBack() }} style={{ color: 'blue', textDecorationLine: 'underline' }}  >click here</Text> to send Metro a message or you may log into the Inspection Management System to send Metro a message.</Text>
              </Text>
              <Text onPress={() => this.props.navigation.navigate('InProgress')} style={{ fontSize: 17, color: 'blue' }}  >{`\n`}Close and Return to My Orders</Text>
            </View>
          </Content>
        </Container>
      )
    }


    return (
      <Container>
        <AppHeader
          navigation={this.props.navigation}
          title={strings["Inspection In Progress"]}
          showBack
        />
        <Spinner
          visible={this.state.loading}
          textContent={photoProgress || strings.Loading}
          textStyle={{ color: 'white', fontSize: 16 }}
        />
        <Content ref={c => this.scrollRef = c} >
          <AppDate />
          <View
            style={{
              marginTop: 5,
            }}>
            {
              (this.state.showFirstRow)
                ? <View
                  style={styles.tabContainer}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    TouchableOpacity={0.9}
                    onPress={() => this._setTab(0)}
                    style={
                      (this.state.activeIndex == 0)
                        ? styles.tabActiveStyle
                        : styles.tabStyle
                    }>
                    <AppText
                      text={strings["Instructions to Begin"]}
                      customStyle={styles.tabTextHeadingStyle}
                    />
                    <AppText
                      text={strings["Tap here for Important Instructions on How to Proceed with this ID Verification"]}
                      customStyle={styles.tabTextStyle}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    TouchableOpacity={0.9}
                    onPress={() => this._setTab(1)}
                    style={
                      (this.state.activeIndex == 1)
                        ? styles.tabActiveStyle
                        : styles.tabStyle
                    }>
                    <AppText
                      text={strings["Required Photos"]}
                      customStyle={styles.tabTextHeadingStyle}
                    />
                    <AppText
                      text={strings["Tap Here for a List of the Photos Required by Client"]}
                      customStyle={styles.tabTextStyle}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    TouchableOpacity={0.9}
                    onPress={() => this._setTab(2)}
                    style={
                      (this.state.activeIndex == 2)
                        ? styles.tabActiveStyle
                        : styles.tabStyle
                    }>
                    <AppText
                      text={strings["Survey Questions"]}
                      customStyle={styles.tabTextHeadingStyle}
                    />
                    <AppText
                      text={strings["Tap Here for All Survey Questions which must be Answered During Visit with Borrower"]}
                      customStyle={styles.tabTextStyle}
                    />
                  </TouchableOpacity>
                </View>
                : null
            }
            {
              (this.state.showSecondRow)
                ? <View
                  style={styles.tabContainer}>
                  <View
                    style={styles.tabStyle}>
                    <AppText
                      text={strings["Certificate Of Signature"]}
                      customStyle={styles.tabTextHeadingStyle}
                    />
                    <AppText
                      text={strings["Tap Here to Complete Certificate of Signature"]}
                      customStyle={styles.tabTextStyle}
                    />
                  </View>
                  <View
                    style={styles.tabStyle}>
                    <AppText
                      text={strings["Finalise ID Verification"]}
                      customStyle={styles.tabTextHeadingStyle}
                    />
                    <AppText
                      text={strings["Tap Here to Finalize ID Verification"]}
                      customStyle={styles.tabTextStyle}
                    />
                  </View>
                  <View
                    style={styles.tabStyle}>
                    <AppText
                      text={strings["Phone Clearance"]}
                      customStyle={styles.tabTextHeadingStyle}
                    />
                    <AppText
                      text={strings["Tap Here to Conduct Phone Clearance"]}
                      customStyle={styles.tabTextStyle}
                    />
                  </View>
                </View>
                : null
            }
          </View>

          <Card
            style={STYLE.cardStyle}>
            <Grid
              style={{
                paddingHorizontal: 15,
              }}>
              <Row>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Business Name"] + ": " + this.orderDetails.businessName}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Metro Order ID"] + ": " + this.orderId}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={"Doing Business As" + ": " + this.orderDetails.businessDBA}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Metro Client"] + ": " + this.orderDetails.clientname}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings.Phone + ": " + this.orderDetails.homePhone + " " + this.orderDetails.mobilePhone}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Service Level"] + ": " + this.orderDetails.inspection_type}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Meeting Address"] + ": " + this.orderDetails.businessAddress + "," + this.orderDetails.businessCity}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Due Date"] + ": " + this.orderDetails.dueDate}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
              </Row>
              <Row>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["City/State/Zip"] + ": " + this.orderDetails.businessCity + ", " + this.orderDetails.businessState + ", " + this.orderDetails.businessZip}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
                <Col
                  style={styles.colStyle}>
                  <AppText
                    text={strings["Appointment Date and Time"] + ": " + this.orderDetails.date_time_appoinment}
                    color={CONSTANTS.COLORS.TEXTCOLOR10}
                    fontSize={CONSTANTS.FONT_SIZES.EXTRASMALL}
                  />
                </Col>
              </Row>
            </Grid>
          </Card>

          {!this.state.loading ? (
            (this.state.activeIndex == 0)
              ? <Instructions
                context={this}
                onsiteContact={onsiteContact}
                locationType={locationType}
                insttructionData={insttructionData}
                contactShowImpNotes={contactShowImpNotes}
                setQuestion={async (key, value) => {
                  const { isInternetReachable } = await NetInfo.fetch()
                  const storageKeyIns = this.storageKeyIns
                  let alreadyStored = await AsyncStorage.getItem(storageKeyIns)
                  if (alreadyStored) {
                    alreadyStored = JSON.parse(alreadyStored)
                    alreadyStored[key] = value
                    await AsyncStorage.setItem(storageKeyIns, JSON.stringify(alreadyStored))
                  } else {
                    await AsyncStorage.setItem(storageKeyIns, JSON.stringify({ [key]: value }))
                  }

                  if (value == 'No') {
                    Alert.alert('No-Show Alert Message', 'IMPORTANT:  If you selected "No-show", the inspection requirements will change--please ensure the Designated Contact, or an Authorized Individual DID NOT Show for Your Appointment.  Also, if you selected "No-show" and then, the contact arrives while you are still at the site, you must tap back on "Instructions" (above), change your answer to "Yes", and proceed with completion of your inspection.  The photos you have taken will remain but you will need to start over in answering the survey questions.')
                  }
                  this.setState({ [key]: value })
                }}
              />
              : (this.state.activeIndex == 1)
                ? <Photos
                  context={this}
                  photosDatas={this.state.photosDatas}
                  uploadPhoto={this.uploadPhoto}
                  filledPhotos={this.state.photos}
                />
                : (
                  <SurveyQuestions
                    submitQuestions={this.submitQuestions}
                    surveyQuestionsAnswers={this.state.surveyQuestionsAnswers}
                    context={this}
                    questions={questions}
                    clientId={this.clientId}
                    contactName={this.contactName}
                    inspectorId={this.inspectorId}
                    orderId={this.orderId}
                  />
                )
          ) : null
          }

        </Content>
        <Fab
          onPress={() => this.scrollRef._root.scrollToPosition(0, 0)}
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
      </Container>
    );
  }
}

const styles = {
  tabContainer: {
    flexDirection: 'row',
  },
  tabStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: CONSTANTS.COLORS.TABCOLOR,
    margin: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tabActiveStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: CONSTANTS.COLORS.TABACTIVECOLOR,
    margin: 2,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tabTextHeadingStyle: {
    color: CONSTANTS.COLORS.WHITE,
    // fontWeight: 'bold',
    fontSize: CONSTANTS.FONT_SIZES.SMALL,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tabTextStyle: {
    color: CONSTANTS.COLORS.WHITE,
    fontSize: 11,
    textAlign: 'center',
    color: "#eeeeef",
    textTransform: 'capitalize'
  },
  colStyle: {
    borderColor: CONSTANTS.COLORS.GRAY,
    borderWidth: 1,
    padding: 2,
    paddingVertical: 2
  },
}

export default Inspection;
