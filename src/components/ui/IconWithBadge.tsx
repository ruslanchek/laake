import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { ERouteName } from '../../enums/ERouteName';
import { followStore } from 'react-stores';
import { commonStore } from '../../stores/commonStore';

export interface IProps {
  routeName: ERouteName;
  color: string | null;
  focused: boolean;
}

@followStore(commonStore)
export class IconWithBadge extends React.PureComponent<IProps> {
  render() {
    const { focused } = this.props;

    return (
      <View style={styles.container}>
        <Icon
          style={[
            styles.icon,
            {
              left: this.offsetLeft,
            },
            this.props.routeName === ERouteName.PurchaseScreen && focused && commonStore.state.isPro
              ? styles.pro
              : null,
          ]}
          name={this.iconName}
          size={28}
          color={this.color}
        />
      </View>
    );
  }

  get color() {
    if (this.props.routeName === ERouteName.PurchaseScreen) {
      return COLORS.CYAN.toString();
    } else {
      return this.props.color || COLORS.GRAY.toString();
    }
  }

  get offsetLeft() {
    switch (this.props.routeName) {
      case ERouteName.Today: {
        return 2;
      }

      case ERouteName.Summary: {
        return 1;
      }

      case ERouteName.Log: {
        return 1;
      }

      case ERouteName.PurchaseScreen: {
        return -1;
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
        if (commonStore.state.isPro) {
          return 'ios-star';
        } else {
          return 'ios-star-outline';
        }
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

  pro: {
    shadowColor: COLORS.CYAN.darken(0.1).toString(),
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.4,
  },
});
