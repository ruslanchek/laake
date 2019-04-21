import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VARIABLES } from '../../common/variables';

interface IProps {}

export class FormRow extends React.PureComponent<IProps> {
  render() {
    const { children } = this.props;

    return <View style={styles.container}>{children}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: VARIABLES.PADDING_BIG,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
