/**
 * @format
 */
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import zipy, { withGestureCapture } from 'zipy-react-native';
console.log('izpt  dasdasdasd ');






zipy.init("ce16257c");


AppRegistry.registerComponent(appName, () => withGestureCapture(App));
