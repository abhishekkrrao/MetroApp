import React, { Component, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Card } from 'native-base';
import STYLE from '../../css/STYLE';
import { RadioElement, AppButton } from '../../common';
import { Divider } from 'react-native-elements';
import strings from '../../../Language';
import { QuestionComponent } from "../../common/QuestionComponent";
const CONSTANTS = require('../../../utils/CONSTANTS');

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12
  hours = hours >= 10 ? hours : '0' + hours
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

class SurveyQuestions extends React.PureComponent {

  state = {
    answers: {},
    appIsOnline: true,
  }

  answersRefs = {

  }

  questionsRefs = {

  }

  disabledTexts = {

  }


  initialiseAnswers = async () => {
    let { questions, inspectorId, orderId } = this.props
    // await AsyncStorage.removeItem(`order_answers-${orderId}-${inspectorId}`)
    // return
    const surveyQuestionsAnswers = this.props.surveyQuestionsAnswers?.admin_fill_results ? JSON.parse(this.props.surveyQuestionsAnswers?.admin_fill_results) : {}
    let answerData = await AsyncStorage.getItem(`order_answers-${orderId}-${inspectorId}`)
    if (typeof answerData === "string") {
      try { answerData = JSON.parse(answerData) } catch (e) {
        console.log('\n\n\n\n\n PArsed error occured')
      }
    }
    console.log('2 \n\n\n\n')

    if ((!answerData) || answerData == null || Object.keys(answerData).length == 0) {
      answerData = {}
      questions.forEach((question) => {
        question.answers.forEach(({ name_feild, answer_type }) => {
          if (name_feild.includes('[]')) {
            answerData[name_feild] = []
          } else {
            answerData[name_feild] = ''
          }
          if (answer_type == 'text')
            if (surveyQuestionsAnswers[name_feild]) {
              answerData[name_feild] = surveyQuestionsAnswers[name_feild] + '@@@@@yes'
              this.disabledTexts[name_feild] = true
            }
        })
        if (question.childQuestions) {
          question.childQuestions.forEach((question) => {
            question.answers.forEach(({ name_feild, answer_type }) => {
              if (name_feild.includes('[]')) {
                answerData[name_feild] = []
              } else {
                answerData[name_feild] = ''
              }
              if (surveyQuestionsAnswers[name_feild]) {
                answerData[name_feild] = surveyQuestionsAnswers[name_feild]
                this.disabledTexts[name_feild] = true
              }
            })
          })
        }
      })
      console.log('This is the survy questuions\n\n\n\n\n', answerData)
      await AsyncStorage.setItem(`order_answers-${orderId}-${inspectorId}`, JSON.stringify(answerData))
    } else {
      questions.forEach((question) => {
        question.answers.forEach(({ name_feild, answer_type }) => {
          if (answer_type == 'text')
            if (surveyQuestionsAnswers[name_feild]) {
              answerData[name_feild] = surveyQuestionsAnswers[name_feild] + '@@@@@yes'
              this.disabledTexts[name_feild] = true
            }
        })
      })
      await AsyncStorage.setItem(`order_answers-${orderId}-${inspectorId}`, JSON.stringify(answerData))
    }
    this.setState({ answers: answerData })
  }

  answerHandler = async (answerKey, value) => {
    let { inspectorId, orderId } = this.props
    const _answers = { ...this.state.answers }
    _answers[answerKey] = value
    await AsyncStorage.setItem(`order_answers-${orderId}-${inspectorId}`, JSON.stringify(_answers))
    return new Promise((resolve, reject) => {
      this.setState({ answers: _answers }, () => {
        resolve()
      })
    })
  }

  componentDidMount() {
    this.initialiseAnswers()

    // Adding Offline/online mode listener
    this.unsubscribeNWStatus = NetInfo.addEventListener(state => {
      if (this.isInternetReachable !== null && this.isInternetReachable != state.isInternetReachable) {
        state.isInternetReachable ? this.setState({ appIsOnline: true }) : this.setState({ appIsOnline: false });
      }
      this.isInternetReachable = state.isInternetReachable;
    });
  }

  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount() {
    this.unsubscribeNWStatus !== null && this.unsubscribeNWStatus()
  }

