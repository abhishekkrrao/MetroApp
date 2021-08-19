const CONSTANTS = require('./CONSTANTS');
const environment = CONSTANTS.ENVIRONMENTTYPES.PRODUCTION;
/**
 * Production environmet URL
 */
const PROD_URL = 'https://www.metrositeinspections.com/InspectionSystem/';
const PROD_IMAGE_URL = PROD_URL;
const PROD_API_URL = PROD_URL+'webservice_4_0_0.php?type=';
const PROD_DOC_URL = PROD_URL+"documents/";
/**
 * Test environment base url
 */
const TEST_URL = 'http://quadrantsystems.co.in/InspectionSystem/';
const TEST_IMAGE_URL = TEST_URL;
const TEST_API_URL = TEST_URL+'webservice_4_0_0.php?type=';
const TEST_DOC_URL = TEST_URL+"documents/";
/**
 * Local base url
 */
const DEV_URL = 'http://quadrantsystems.co.in/InspectionSystem/';
const DEV_IMAGE_URL = DEV_URL;
const DEV_API_URL = DEV_URL+'webservice_4_0_0.php?type=';
const DEV_DOC_URL = DEV_URL+"documents/";

let SERVERURL = (environment == CONSTANTS.ENVIRONMENTTYPES.PRODUCTION) ? PROD_API_URL : (environment == CONSTANTS.ENVIRONMENTTYPES.TESTING) ? TEST_API_URL : DEV_API_URL;
let IMAGE_URL = (environment == CONSTANTS.ENVIRONMENTTYPES.PRODUCTION) ? PROD_IMAGE_URL : (environment == CONSTANTS.ENVIRONMENTTYPES.TESTING) ? TEST_IMAGE_URL : DEV_IMAGE_URL;
let DOC_URL = (environment == CONSTANTS.ENVIRONMENTTYPES.PRODUCTION) ? PROD_DOC_URL : (environment == CONSTANTS.ENVIRONMENTTYPES.TESTING) ? TEST_DOC_URL : DEV_DOC_URL;

module.exports = APIURLS = {
    IMAGE_URL: IMAGE_URL,
    DOCURL: DOC_URL,
    APPVERSIONCHECK: SERVERURL + "checkAppVersion",
    LOGIN: SERVERURL + "login",
    FORGOTPASSWORD: SERVERURL + "forgotpassword",
    IMP_INSTRUCTIONS: DOC_URL + 'Professional_Standards_and_Code_of_Ethics_for_Metro_Inspectors.pdf',
    ORDERLIST: SERVERURL,
    PHOTOQUESTIONS: SERVERURL + "photos_questions",
    SURVEYQUESTIONS: SERVERURL + "survey_questions",
    SAVESURVEYQUESTIONS: SERVERURL + "jsondata_survey_questions_answers",
    VERIFYSURVEYQUESTIONS: SERVERURL + "survey_questions",
    ORDERDETAILS: SERVERURL + "orderdetails",
    FINALSUBMISSION: SERVERURL + "update_survey_questions",
    FETCH_INSPECTOR_MESSAGE: SERVERURL + "display_inspector_messages",
    INSPECTOR_MESSAGE: SERVERURL + "inspector_messages_insert",
    SAVE_APPOINTMENT_DATE: SERVERURL + "appoinment_date",
    INSPECTION_INSTRUCTIONS: SERVERURL + "instructions",
    PHOTOS_QUESTIONS: SERVERURL + "photos_questions",
    UPLOAD_PHOTO: SERVERURL + "photos_upload",
    SURVEY_QUESTIONS: SERVERURL + "survey_questions",
    SAVE_QUESTION_ANSWERS: SERVERURL + "update_survey_questions",
    REPORT_PHOTOS: SERVERURL + "report_photos",
    ADDITIONAL_PHOTOS: SERVERURL + "additional_photos_upload",
    CONFIRM_ORDER: SERVERURL + "confirm_order",
    DECLINE_ORDER: SERVERURL + "decline_order",
    SURVEY_QUESTIONS_ANSWERS:SERVERURL + "jsondata_survey_questions_answers"
    }