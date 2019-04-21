import React from 'react';
import { Animated, StyleSheet } from 'react-native';

export enum EAppearType {
  Spring,
  Fade,
}

interface IProps {
  show: boolean;
  type: EAppearType;
  customStyles?: any;
  isReverse?: boolean;
  delay?: number;
}

interface IState {
  animated: Animated.Value;
}

export class Appear extends React.Component<IProps, IState> {
  state = {
    animated: new Animated.Value(0),
  };

  componentDidMount() {
    if (this.props.show) {
      this.in();
    }
  }

  componentWillReceiveProps(nextProps: IProps) {
    if (nextProps.show !== this.props.show) {
      if (nextProps.show) {
        this.in();
      } else {
        this.out();
      }
    }
  }

  get delay(): number {
    let delay = 0;

    if (this.props.delay && this.props.delay > 0) {
      delay = this.props.delay;
    }

    return delay;
  }

  in() {
    switch (this.props.type) {
      case EAppearType.Fade: {
        Animated.timing(this.state.animated, {
          toValue: 1,
          delay: this.delay,
          duration: 200,
          useNativeDriver: true,
        }).start();
        break;
      }

      case EAppearType.Spring:
      default: {
        Animated.spring(this.state.animated, {
          toValue: 1,
          delay: this.delay,
          tension: 92,
          useNativeDriver: true,
        }).start();
        break;
      }
    }
  }

  out() {
    switch (this.props.type) {
      case EAppearType.Fade: {
        Animated.timing(this.state.animated, {
          toValue: 0,
          delay: this.delay,
          duration: 200,
          useNativeDriver: true,
        }).start();
        break;
      }

      case EAppearType.Spring:
      default: {
        Animated.spring(this.state.animated, {
          toValue: 0,
          delay: this.delay,
          tension: 92,
          useNativeDriver: true,
        }).start();
        break;
      }
    }
  }

  render() {
    const { animated } = this.state;
    const { customStyles, children } = this.props;

    return (
      <Animated.View
        style={[
          styles.container,
          customStyles,
          {
            opacity: animated,
            transform: [
              {
                scale: animated.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