  render() {
    let {
      questions = [],
      context,
      clientId,
      contactName,
    } = this.props

    const { answers } = this.state

    return (
      <Card
        style={STYLE.cardStyle}
      >
        {
          questions.map((question, i) => {
            const queProps = {}
            question.answers.forEach(({ name_feild }) => {
              queProps[name_feild] = answers[name_feild]
            })
            return (<>
              <QuestionComponent disabledTexts={this.disabledTexts} context={this} key={i} answerHandler={this.answerHandler} {...queProps} contactName={contactName} clientId={clientId} sno={i + 1} question={question} />
              {
                question.childQuestions ? (question.childQuestions || []).map((question, i) => {
                  const queProps = {}
                  question.answers.forEach(({ name_feild }) => {
                    queProps[name_feild] = answers[name_feild]
                  })
                  return (<>
                    <QuestionComponent disabledTexts={this.disabledTexts} context={this} key={1} answerHandler={this.answerHandler} {...queProps} contactName={contactName} clientId={clientId} sno={` ${String.fromCharCode(97 + i)}`} question={question} />
                  </>)
                }) :
                  <Divider />
              }
              {question.childQuestions && <Divider />}
            </>);
          })
        }
        {this.state.appIsOnline && <AppButton
          onPress={() => this.props.submitQuestions(answers, this.questionsRefs)}
          text={strings.Submit}
          shadowColor={CONSTANTS.COLORS.TRANSPERANT}
          width={'80%'}
          btnStyle={{
            borderRadius: 0,
            alignSelf: 'center',
          }}
        />}
      </Card>
    );
  }
}

// const SurveyQuestions = ({
//   questions = [],
//   context,
//   clientId,
//   contactName,
//   inspectorId,
//   orderId
// }) => {

//   const [answers, setAnswers] = useState({})

//   const initialiseAnswers = async () => {
//     let answerData = await AsyncStorage.getItem(`order_answers-${orderId}-${inspectorId}`)
//     if (!answerData) {
//       answerData = {}
//       questions.forEach((question) => {
//         question.answers.forEach(({ name_feild }) => {
//           if (answerData[name_feild] !== '') {
//             answerData[name_feild] = ''
//           }
//         })
//         if (question.childQuestions) {
//           question.childQuestions.forEach((question) => {
//             question.answers.forEach(({ name_feild }) => {
//               if (answerData[name_feild] !== '') {
//                 answerData[name_feild] = ''
//               }
//             })
//           })
//         }
//       })
//       await AsyncStorage.setItem(`order_answers-${orderId}-${inspectorId}`, JSON.stringify(answerData))
//     }
//     setAnswers(answerData)
//   }

//   useEffect(() => {
//     if (questions.length)
//       initialiseAnswers()
//   }, [questions.length])

//   const answerHandler = (answerKey, value) => {
//     const _answers = { ...answers }
//     _answers[answerKey] = value
//     setAnswers(_answers)
//   }

//   return (
//     <Card
//       style={STYLE.cardStyle}
//     >
//       {
//         questions.map((question, i) => {
//           const queProps = {}
//           question.answers.forEach(({ name_feild }) => {
//             queProps[name_feild] = answers[name_feild]
//           })
//           return (<>
//             <QuestionComponent key={i} answerHandler={answerHandler} {...queProps} contactName={contactName} clientId={clientId} sno={i + 1} question={question} />
//             {
//               question.childQuestions ? (question.childQuestions || []).map((question, i) => {
//                 const queProps = {}
//                 question.answers.forEach(({ name_feild }) => {
//                   queProps[name_feild] = answers[name_feild]
//                 })
//                 return (<>
//                   <QuestionComponent key={1} answerHandler={answerHandler} {...queProps} contactName={contactName} clientId={clientId} sno={` ${String.fromCharCode(97 + i)}`} question={question} />
//                 </>)
//               }) :
//                 <Divider />
//             }
//             {question.childQuestions && <Divider />}
//           </>);
//         })
//       }
//       <AppButton
//         text={strings.Submit}
//         shadowColor={CONSTANTS.COLORS.TRANSPERANT}
//         width={'80%'}
//         btnStyle={{
//           borderRadius: 0,
//           alignSelf: 'center',
//         }}
//       />
//     </Card>
//   );

// }

export default SurveyQuestions;
