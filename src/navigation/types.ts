import { Product } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { product: Product };
  Category: { categoryId: string; categoryName: string };
  Search: undefined;
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  Category: { categoryId: string; categoryName: string };
  ProductDetail: { product: Product };
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderConfirm: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};
