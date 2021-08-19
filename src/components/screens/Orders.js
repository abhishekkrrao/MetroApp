import React, { Component } from 'react'
import { Animated, Text, TextInput, TouchableOpacity, ScrollView, Linking, FlatList } from 'react-native'
import _ from 'lodash'
import strings from '../../Language'
import { Content, Container, Card, View, Picker, Icon, Grid, Col, Row, Button, Fab, Item, Left, Right } from 'native-base'
import { AppStatusBar, AppHeader, AppText, AppButton, AppDate, ConfirmModal, SearchComponent } from '../common';
import moment from 'moment';
import CommonFunctions from '../../utils/CommonFunctions';
import ApiHelper from '../../utils/ApiHelper';
import ApiUrls from '../../utils/ApiUrls';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';
import { Badge, SearchBar } from 'react-native-elements';

const CONSTANTS = require('../../utils/CONSTANTS');
class Orders extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filterType: this.props.navigation.getParam('filterType', null),
            userInformation: {},
            userId: null,
            showEmpty: false,
            orderData: [],
            pageLimit: 10,
            noOfPages: 0,
            activePage: 1,
            pagesShown: [],
            shownOrders: [],
            searching: false,
            searchQuery: "",
            internetConnection: false,
            sortBy: null,
            fabScrollBtn: false
        }
        this.focusListener = null;
    }

    UNSAFE_componentWillMount() {

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
                    userId: userInformation.userId,
                }, () => {
                    this._fetchOrders();
                })
            });
        this.focusListener = this.props.navigation.addListener('willFocus', (e) => {
            if (!global.shouldRefetch) {
                return
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
                        userId: userInformation.userId,
                    }, () => {
                        this._fetchOrders();
                    })
                });
        });
    }

    componentWillUnmount() {
        if (this.focusListener != null) {
            this.focusListener.remove();
        }
    }

    _orderDetails = (order) => {
        CommonFunctions
            ._openPage(CONSTANTS.ROUTENAMES.ViewOrder, this.props.navigation, { orderInfo: order });
    }

    // Reinitialize all table according to posts given to it 
    _setPosts = (posts) => {
        let noOfPages = 0;
        let pagesShown = [];
        if (posts.length > 0) {
            noOfPages = posts.length / this.state.pageLimit;
            noOfPages = Math.ceil(noOfPages);
        }
        if (noOfPages > 1) {
            // if there are more than one pages then show them in pagination (At max 4)
            for (let i = 1; i <= noOfPages && i <= 4; i++) {
                pagesShown.push(i);
            }
        }

        let shownOrders = posts.slice(0, this.state.pageLimit);

        this.setState({
            activePage: 1,
            pagesShown: pagesShown,
            noOfPages: noOfPages,
            shownOrders
        });
    }

    _fetchOrders = () => {
        this.setState({
            loading: true,
        });
        ApiHelper
            ._fetchDataReponse(this, CONSTANTS.REQUESTMETHODS.GET, ApiUrls.ORDERLIST + this.state.filterType + "&inspector_id=" + this.state.userId, [], (response) => {
                let posts = response.data.posts;
                if (posts == "0" || posts == null) {
                    this.setState({
                        loading: false,
                        showEmpty: true,
                        orderData: [],
                    });
                    return;
                }
                if (this.state.sortBy) {
                    posts = this.sortingLogic(this.state.sortBy, posts)
                }
                this._setPosts(posts)
                this.setState({
                    loading: false,
                    showEmpty: false,
                    orderData: posts
                })
                //let orders = posts;

            }, { offlineVerisionKey: 'ordersList?type=' + this.state.filterType });
    }

    /**
     * Pagination controls
     */
    pagePress(type, i) {

        if (i < 1 || i > this.state.noOfPages) {
            return
        }

        const { activePage, pageLimit, pagesShown } = this.state
        if (type == 'pageNumber') {
            let _pagesShown = [...pagesShown]
            if (!pagesShown.includes(i)) {  // on next button press
                if (i == (activePage + 1)) {
                    _pagesShown.shift();
                    _pagesShown.push(i);
                } else {
                    _pagesShown.pop();
                    _pagesShown.unshift(i);
                }
            }
            let shownOrders;
            if (this.state.searchQuery) {
                shownOrders = this._searchLogic(this.state.searchQuery).slice((i - 1) * pageLimit, (i - 1) * pageLimit + pageLimit)
            } else {
                shownOrders = this.state.orderData.slice((i - 1) * pageLimit, (i - 1) * pageLimit + pageLimit)
            }

            this.setState({
                activePage: i,
                shownOrders: shownOrders,
                pagesShown: _pagesShown
            })
            return;
        }
    }

    _changePicker = (value) => {
        let orderData = this.state.orderData;
        let activePage = this.state.activePage;
        this.setState({
            pageLimit: value,
            activePage: 1,
            // shownOrders: orderData.splice((activePage - 1), value),
            pagesShown: [1, 2, 3, 4],
        })
    }

    _searchLogic = (searchQuery) => {
        let searchedOrders = [];
        this.state.orderData.forEach((order) => {
            if (order.id.toLowerCase().includes(searchQuery.toLowerCase())
                || order.inspection_type.toLowerCase().includes(searchQuery.toLowerCase())
                || order.dueDate.toLowerCase().includes(searchQuery.toLowerCase())
                || order.status.toLowerCase().includes(searchQuery.toLowerCase())
                || order.businessName.toLowerCase().includes(searchQuery.toLowerCase())
                || order.businessCity.toLowerCase().includes(searchQuery.toLowerCase())
                || order.businessState.toLowerCase().includes(searchQuery.toLowerCase())) {
                searchedOrders.push(order);
            }
        })
        return searchedOrders;
    }

    _searchOrders = (searchQuery) => {
        searchQuery = (searchQuery || "").trimStart();
        let orderData = this.state.orderData;
        this.setState({
            searchQuery
        });
        if (searchQuery == "") {
            this._setPosts(this.state.orderData)
            return;
        }
        searchedOrders = this._searchLogic(searchQuery.trimEnd());
        this._setPosts(searchedOrders)
    }

    sortingLogic = (sortBy, posts) => {
        let sortingFoam = [sortBy.key]
        if (sortBy.key === 'dueDate') {
            sortingFoam = (o) => {
                return moment(o[sortBy.key]);
            }
        } else if (sortBy.key === 'id') {
            sortingFoam = (obj) => {
                return parseInt(obj.id, 10);
            }
        }
        posts = _.orderBy(posts, sortingFoam, [sortBy.order == 'up' ? 'asc' : 'desc']); // performing sort
        return posts
    }

    _sortPosts = (sortBy) => {
        let { orderData } = this.state
        orderData = this.sortingLogic(sortBy, orderData)
        this.setState({ sortBy, orderData }, () => {
            this._setPosts(orderData)
        })
    }

    handleOnScroll = event => {
        const offsetY = event.nativeEvent.contentOffset.y;

        if (offsetY > 50) {

            this.setState({
                fabScrollBtn: true
            })
        } else {

            this.setState({
                fabScrollBtn: false
            })
        }
    };


    render() {
        const { activePage, fabScrollBtn } = this.state
        return (
            <Container
                style={{ backgroundColor: '#E4E4E4' }}>
                <AppStatusBar />
                <Spinner
                    visible={this.state.loading}
                    textContent={strings.Loading}
                />
                <AppHeader
                    navigation={this.props.navigation}
                    title={strings["Manage Order"]}
                    showMenu
                    showLogout
                />
                <Content
                    ref={c => (this.contentRef = c)}
                >

                    <AppDate
                        name={
                            this.state.userInformation.hasOwnProperty('name')
                                ? this.state.userInformation.name
                                : null
                        }
                    />
                    <Button
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            width: '98.5%',
                            backgroundColor: CONSTANTS.COLORS.PRIMARY2,
                            marginHorizontal: 10,

                        }}
                        onPress={() => {
                            Linking.openURL(ApiUrls.IMP_INSTRUCTIONS);
                        }}>
                        <Text
                            style={{
                                alignSelf: 'center',
                                fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                color: CONSTANTS.COLORS.WHITE,
                            }}>
                            Click here for
                        </Text>
                        <Text
                            style={{
                                color: '#06357a',
                                marginHorizontal: 5,
                                fontSize: CONSTANTS.FONT_SIZES.HEADING,
                            }}>
                            Very Important
                        </Text>
                        <Text
                            style={{
                                alignSelf: 'center',
                                fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                color: CONSTANTS.COLORS.WHITE,
                            }}>
                            Instructions
                        </Text>
                    </Button>
                    <AppText
                        text={
                            (this.state.filterType == 'all_list')
                                ? strings.All + " " + strings["Order List"]
                                : (this.state.filterType == 'inprogress')
                                    ? strings["In Progress"] + " " + strings["Order List"]
                                    : (this.state.filterType == 'completed_list')
                                        ? strings.Completed + " " + strings["Order List"]
                                        : (this.state.filterType == 'problem_list')
                                            ? strings.Problem + " " + strings["Order List"]
                                            : (this.state.filterType == 'action_list')
                                                ? strings["Action Required"] + " " + strings["Order List"]
                                                : (this.state.filterType == 'delay_list')
                                                    ? strings.Delay + " " + strings["Order List"]
                                                    : (this.state.filterType == 'payout_list')
                                                        ? strings["Completed Awating Payout"] + " " + strings["Order List"]
                                                        : (this.state.filterType == 'paid_list')
                                                            ? strings.Paid + " " + strings["Order List"]
                                                            : strings["Order List"]
                        }
                        color={CONSTANTS.COLORS.PRIMARY2}
                        fontSize={CONSTANTS.FONT_SIZES.LARGE}
                        customStyle={{
                            alignSelf: 'center',
                            marginTop: 10,
                            marginBottom: 5,
                            fontWeight: 'bold',
                        }}
                    />
                    <Card
                        style={{
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 1,
                            shadowRadius: 5,
                            elevation: 5,
                            paddingVertical: 15,
                            marginTop: 10,
                        }}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                paddingLeft: 15,
                                width: '100%',
                            }}>
                            {/* <AppText
                                text={strings.Show}
                                color={CONSTANTS.COLORS.BLACK}
                                fontSize={CONSTANTS.FONT_SIZES.LARGE}
                                customStyle={{
                                    fontWeight: '100',
                                }}
                            />
                            <AppText
                                text={strings.Entries}
                                color={CONSTANTS.COLORS.BLACK}
                                fontSize={CONSTANTS.FONT_SIZES.LARGE}
                                customStyle={{
                                    fontWeight: '100',
                                }}
                            /> */}
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',

                                marginHorizontal: 10,
                                marginTop: 10,

                            }}>
                            <SearchBar
                                round
                                containerStyle={{
                                    width: '80%',
                                    borderRadius: 20,
                                }}
                                inputStyle={{
                                    fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                    color: CONSTANTS.COLORS.BLACK,
                                }}
                                lightTheme
                                showLoading={this.state.searching}
                                onChangeText={(text) => this._searchOrders(text)}
                                value={this.state.searchQuery}
                            />
                            <Button light style={{
                                marginHorizontal: 3,
                                borderRadius: 5,
                                flex: 1,
                                alignSelf: "center",
                                justifyContent: 'center',
                                backgroundColor: "#e1e8ee"
                            }}
                                onPress={() => CommonFunctions._openPage(CONSTANTS.ROUTENAMES.Sorting,
                                    this.props.navigation, { sort: this._sortPosts, sortBy: this.state.sortBy }
                                )}
                            >
                                <Text style={{
                                    fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                    color: CONSTANTS.COLORS.BLACK,
                                    fontWeight: 'bold',
                                    fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                }}  >SORT</Text>
                            </Button>
                        </View>
                        <FlatList
                            data={this.state.shownOrders}
                            keyExtractor={(item) => item.id}

                            renderItem={({ item }) => {
                                const { id, inspection_type, dueDate, status, businessName, businessCity, businessState } = item;
                                let backgroundColor = CONSTANTS.COLORS.PRIMARY2;
                                if (inspection_type == 'Rush') {
                                    backgroundColor = CONSTANTS.COLORS.YELLOW;
                                }
                                if (inspection_type == 'Immediate Rush') {
                                    backgroundColor = CONSTANTS.COLORS.PINK;
                                }
                                return (
                                    <TouchableOpacity activeOpacity={0.9} style={{ zIndex: 0 }} onPress={() => this._orderDetails(item)} >
                                        <Card
                                            style={{
                                                marginVertical: 0,
                                                borderColor: CONSTANTS.COLORS.BLACK,
                                                borderWidth: 1,
                                                backgroundColor: backgroundColor,
                                                borderRadius: 10,
                                            }}>
                                            <View
                                                style={{
                                                    marginLeft: 10,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 3,
                                                    borderTopRightRadius: 10,
                                                    borderBottomRightRadius: 10,
                                                    backgroundColor: CONSTANTS.COLORS.WHITE,
                                                }}>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                    }}>
                                                    <View style={{ width: '70%' }} >
                                                        <Text
                                                            style={{
                                                                fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                                                color: CONSTANTS.COLORS.BLACK,
                                                                fontWeight: 'normal',
                                                                fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
                                                            }}>
                                                            {businessName}
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Text
                                                            style={{
                                                                fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                                                color: CONSTANTS.COLORS.BLACK,
                                                                fontWeight: 'bold',
                                                            }}>
                                                            {"#" + id}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                    borderBottomWidth: 0.5,
                                                    borderBottomColor: CONSTANTS.COLORS.GRAY,
                                                    paddingBottom: 1
                                                }} >
                                                    <Text
                                                        style={{
                                                            fontSize: CONSTANTS.FONT_SIZES.SMALL,
                                                            color: CONSTANTS.COLORS.BLACK2,
                                                            // marginTop: 2,
                                                            textTransform: 'capitalize',
                                                        }}>
                                                        {businessCity + ', ' + businessState}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                                            fontStyle: 'normal',
                                                            fontWeight: '500'
                                                        }}>
                                                        <Text
                                                            style={{
                                                                color: CONSTANTS.COLORS.BLACK2,
                                                                fontWeight: 'normal',
                                                                fontSize: CONSTANTS.FONT_SIZES.SMALL
                                                            }}>
                                                            {"Service Level "}
                                                        </Text>
                                                        {inspection_type}
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        // marginTop: 5,
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}>
                                                    <Text
                                                        style={{
                                                            fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                                            fontStyle: 'normal',
                                                            fontWeight: '500',
                                                        }}>
                                                        <Text
                                                            style={{
                                                                color: CONSTANTS.COLORS.BLACK2,
                                                                fontWeight: 'normal',
                                                            }}>
                                                            {"Due on "}
                                                        </Text>
                                                        {dueDate}
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: CONSTANTS.FONT_SIZES.NORMAL,
                                                            fontStyle: 'normal',
                                                            fontWeight: 'normal',
                                                            maxWidth: '40%'
                                                        }}>
                                                        <Text
                                                            style={{
                                                                color: CONSTANTS.COLORS.BLACK2,
                                                                fontWeight: 'normal',
                                                                fontSize: CONSTANTS.FONT_SIZES.SMALL
                                                            }}>
                                                            {"Status "}
                                                        </Text>
                                                        {status}
                                                    </Text>
                                                </View>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                )
                            }}
                            style={{
                                marginHorizontal: 10,
                                marginTop: 10,
                            }}
                        />
                        {
                            (this.state.pagesShown.length > 0)
                                ? <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: 15,
                                    }}>
                                    {
                                        (this.state.pagesShown[0] == 1)
                                            ? null
                                            : <Button
                                                style={{
                                                    //width: 32,
                                                    height: 32,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 10,
                                                    paddingHorizontal: 10,
                                                    borderColor: CONSTANTS.COLORS.GRAY,
                                                    borderWidth: 0.5,
                                                    backgroundColor: CONSTANTS.COLORS.GRAY,
                                                    borderRadius: 0,
                                                }}
                                                onPress={() => this.pagePress('pageNumber', activePage - 1)}>
                                                <Text
                                                    style={{
                                                        color: CONSTANTS.COLORS.BLACK,
                                                        fontSize: CONSTANTS.FONT_SIZES.SMALL,
                                                        fontWeight: 'normal',
                                                    }}>
                                                    Previous
                                                </Text>
                                            </Button>
                                    }
                                    {
                                        this.state.pagesShown.map(i => {
                                            return (
                                                <Button
                                                    key={i}
                                                    style={{
                                                        width: 32,
                                                        height: 32,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: 10,
                                                        borderColor: (this.state.activePage == i) ? CONSTANTS.COLORS.BLACK : CONSTANTS.COLORS.TRANSPERANT,
                                                        borderWidth: 0.5,
                                                        backgroundColor: (this.state.activePage == i) ? CONSTANTS.COLORS.GRAY : CONSTANTS.COLORS.TRANSPERANT,
                                                        borderRadius: 0,
                                                    }}
                                                    bordered={(this.state.activePage == i) ? false : true}
                                                    onPress={() => this.pagePress('pageNumber', i)}>
                                                    <Text
                                                        style={{
                                                            color: CONSTANTS.COLORS.BLACK,
                                                            fontSize: CONSTANTS.FONT_SIZES.SMALL,
                                                            fontWeight: 'normal',
                                                        }}>
                                                        {i}
                                                    </Text>
                                                </Button>
                                            )
                                        })
                                    }
                                    {
                                        // We would hide next button when last page no. is showing in pagination
                                        (this.state.noOfPages <= 4 || this.state.pagesShown.includes(this.state.noOfPages))
                                            ? null
                                            : <Button
                                                style={{
                                                    //width: 32,
                                                    height: 32,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 10,
                                                    paddingHorizontal: 10,
                                                    borderColor: CONSTANTS.COLORS.GRAY,
                                                    borderWidth: 0.5,
                                                    backgroundColor: CONSTANTS.COLORS.GRAY,
                                                    borderRadius: 0,
                                                }}
                                                onPress={() => this.pagePress('pageNumber', activePage + 1)}>
                                                <Text
                                                    style={{
                                                        color: CONSTANTS.COLORS.BLACK,
                                                        fontSize: CONSTANTS.FONT_SIZES.SMALL,
                                                        fontWeight: 'normal',
                                                    }}>
                                                    Next
                                                </Text>
                                            </Button>
                                    }
                                </View>
                                : null
                        }
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
            </Container>
        )
    }
}

