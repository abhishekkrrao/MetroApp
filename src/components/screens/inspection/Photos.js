import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { Card } from 'native-base';
import ImagePicker from 'react-native-image-picker';
import STYLE from '../../css/STYLE';
import { AppText, AppButton, RadioElement } from '../../common';
import { Divider } from 'react-native-elements';

const CONSTANTS = require('../../../utils/CONSTANTS');
const Photos = ({
  context,
  photosDatas = {},
  filledPhotos,
  uploadPhoto
}) => {

  const imageConfig = {
    mediaType: 'photo',
    noData: true,
    quality: 0.8,
    maxWidth: 1800,
    maxHeight: 1800
  }

  const openCamera = (qid) => {
    ImagePicker.launchCamera(imageConfig, (photo) => {
      if (!photo.didCancel) {
        photo.isUploaded = false
        uploadPhoto(qid, photo, 1)
      }
      // Same code as in above section!
    });
  }


  const openGallery = (qid) => {
    ImagePicker.launchImageLibrary(imageConfig, (photo) => {
      if (!photo.didCancel) {
        photo.isUploaded = false
        uploadPhoto(qid, photo, 2)
      }
      // Same code as in above section!
    });
  }

  const setNoImage = (qid) => {
    uploadPhoto(qid, null)
  }

  const renderQueImage = (qid) => {
    const photoList = filledPhotos[qid]
    if (photoList === undefined) {
      return null
    }
    if (photoList == null) {
      return <Text style={{ color: 'red', fontSize: CONSTANTS.FONT_SIZES.HEADING }} >Image Not Avaliable</Text>
    }


    return photoList.map(photo => {
      let img = {
        uri: photo.thumb_url || photo.uri
      }

      return (<Image
        resizeMode={'contain'}
        source={img}
        style={{ height: 100, width: 90, resizeMode: 'cover', borderWidth: 1, borderColor: 'red', margin: 5 }}
      />);
    })
  }

  const renderPhotoQuestions = () => {
    const parentPhotos = []
    for (let key in photosDatas) {
      const parentPhoto = photosDatas[key]
      // parentPhoto.childs = parentPhoto.childs.sort((a, b) => {
      //   try {

      //     if (Number(a.id) > Number(b.id)) {
      //       return -1
      //     } else {
      //       return 1
      //     }
      //   } catch (e) {
      //     return 0
      //   }
      // })
      parentPhotos.push(<Card
        style={[STYLE.cardStyle, { padding: 10, }]}>
        <AppText
          text={parentPhoto.question}
          color={CONSTANTS.COLORS.TEXTCOLOR4}
          fontSize={CONSTANTS.FONT_SIZES.HEADING}
          customStyle={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }}
        />
        {
          parentPhoto.childs.map((child, i) => {
            const buttons = [{
              title: 'Camera',
              onPress: () => { openCamera(child.id) },
            }, {
              title: 'Gallery',
              onPress: () => { openGallery(child.id) },
            }]

            if (!filledPhotos[child.id]) {
              buttons.push({
                title: 'No Image',
                onPress: () => { setNoImage(child.id) },
              })
            }
            return (
              <>
                <RadioElement
                  fref={ref => context.photoQuestionsRefs[child.id] = ref}
                  sno={i + 1}
                  title={child.question}
                  titleStyle={{
                    textTransform: 'capitalize'
                  }}
                  middleElement={<View style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap' }} >{renderQueImage(child.id)}</View>}
                  buttons={buttons}
                />
                {(i + 1) != parentPhoto.childs.length && <Divider />}
              </>
            )
          })
        }
      </Card>
      );
    }

    return parentPhotos
  }

  return (
    <View>
      <Card
        style={[STYLE.cardStyle, {
          padding: 10,
        }]}>
        <Text
          style={{
            fontWeight: '200',
            fontSize: CONSTANTS.FONT_SIZES.HEADING,
            color: CONSTANTS.COLORS.TEXTCOLOR4,
            letterSpacing: 1,
            textAlign: 'justify',
            fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
          }}>
          <AppText
            text={'Photo Instructions:'}
            fontSize={CONSTANTS.FONT_SIZES.FONT23}
            color={CONSTANTS.COLORS.RED}
            customStyle={{
              textDecorationLine: 'underline',
              fontWeight: '200',
              textAlign: 'justify',
            }}
          />
          {': Please take each of the photos listed, and tap “No Image Available” if the listed item does not apply or exist.  All photos must be '}
          <AppText
            text={'TOP QUALITY, Large Resolution'}
            fontSize={CONSTANTS.FONT_SIZES.HEADING}
            color={CONSTANTS.COLORS.TEXTCOLOR4}
            customStyle={{
              textDecorationLine: 'underline',
              fontWeight: '200',
              textAlign: 'justify',
            }}
          />
          {' photos.'}
        </Text>
        <AppText
          text={'***PLEASE BE AWARE THAT WE ARE UNABLE TO ACCEPT SUB-STANDARD, BLURRY OR INCOMPLETE PHOTOS***'}
          fontSize={CONSTANTS.FONT_SIZES.HEADING}
          color={CONSTANTS.COLORS.TEXTCOLOR4}
          customStyle={{
            fontWeight: 'bold',
            // textAlign: 'justify',
            letterSpacing: 0.0,
            marginTop: 22,
          }}
        />
      </Card>
      {renderPhotoQuestions()}
      <AppButton
        text={'Next To Survey Questions'}
        btnStyle={{
          marging: '5%',
          alignSelf: 'center',
          marginBottom: 20,
        }}
        width='90%'
        onPress={() => context._setTab(2)}
      />
    </View>
  );

}

export default Photos;
