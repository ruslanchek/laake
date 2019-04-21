import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { ERouteName } from '../../enums/ERouteName';

export interface IProps {
  routeName: ERouteName;
  color: string | null;
  focused: boolean;
}

export class IconWithBadge extends React.PureComponent<IProps> {
  render() {
    const { color } = this.props;

    return (
      <View style={styles.container}>
        <Icon
          style={styles.icon}
          name='ios-arrow-forward'
          size={28}
          color={color || COLORS.RED.toString()}
        />
      </View>
    );
  }

  get iconName() {
    switch (this.props.routeName) {
      case ERouteName.Today: {
        return 'ios-medical';
      }

      case ERouteName.Summary: {
        return 'ios-stats';
      }

      case ERouteName.Log: {
        return 'ios-list';
      }

      case ERouteName.Settings: {
        return 'ios-settings';
      }

      default: {
        return 'ios-settings';
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
  },
  icon: {
    top: 1,
    left: 1,
  },
});
