/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { Button, StatusBar, StyleSheet, TextInput, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';


function App() {
  const isDarkMode = useColorScheme() === 'dark';


  return (
    <View style={styles.container}>
       
      <TextInput value={""} placeholder="Zipy Debug ID" editable={false} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
