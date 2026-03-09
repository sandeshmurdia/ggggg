import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartStackParamList } from './types';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderConfirmScreen } from '../screens/OrderConfirmScreen';

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: '#F8FAFC' },
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen
        name="OrderConfirm"
        component={OrderConfirmScreen}
        options={{ title: 'Order Confirmed', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
