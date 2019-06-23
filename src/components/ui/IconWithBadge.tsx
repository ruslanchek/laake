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
          style={[styles.icon, { left: this.offsetLeft }]}
          name={this.iconName}
          size={28}
          color={color || COLORS.RED.toString()}
        />
      </View>
    );
  }

  get offsetLeft() {
    switch (this.props.routeName) {
      case ERouteName.Today: {
        return 2;
      }

      case ERouteName.Summary: {
        return 2;
      }

      case ERouteName.Log: {
        return 2;
      }

      case ERouteName.PurchaseScreen: {
        return 0;
      }

      default: {
        return 0;
      }
    }
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

      case ERouteName.PurchaseScreen: {
        return 'ios-star-outline';
      }

      default: {
        return 'ios-star-outline';
      }
    }
  }
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 25,
    justifyContent: 'center',
  },
  icon: {
    top: 1,
    left: 1,
  },
});
