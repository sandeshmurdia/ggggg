import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: '#F8FAFC' },
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Shop' }} />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
    </Stack.Navigator>
  );
}
