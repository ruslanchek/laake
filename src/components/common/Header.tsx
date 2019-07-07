import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import Icon from 'react-native-vector-icons/Ionicons';
import { withNavigation, NavigationInjectedProps } from 'react-navigation';
import { FONTS } from '../../common/fonts';
import { CommonService } from '../../services/CommonService';

export enum EHeaderTheme {
  Dark,
  Light,
}

interface IProps extends NavigationInjectedProps {
  title: string | null;
  next: {
    title: string;
    action: () => void;
  } | null;
  theme: EHeaderTheme;
  onBack?: () => void;
}

class HeaderClass extends React.PureComponent<IProps> {
  render() {
    const { title, next, theme } = this.props;

    return (
      <View style={styles.container}>
        {title === null ? (
          <View />
        ) : (
          <TouchableOpacity style={styles.button} onPress={this.handleBack}>
            <View style={styles.back}>
              <Icon name='ios-arrow-back' size={32} color={ICON_THEME_COLORS[theme].toString()} />
            </View>

            <Text style={[styles.title, titleTheme[theme]]}>{title}</Text>
          </TouchableOpacity>
        )}

        {next && (
          <TouchableOpacity onPress={this.handleNext}>
            <Text style={[styles.next, nextTheme[theme]]}>{next.title}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  handleBack = () => {
    if (this.props.onBack) {
      this.props.onBack();
    }

    this.props.navigation.goBack();
  };

  handleNext = () => {
    if (this.props.next) {
      this.props.next.action();
    }
  };
}

const ICON_THEME_COLORS = {
  [EHeaderTheme.Dark]: COLORS.GRAY,
  [EHeaderTheme.Light]: COLORS.WHITE,
};

export const Header = withNavigation(HeaderClass);

const styles: { [key: string]: any } = StyleSheet.create({
  next: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    textTransform: 'uppercase',
    fontFamily: FONTS.BOLD,
  },

  container: {
    paddingHorizontal: VARIABLES.PADDING_BIG,
    paddingVertical: VARIABLES.PADDING_MEDIUM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  back: {
    marginRight: 6,
    top: 1,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: VARIABLES.FONT_SIZE_SMALL,
    fontFamily: FONTS.BOLD,
    textTransform: 'uppercase',
  },
});

const titleTheme: { [key: string]: any } = StyleSheet.create({
  [EHeaderTheme.Dark]: {
    color: COLORS.GRAY.toString(),
  },

  [EHeaderTheme.Light]: {
    color: COLORS.WHITE.toString(),
  },
});

const nextTheme: { [key: string]: any } = StyleSheet.create({
  [EHeaderTheme.Dark]: {
    color: COLORS.RED.toString(),
  },

  [EHeaderTheme.Light]: {
    color: COLORS.WHITE.toString(),
  },
});
