import { COLORS } from './colors';
import { StyleSheet, ViewStyle, Platform, StatusBar } from 'react-native';
import { VARIABLES } from './variables';
import { FONTS } from './fonts';

export const mergeWithShadow = (styles: ViewStyle) => {
  return {
    ...styles,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
      android: {
        borderColor: COLORS.GRAY_PALE_LIGHT.toString(),
        borderWidth: 1.5,
        borderTopColor: COLORS.GRAY_PALE_LIGHT.alpha(0).toString(),
        borderTopWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
      },
    }),
  };
};

export const GLOBAL_STYLES: { [key: string]: any } = StyleSheet.create({
  SAFE_AREA: {
    flex: 1,
  },

  MODAL_BUTTON_HOLDER: {
    padding: VARIABLES.PADDING_BIG,
    flexShrink: 1,
  },

  MODAL_SCROLL_VIEW: {
    justifyContent: 'center',
    flex: 1,
  },

  LABEL: {
    backgroundColor: COLORS.GRAY_PALE_LIGHT.toString(),
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    ...Platform.select({
      ios: {
        paddingVertical: 3,
      },
      android: {
        paddingTop: 2,
        paddingBottom: 4,
      },
    }),
  },

  LABEL_TEXT: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  INPUT_TEXT: {
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    fontFamily: FONTS.MEDIUM,
    color: COLORS.BLACK.toString(),
  },

  INPUT_CONTAINER: mergeWithShadow({
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    backgroundColor: COLORS.WHITE.toString(),
    height: VARIABLES.INPUT_HEIGHT,
    flexDirection: 'row',
  }),

  INPUT_CONTAINER_SINGLE: {
    height: VARIABLES.INPUT_HEIGHT_SMALL,
  },

  CONTAINER_COLUMN: {
    height: 'auto',
    flexDirection: 'column',
  },

  INPUT_ENTITIES_CONTAINER: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: VARIABLES.PADDING_MEDIUM,
    paddingRight: VARIABLES.PADDING_MEDIUM,
    height: VARIABLES.INPUT_HEIGHT,
  },

  INPUT_ENTITIES_ARROW: {
    top: 1,
    marginLeft: VARIABLES.PADDING_MEDIUM,
  },

  INPUT: {
    paddingLeft: VARIABLES.PADDING_MEDIUM,
    paddingRight: VARIABLES.PADDING_MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    borderBottomWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    height: VARIABLES.INPUT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: FONTS.MEDIUM,
    color: COLORS.BLACK.toString(),
  },

  INPUT_LABEL: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: FONTS.MEDIUM,
  },

  SELECT_GROUP: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 'auto',
  },
});
