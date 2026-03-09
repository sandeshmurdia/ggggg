import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from './types';
import { CategoriesListScreen } from '../screens/CategoriesListScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

export function CategoriesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: '#F8FAFC' },
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen name="CategoriesList" component={CategoriesListScreen} options={{ title: 'Categories' }} />
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
