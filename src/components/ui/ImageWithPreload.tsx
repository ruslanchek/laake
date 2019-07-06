import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  ImageURISource,
  ActivityIndicator,
  ViewStyle,
  Easing,
} from 'react-native';
import { COLORS } from '../../common/colors';

interface IProps {
  source: ImageURISource;
  style: ViewStyle | ViewStyle[];
  width: number;
  height: number;
}

interface IState {
  loading: boolean;
  animated: Animated.Value;
}

export class ImageWithPreload extends React.PureComponent<IProps, IState> {
  state = {
    loading: true,
    animated: new Animated.Value(0),
  };

  render() {
    const { source, style, width, height } = this.props;
    const { animated } = this.state;

    return (
      <View style={[styles.container, style]}>
        {/* {loading && (
          <ActivityIndicator style={styles.loading} color={COLORS.GRAY.toString()} size='small' />
        )} */}
        <Animated.View style={[styles.image, { opacity: animated }]}>
          <Image
            resizeMode='cover'
            style={{
              width,
              height,
            }}
            onLoadEnd={this.handleLoadEnd}
            source={source}
          />
        </Animated.View>
      </View>
    );
  }

  handleLoadEnd = () => {
    this.setState({
      loading: false,
    });

    Animated.timing(this.state.animated, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE.toString(),
    justifyContent: 'center',
    alignItems: 'center',
  },

  loading: {
    position: 'absolute',
  },

  image: {},
});
