import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight, Platform } from 'react-native';
import { VARIABLES } from '../../common/variables';
import { COLORS } from '../../common/colors';
import { GLOBAL_STYLES } from '../../common/styles';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonService } from '../../services/CommonService';

interface IProps {
  placeholder: string;
  label: string;
  items: string[] | string;
  useWrapper: boolean;
  border: boolean;
  borderRadiusTop: boolean;
  borderRadiusBottom: boolean;
  onPress: () => void;
}

export class FormEntitiesInput extends React.PureComponent<IProps> {
  componentDidMount() {}

  render() {
    const {
      placeholder,
      label,
      items,
      useWrapper,
      border,
      borderRadiusTop,
      borderRadiusBottom,
    } = this.props;

    return (
      <TouchableHighlight
        underlayColor={COLORS.GRAY_ULTRA_LIGHT.toString()}
        activeOpacity={1}
        onPress={this.handlePress}
        style={[
          GLOBAL_STYLES.INPUT_ENTITIES_CONTAINER,
          useWrapper ? GLOBAL_STYLES.INPUT_CONTAINER : null,
          border ? styles.bordered : null,
          borderRadiusTop ? styles.borderRadiusTop : null,
          borderRadiusBottom ? styles.borderRadiusBottom : null,
          !borderRadiusTop && !borderRadiusBottom ? styles.borderRadiusNone : null,
        ]}
      >
        <View style={styles.itemsContainer}>
          <View style={styles.items}>
            {label && <Text style={GLOBAL_STYLES.INPUT_LABEL}>{label}</Text>}

            {items.length > 0 ? (
              <>
                {typeof items === 'string' ? (
                  <Text numberOfLines={1} style={GLOBAL_STYLES.INPUT_TEXT}>
                    {items}
                  </Text>
                ) : (
                  <View style={styles.labels}>
                    {items.map((item, i) => {
                      return (
                        <View key={i} style={[GLOBAL_STYLES.LABEL, styles.itemLabel]}>
                          <Text numberOfLines={1} style={GLOBAL_STYLES.LABEL_TEXT}>
                            {item}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.placeholder}>{placeholder}</Text>
            )}
          </View>

          <Icon
            style={GLOBAL_STYLES.INPUT_ENTITIES_ARROW}
            name='ios-arrow-forward'
            size={24}
            color={COLORS.GRAY.toString()}
          />
        </View>
      </TouchableHighlight>
    );
  }

  handlePress = () => {
    if (this.props.onPress) {
      this.props.onPress();
    }
  };
}

const styles = StyleSheet.create({
  itemLabel: {
    marginRight: VARIABLES.PADDING_SMALL,
    flexShrink: 1,
  },

  placeholder: {
    color: COLORS.GRAY_LIGHT.toString(),
    fontSize: VARIABLES.FONT_SIZE_REGULAR,
  },

  itemsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  labels: {
    flexDirection: 'row',
  },

  items: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
  },

  bordered: {
    borderTopColor: COLORS.GRAY_ULTRA_LIGHT.toString(),
    borderTopWidth: 1,
  },

  borderRadiusTop: {
    borderTopLeftRadius: VARIABLES.BORDER_RADIUS_SMALL,
    borderTopRightRadius: VARIABLES.BORDER_RADIUS_SMALL,
  },

  borderRadiusBottom: {
    borderBottomLeftRadius: VARIABLES.BORDER_RADIUS_SMALL,
    borderBottomRightRadius: VARIABLES.BORDER_RADIUS_SMALL,
  },

  borderRadiusNone: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});