const styles = {
    firstView: {
        padding: 10,
        alignItems: 'center',
    },
    firstText: {
        fontSize: CONSTANTS.FONT_SIZES.NORMAL,
        color: CONSTANTS.COLORS.BLACK,
    },
    secondView: {
        borderBottomWidth: 2,
        borderBottomColor: CONSTANTS.COLORS.BLACK,
        borderRightWidth: 2,
        borderRightColor: CONSTANTS.COLORS.BLACK,
        borderLeftWidth: 2,
        borderLeftColor: CONSTANTS.COLORS.BLACK,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    thirdView: {
        borderRightWidth: 2,
        borderRightColor: CONSTANTS.COLORS.BLACK,
        borderLeftWidth: 2,
        borderLeftColor: CONSTANTS.COLORS.BLACK,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    progressOrderView: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: CONSTANTS.COLORS.BLACK,
    },
    headText: {
        textAlign: 'center',
        fontSize: CONSTANTS.FONT_SIZES.SMALL,
        alignSelf: 'center',
        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
        fontWeight: '100',
    },
    gridStyle: {
        borderColor: CONSTANTS.COLORS.GRAY,
        borderWidth: 1,
        margin: 15,
    },
    rowStyle: {

    },
    colStyle: {
        padding: 5,
        backgroundColor: CONSTANTS.COLORS.GRAY2,
        borderColor: CONSTANTS.COLORS.GRAY,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colStyle2: {
        paddingVertical: 5,
        backgroundColor: CONSTANTS.COLORS.TEXTCOLOR3,
        borderColor: CONSTANTS.COLORS.GRAY,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
}

export default Orders;
