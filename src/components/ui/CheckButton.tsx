import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../common/colors';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import Icon from 'react-native-vector-icons/Ionicons';

interface IProps {
  isChecked: boolean;
  isLoading: boolean;
  text: string;
  onPress: () => void;
}

export class CheckButton extends React.PureComponent<IProps> {
  render() {
    const { isChecked, text, onPress } = this.props;

    return (
      <TouchableOpacity style={styles.button} onPress={onPress.bind(this)}>
        <Text style={styles.buttonText}>{text}</Text>

        {isChecked && (
          <Icon
            name='ios-checkmark'
            size={32}
            style={styles.buttonIcon}
            color={COLORS.WHITE.toString()}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.WHITE.alpha(0.125).toString(),
    paddingHorizontal: VARIABLES.PADDING_MEDIUM,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.WHITE.alpha(0.1).toString(),
  },

  buttonText: {
    color: COLORS.WHITE.toString(),
    fontFamily: FONTS.MEDIUM,
    fontSize: VARIABLES.FONT_SIZE_SMALL,
  },

  buttonIcon: {
    marginLeft: VARIABLES.PADDING_MEDIUM,
    top: 1,
  },
});
