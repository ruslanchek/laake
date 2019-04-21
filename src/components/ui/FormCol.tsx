import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IProps {
  width: string | number;
}

export class FormCol extends React.PureComponent<IProps> {
  render() {
    const { children, width } = this.props;

    return (
      <View
        style={[
          styles.container,
          {
            width,
          },
        ]}
      >
        {children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});
