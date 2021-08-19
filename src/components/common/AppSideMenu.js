import React, { Component } from 'react';
import { Container, Content, Icon } from 'native-base';
import strings from '../../Language';
import { FlatList, Image, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import STYLE from '../css/STYLE';
import RadialGradient from 'react-native-radial-gradient';
import CommonFunctions from '../../utils/CommonFunctions';
import { TouchableOpacity } from 'react-native-gesture-handler';

const CONSTANTS = require('../../utils/CONSTANTS');
class AppSideMenu extends Component {

    constructor(props) {
        super(props);
        this.filters = [{
            name: strings.All,
            filterType:'all_list',
            navigation: 'All',
            active: false
        }, {
            name: strings["In Progress"],
            filterType:'inprogress',
            navigation: 'InProgress',
            active: true
        }, {
            name: strings.Completed,
            filterType:'completed_list',
            navigation: 'Completed',
            active: false
        }, {
            name: strings.Problem,
            filterType:'problem_list',
            navigation: 'Problem',
            active: false
        }, {
            name: strings["Action Required"],
            filterType:'action_list',
            navigation: 'ActionRequired',
            active: false
        }, {
            name: strings.Delay,
            filterType:'delay_list',
            navigation: 'Delay',
            active: false
        }, {
            name: strings["Completed Awating Payout"],
            filterType:'payout_list',
            navigation: 'CompletedAwaitingPayout',
            active: false
        }, {
            name: strings.Paid,
            filterType:'paid_list',
            navigation: 'Paid',
            active: false
        }];
    }

    _openMenu = (item) => {
        //console.warn("Item is ", item);
        this.props.navigation.closeDrawer();
        let filters = this.filters;
        for (let index = 0; index < filters.length; index++) {
            const filter = filters[index];
            if(filter.navigation == item.navigation) {
                filter.active = true;
            } else {
                filter.active = false;
            }
        }
        global.shouldRefetch = true
        CommonFunctions
        ._openPage(item.navigation, this.props.navigation, {filterType: item.filterType})
    }

    render() {
        return (
            <RadialGradient 
                style={{
                    flex: 1,
                    justifyContent: 'center',
                }}
                colors={['rgba(44, 79, 117, 1)','rgba(41, 57, 93, 1)']}
                stops={[0.5, 1]}
                center={[100,100]}
                radius={200}>
                <FlatList
                    keyExtractor={item => item.name}
                    data={this.filters}
                    ListHeaderComponent={() => {
                        return (
                            <View
                                style={{
                                    marginTop: 50,
                                    //alignItems: 'flex-end',
                                    //position: 'relative',
                                }}>
                                <TouchableOpacity
                                    style={{
                                        //position: 'absolute',
                                        alignSelf: 'flex-end',
                                        marginRight: 20,
                                    }}
                                    onPress={() => {
                                        this.props.navigation.closeDrawer();
                                    }}>
                                    <Icon
                                        name="close"
                                        type='Ionicons'
                                        style={{
                                            color: CONSTANTS.COLORS.WHITE,
                                            fontSize: CONSTANTS.FONT_SIZES.LARGER,
                                        }}
                                    />
                                </TouchableOpacity>
                                <Image
                                    source={require('../../assets/images/logo.png')}
                                    style={{
                                        resizeMode: 'contain',
                                        alignSelf: 'center',
                                    }}
                                />
                            </View>
                        )
                    }}
                    renderItem={({item}) => {
                        return (
                            <ListItem
                                title={item.name}
                                //chevron
                                containerStyle={{
                                    backgroundColor: (item.active) ? 'rgba(255, 255, 255, 0.2)' : CONSTANTS.COLORS.TRANSPERANT,
                                }}
                                titleStyle={{
                                    color: CONSTANTS.COLORS.WHITE,
                                    fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                }}
                                bottomDivider
                                onPress={() => this._openMenu(item)}
                                rightElement={() => (
                                    <View
                                        style={{
                                            backgroundColor: CONSTANTS.COLORS.PRIMARY2,
                                            padding: 2,
                                            borderRadius: 50,
                                        }}>
                                        <Icon 
                                            name="keyboard-arrow-right" 
                                            type='MaterialIcons' 
                                            style={{
                                                fontSize: CONSTANTS.FONT_SIZES.LARGE,
                                                color: CONSTANTS.COLORS.BLACK,
                                            }}
                                        />
                                    </View>
                                )}
                            />
                        )
                    }}
                />
            </RadialGradient>
        )
    }
    
}

export { AppSideMenu };