import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#F8FAFC' },
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
    </Stack.Navigator>
  );
}
