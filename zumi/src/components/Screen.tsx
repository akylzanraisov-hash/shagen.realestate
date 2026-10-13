import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Backdrop } from './chrome';

/** Standard scrolling screen on the glass-night backdrop. `tabbed` leaves room for the bottom bar. */
export function Screen({
  children,
  tabbed,
  scroll = true,
  header,
  ...rest
}: { children: ReactNode; tabbed?: boolean; scroll?: boolean; header?: ReactNode } & ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const bottom = tabbed ? 110 + insets.bottom : 40 + insets.bottom;
  return (
    <View style={styles.root}>
      <Backdrop />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header ? <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>{header}</View> : null}
        {scroll ? (
          <ScrollView
            {...rest}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ paddingTop: header ? 12 : insets.top + 12, paddingHorizontal: 20, paddingBottom: bottom, gap: 18 }, rest.contentContainerStyle]}>
            {children}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingTop: header ? 12 : insets.top + 12, paddingHorizontal: 20, paddingBottom: bottom }}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
