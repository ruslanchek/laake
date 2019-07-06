import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../common/colors';
import { ERouteName } from '../../enums/ERouteName';
import { VARIABLES } from '../../common/variables';

export interface IProps {
  routeName: ERouteName;
  color: string | null;
  focused: boolean;
}

export class TabBarLabel extends React.PureComponent<IProps> {
  render() {
    const { color, routeName } = this.props;

    return (
      <Text style={[styles.container, { color: color || COLORS.RED.toString() }]}>{routeName}</Text>
    );
  }
}

const styles : {[key: string]: any} = StyleSheet.create({
  container: {
    flexGrow: 0.5,
    fontSize: VARIABLES.FONT_SIZE_TINY,
  },
});
