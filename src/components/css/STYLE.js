const CONSTANTS = require('../../utils/CONSTANTS');
const STYLE = {
    iconStyle: {
        color: CONSTANTS.COLORS.WHITE,
        fontSize: CONSTANTS.FONT_SIZES.ABOVELARGE,
    },
    container: {
        backgroundColor: CONSTANTS.COLORS.PRIMARY,
    },
    cardStyle: {
        shadowColor: CONSTANTS.COLORS.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 5,
        paddingVertical: 15,
        marginTop: 10,
    },
    textStyle: {
        fontFamily: CONSTANTS.FONT_FAMILIES.AVENIRHEAVY,
        fontSize: CONSTANTS.FONT_SIZES.NORMAL, 
    }
}

export default STYLE;