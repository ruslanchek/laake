import React from 'react';
import { Picker, StyleSheet } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { FONTS } from '../../common/fonts';
import { COLORS } from '../../common/colors';

interface IProps<TValue> {
  items: IFormSelectItem<TValue>[];
  value: TValue;
  width: string | number;
  onChange: (value: TValue) => void;
  serialize?: boolean;
}

export interface IFormSelectItem<TValue> {
  value: TValue;
  title: string;
}

export class FormSelect<TValue> extends React.PureComponent<IProps<TValue>> {
  render() {
    const { items, onChange, width, value, serialize } = this.props;

    return (
      <Picker
        style={[
          styles.container,
          {
            width,
          },
        ]}
        mode='dialog'
        selectedValue={serialize ? JSON.stringify(value) : value}
        itemStyle={styles.item}
        onValueChange={itemValue => {
          onChange(serialize ? JSON.parse(itemValue) : itemValue);
        }}
      >
        {items.map((item, i) => {
          return (
            <Picker.Item
              key={i}
              label={item.title}
              value={serialize ? JSON.stringify(item.value) : item.value}
            />
          );
        })}
      </Picker>
    );
  }
}

const styles = StyleSheet.create({
  container: {},

  item: {
    fontFamily: FONTS.MEDIUM,
    color: COLORS.BLACK.toString(),
    height: 160,
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
});
