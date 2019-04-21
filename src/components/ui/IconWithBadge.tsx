import React from 'react';
import { Ionicons } from '@expo/vector-icons';
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
        <Ionicons
          style={styles.icon}
          name={this.iconName}
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
