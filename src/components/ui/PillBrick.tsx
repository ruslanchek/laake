import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, ImageURISource } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { FONTS } from '../../common/fonts';
import { ImageWithPreload } from './ImageWithPreload';

interface IProps {
  title: string;
  selected: boolean;
  size: number;
  imageSource: ImageURISource | { uri: string };
  handleSelect: () => void;
}

export class PillBrick extends React.PureComponent<IProps> {
  render() {
    const { title, handleSelect, selected, size, imageSource } = this.props;

    return (
      <TouchableOpacity onPress={handleSelect.bind(this)} style={{ width: size }}>
        <View style={[styles.pillInner, { width: size, height: size }]}>
          {selected && <View style={styles.selected} />}

          <ImageWithPreload
            style={styles.pillImage}
            width={size}
            height={size}
            source={imageSource}
          />

          <View style={styles.subTitle}>
            <Text style={[styles.subTitleText, selected ? styles.subTitleTextSelected : null]}>
              {title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  pillInner: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    marginBottom: VARIABLES.PADDING_MEDIUM,
    backgroundColor: COLORS.WHITE.toString(),
    elevation: 1,
    shadowColor: COLORS.GRAY_PALE_LIGHT.toString(),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3,
  },

  checkMarkIcon: {
    top: -2,
    left: 0,
  },

  selected: {
    borderWidth: 2,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
    borderColor: COLORS.GRAY_LIGHT.toString(),
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
  },

  pillImage: {
    borderRadius: VARIABLES.BORDER_RADIUS_BIG,
    overflow: 'hidden',
  },

  subTitle: {
    paddingHorizontal: 5,
    borderRadius: VARIABLES.BORDER_RADIUS_SMALL,
    backgroundColor: COLORS.WHITE.alpha(0.8).toString(),
    position: 'absolute',
    bottom: 5,
  },

  subTitleText: {
    fontSize: VARIABLES.FONT_SIZE_TINY,
    color: COLORS.GRAY.toString(),
    fontFamily: FONTS.MEDIUM,
  },

  subTitleTextSelected: {
    color: COLORS.GRAY.toString(),
  },
});
