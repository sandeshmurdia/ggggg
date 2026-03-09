import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeStack } from './HomeStack';
import { CategoriesStack } from './CategoriesStack';
import { CartStack } from './CartStack';
import { ProfileStack } from './ProfileStack';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { cart } = useApp();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesStack}
        options={{ tabBarLabel: 'Categories', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📂</Text> }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🛒</Text>,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ tabBarLabel: 'Account', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
