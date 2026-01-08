import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {Header} from './src/components/Header';
import {NavigationDrawer} from './src/components/NavigationDrawer';
import {LoadingOverlay} from './src/components/LoadingOverlay';
import {OverviewPage} from './src/pages/OverviewPage';
import {DemandPage} from './src/pages/DemandPage';
import {RateTrendsPage} from './src/pages/RateTrendsPage';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: () => <Header />,
        contentStyle: styles.container,
      }}>
      <Stack.Screen name="Overview" component={OverviewPage} />
      <Stack.Screen name="Demand" component={DemandPage} />
      <Stack.Screen name="RateTrend" component={RateTrendsPage} />
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  const navigationRef = useNavigationContainerRef();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      // Show loading when navigation state changes
      setIsNavigating(true);

      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Hide loading after a short delay (simulating page transition)
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, 300); // 300ms loading duration
    });

    return () => {
      unsubscribe();
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [navigationRef]);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle="light-content" />
        <Drawer.Navigator
          drawerContent={props => <NavigationDrawer {...props} />}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            drawerStyle: {
              width: 280,
            },
          }}>
          <Drawer.Screen name="Main" component={MainStack} />
        </Drawer.Navigator>
        <LoadingOverlay visible={isNavigating} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export default App;

