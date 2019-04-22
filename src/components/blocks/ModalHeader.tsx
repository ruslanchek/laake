import React from 'react';
import { Image, ImageURISource, StyleSheet, Text, Animated } from 'react-native';
import { Appear, EAppearType } from '../common/Appear';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { COLORS } from '../../common/colors';

interface IProps {
  scrollTop: Animated.Value;
  title: string;
  description: string;
  icon: ImageURISource;
}

export class ModalHeader extends React.PureComponent<IProps> {
  render() {
    const { title, icon, description, scrollTop } = this.props;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                scale: scrollTop.interpolate({
                  inputRange: [-20, 80],
                  outputRange: [1, 0.7],
                  extrapolate: 'clamp',
                }),
              },
              {
                translateY: scrollTop.interpolate({
                  inputRange: [-20, 80],
                  outputRange: [0, 45],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <Appear show={true} delay={200} type={EAppearType.Spring}>
          <Image source={icon} style={styles.icon} />
        </Appear>
        <Appear show={true} delay={250} type={EAppearType.Spring}>
          <Text style={styles.header}>{title}</Text>
        </Appear>
        <Appear
          show={true}
          delay={300}
          type={EAppearType.Spring}
          customStyles={styles.textContainer}
        >
          <Text style={styles.text}>{description}</Text>
        </Appear>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 25,
    alignItems: 'center',
  },

  icon: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginVertical: 10,
  },

  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    paddingHorizontal: 60,
  },

  header: {
    fontSize: VARIABLES.FONT_SIZE_GIANT,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: FONTS.BOLD,
  },

  text: {
    justifyContent: 'flex-start',
    textAlign: 'center',
    fontFamily: FONTS.MEDIUM,
    color: COLORS.GRAY.toString(),
  },
});
