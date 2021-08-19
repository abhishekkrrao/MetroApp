import { Button, Container, Content, Footer, FooterTab, Item } from 'native-base';
import React, { Component } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Divider, ListItem } from 'react-native-elements';
import strings from '../../Language';
import CONSTANTS from '../../utils/CONSTANTS';
import { AppHeader } from '../common';

class Sorting extends Component {

    constructor(props) {
        super(props);
        let sortingItems = [{
            id: 1,
            title: strings.Order + " Number",
            order: undefined,
            key: 'id'
        }, {
            id: 2,
            title: strings["Service Level"],
            order: undefined,
            key: 'inspection_type'
        }, {
            id: 4,
            title: strings["Due Date"],
            order: undefined,
            key: 'dueDate'
        }, {
            id: 5,
            title: strings.Status,
            order: undefined,
            key: 'status'
        }, {
            id: 6,
            title: strings["Business Name"],
            order: undefined,
            key: 'businessName'
        }, {
            id: 7,
            title: strings.City,
            order: undefined,
            key: 'businessCity'
        }, {
            id: 8,
            title: strings.State,
            order: undefined,
            key: 'businessState'
        }]
        const sortBy = props.navigation.getParam('sortBy', null);
        if (sortBy) {
            sortingItems = sortingItems.map(item => {
                if (item.key === sortBy.key) {
                    return sortBy
                }
                return item
            })
        } else {
            sortingItems[0].order = 'up';
        }
        this.state = {
            sortingItems
        }
    }

    render() {
        return (
            <Container>
                <AppHeader
                    navigation={this.props.navigation}
                    showBack
                />
                <FlatList
                    data={this.state.sortingItems}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        return (
                            <ListItem
                                title={item.title}
                                titleStyle={{
                                    fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                    fontStyle: 'normal',
                                    color: CONSTANTS.COLORS.BLACK2,
                                    fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY
                                }}
                                rightIcon={item.order ? {
                                    name: 'keyboard-arrow-' + item.order,
                                    iconStyle: {
                                        fontSize: CONSTANTS.FONT_SIZES.ABOVELARGE
                                    }
                                } : undefined}
                                onPress={() => {
                                    let sortingItems = this.state.sortingItems;
                                    const currentOrder = item.order
                                    sortingItems.forEach(item => item.order = undefined);
                                    sortingItems.find(sortingItem => sortingItem.id == item.id).order = (currentOrder == 'up') ? 'down' : 'up';
                                    this.setState({
                                        sortingItems
                                    })
                                }}
                            />
                        )
                    }}
                    style={{
                        marginHorizontal: 10,
                    }}
                    ItemSeparatorComponent={() => (
                        <Divider />
                    )}
                />
                <Footer
                    style={{
                        borderTopColor: CONSTANTS.COLORS.TRANSPERANT,
                        backgroundColor: CONSTANTS.COLORS.TRANSPERANT,
                    }}>
                    <FooterTab
                        style={{
                            borderTopColor: CONSTANTS.COLORS.TRANSPERANT,
                        }}>
                        <Button
                            onPress={() => {
                                global.shouldRefetch = false
                                this.props.navigation.goBack();
                                this.props.navigation.getParam('sort', () => null)(this.state.sortingItems.find(item => item.order))
                            }}
                            success>
                            <Text
                                style={{
                                    fontSize: CONSTANTS.FONT_SIZES.HEADING,
                                    color: CONSTANTS.COLORS.WHITE,
                                    fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY
                                }}>
                                {'Apply'}
                            </Text>
                        </Button>
                    </FooterTab>
                </Footer>
            </Container>
        )
    }
}

export default Sorting;
// export { Sorting };