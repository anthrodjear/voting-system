import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VoterHomeScreen from '../screens/VoterHomeScreen';
import VoteScreen from '../screens/VoteScreen';
import BiometricsScreen from '../screens/BiometricsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import RODashboardScreen from '../screens/RODashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const VoterTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={VoterHomeScreen} />
    <Tab.Screen name="Biometrics" component={BiometricsScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const getInitialRoute = () => {
    if (!isAuthenticated) return 'Login';
    switch (user?.role) {
      case 'voter': return 'VoterHome';
      case 'admin': return 'AdminDashboard';
      case 'ro': return 'RODashboard';
      default: return 'Login';
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={getInitialRoute()}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VoterHome" component={VoterHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Vote" component={VoteScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Biometrics" component={BiometricsScreen} options={{ title: 'Biometrics' }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RODashboard" component={RODashboardScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;