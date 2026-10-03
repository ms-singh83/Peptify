import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <NativeTabs tintColor={theme.primary} labelStyle={{ color: theme.textSecondary }}>
      <NativeTabs.Trigger name="index">
        <Label>Today</Label>
        <Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="calendar-today" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="protocols">
        <Label>Protocols</Label>
        <Icon
          sf={{ default: 'list.bullet.rectangle', selected: 'list.bullet.rectangle.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="format-list-bulleted" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="calculator">
        <Label>Calculator</Label>
        <Icon
          sf={{ default: 'syringe', selected: 'syringe.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="calculator-variant" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Label>Library</Label>
        <Icon
          sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="book-open-variant" />}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          androidSrc={<VectorIcon family={MaterialCommunityIcons} name="cog" />}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
