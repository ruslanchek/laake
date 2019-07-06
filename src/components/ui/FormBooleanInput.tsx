import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { GLOBAL_STYLES } from '../../common/styles';
import { CommonService } from '../../services/CommonService';

interface IProps {
  label: string;
  title: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export class FormBooleanInput extends React.PureComponent<IProps> {
  componentDidMount() {}

  render() {
    const { title, label, enabled } = this.props;

    return (
      <View style={[GLOBAL_STYLES.INPUT_ENTITIES_CONTAINER, GLOBAL_STYLES.INPUT_CONTAINER]}>
        <View style={styles.itemsContainer}>
          <View style={styles.items}>
            <Text style={GLOBAL_STYLES.INPUT_LABEL}>{label}</Text>
            <Text numberOfLines={1} style={GLOBAL_STYLES.INPUT_TEXT}>
              {title}
            </Text>
          </View>

          <Switch
            value={enabled}
            onValueChange={this.handlePress}
            trackColor={{
              false: COLORS.GRAY_LIGHT.toString(),
              true: COLORS.RED.toString(),
            }}
          />
        </View>
      </View>
    );
  }

  handlePress = (value: boolean) => {
    CommonService.haptic();

    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };
}

const styles : {[key: string]: any} = StyleSheet.create({
  itemLabel: {
    marginRight: VARIABLES.PADDING_SMALL,
    flexShrink: 1,
  },

  itemsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  items: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
  },
});
