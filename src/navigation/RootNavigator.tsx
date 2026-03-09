import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<{ SignIn: undefined; SignUp: undefined }>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

/**
 * Root navigator: shows Auth (SignIn/SignUp) when not logged in,
 * Main (tabs) when logged in. Switching is driven by useApp().user.
 */
export function RootNavigator() {
  const { user } = useApp();

  if (user) {
    return <MainTabs />;
  }
  return <AuthStack />;
}
