import React from 'react';
import { View } from 'react-native';

interface IProps {
  width: string | number;
}

export class FormCol extends React.PureComponent<IProps> {
  render() {
    const { children, width } = this.props;

    return (
      <View
        style={[
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
