/**
 * RefreshableScrollView
 *
 * Drop-in replacement for ScrollView that adds pull-to-refresh with the app's
 * teal accent colour. Renders an inline error banner when refresh fails.
 *
 * Props:
 *   refreshing   — boolean from useRefresh()
 *   onRefresh    — callback from useRefresh()
 *   errorMsg     — string | null from useRefresh()
 *   clearError   — callback from useRefresh()
 *   + all standard ScrollView props
 */

import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

interface Props extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void;
  errorMsg?: string | null;
  clearError?: () => void;
}

export default function RefreshableScrollView({
  refreshing,
  onRefresh,
  errorMsg,
  clearError,
  children,
  ...rest
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      {...rest}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.teal}
          colors={[colors.teal]}
          progressBackgroundColor={colors.white}
        />
      }
    >
      {errorMsg ? (
        <View style={s.errorBanner}>
          <MaterialIcons name="wifi-off" size={14} color={colors.error} />
          <Text style={s.errorTxt} numberOfLines={2}>{errorMsg}</Text>
          {clearError && (
            <TouchableOpacity onPress={clearError} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorTxt: {
    flex: 1,
    fontSize: 12,
    color: colors.error,
    lineHeight: 16,
  },
  retryTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
});
