import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Suppress the Expo HMR reconnect warning on physical Android devices where
// the dev server IP is unreachable — this is a dev-only network issue, not a bug.
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Could not connect to development server',
]);

import { AppProvider, useApp } from './src/AppContext';
import { colors } from './src/theme';

// Auth / selection screens
import GuestHomeScreen    from './src/screens/GuestHomeScreen';
import LoginScreen        from './src/screens/LoginScreen';
import RegisterScreen     from './src/screens/RegisterScreen';
import SelectionScreen    from './src/screens/SelectionScreen';

// Tab screens
import HomeScreen    from './src/screens/HomeScreen';
import UpdatesScreen from './src/screens/UpdatesScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Grid destination screens
import PartyInfoScreen    from './src/screens/PartyInfoScreen';
import ManifestoScreen    from './src/screens/ManifestoScreen';
import CommunityHubScreen from './src/screens/CommunityHubScreen';
import NewsScreen         from './src/screens/NewsScreen';
import PhotoGalleryScreen from './src/screens/PhotoGalleryScreen';
import VideoGalleryScreen from './src/screens/VideoGalleryScreen';
import DevelopmentScreen  from './src/screens/DevelopmentScreen';
import HealthScreen       from './src/screens/HealthScreen';
import SchemesScreen      from './src/screens/SchemesScreen';
import PhoneNumbersScreen from './src/screens/PhoneNumbersScreen';
import ComplaintsScreen   from './src/screens/ComplaintsScreen';
import FeedbackScreen     from './src/screens/FeedbackScreen';
import ContactScreen      from './src/screens/ContactScreen';
import AboutScreen           from './src/screens/AboutScreen';
import PostsScreen              from './src/screens/PostsScreen';
import PostDetailScreen         from './src/screens/PostDetailScreen';
import NewsArticleScreen        from './src/screens/NewsArticleScreen';
import SchemeDetailScreen       from './src/screens/SchemeDetailScreen';
import DevelopmentDetailScreen  from './src/screens/DevelopmentDetailScreen';
import HealthActivityScreen     from './src/screens/HealthActivityScreen';
import ManifestoDetailScreen    from './src/screens/ManifestoDetailScreen';
import VideoPlayerScreen        from './src/screens/VideoPlayerScreen';

const Stack = createNativeStackNavigator() as any;
const Tab   = createBottomTabNavigator() as any;

type TabName = 'Home' | 'Updates' | 'Profile';
const TAB_ICON_NAME: Record<TabName, string> = {
  Home:    'home',
  Updates: 'notifications',
  Profile: 'person',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route: r }) => ({
        tabBarIcon: ({ color, size }: any) => (
          <MaterialIcons
            name={TAB_ICON_NAME[r.name as TabName] as any}
            size={size ?? 24}
            color={color}
          />
        ),
        tabBarActiveTintColor:   colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { session, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loaderText}>PeopleConnect</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        /* ── Guest / unauthenticated stack ── */
        <>
          <Stack.Screen name="GuestHome" component={GuestHomeScreen} />
          <Stack.Screen name="Login"     component={LoginScreen} />
          <Stack.Screen name="Register"  component={RegisterScreen} />
          <Stack.Screen name="Selection" component={SelectionScreen} />
          {/* Public-access info screens (no login required) */}
          <Stack.Screen name="PartyInfo"    component={PartyInfoScreen} />
          <Stack.Screen name="Manifesto"        component={ManifestoScreen} />
          <Stack.Screen name="ManifestoDetail"  component={ManifestoDetailScreen} />
          <Stack.Screen name="Schemes"          component={SchemesScreen} />
          <Stack.Screen name="NewsArticle"      component={NewsArticleScreen} />
          <Stack.Screen name="SchemeDetail"     component={SchemeDetailScreen} />
        </>
      ) : (
        /* ── Authenticated stack ── */
        <>
          {/* MainTabs must be first so it is the initial route */}
          <Stack.Screen name="MainTabs"     component={MainTabs} />

          {/* All grid-destination screens — must be declared here in the
              same Stack so HomeScreen (inside Tab) can navigate to them */}
          <Stack.Screen name="PartyInfo"    component={PartyInfoScreen} />
          <Stack.Screen name="Manifesto"       component={ManifestoScreen} />
          <Stack.Screen name="ManifestoDetail" component={ManifestoDetailScreen} />
          <Stack.Screen name="CommunityHub"    component={CommunityHubScreen} />
          <Stack.Screen name="News"         component={NewsScreen} />
          <Stack.Screen name="Photos"       component={PhotoGalleryScreen} />
          <Stack.Screen name="Videos"       component={VideoGalleryScreen} />
          <Stack.Screen name="Development"  component={DevelopmentScreen} />
          <Stack.Screen name="Health"       component={HealthScreen} />
          <Stack.Screen name="Schemes"      component={SchemesScreen} />
          <Stack.Screen name="PhoneNumbers" component={PhoneNumbersScreen} />
          <Stack.Screen name="Complaints"   component={ComplaintsScreen} />
          <Stack.Screen name="Feedback"     component={FeedbackScreen} />
          <Stack.Screen name="Contact"      component={ContactScreen} />
          <Stack.Screen name="About"        component={AboutScreen} />
          <Stack.Screen name="Selection"    component={SelectionScreen} />
          <Stack.Screen name="GuestHome"    component={GuestHomeScreen} />
          <Stack.Screen name="Posts"              component={PostsScreen} />
          <Stack.Screen name="PostDetail"         component={PostDetailScreen} />
          <Stack.Screen name="NewsArticle"        component={NewsArticleScreen} />
          <Stack.Screen name="SchemeDetail"       component={SchemeDetailScreen} />
          <Stack.Screen name="DevelopmentDetail"  component={DevelopmentDetailScreen} />
          <Stack.Screen name="HealthActivity"     component={HealthActivityScreen} />
          <Stack.Screen name="VideoPlayer"        component={VideoPlayerScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loader:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.navy },
  loaderText: { color: colors.white, fontSize: 24, fontWeight: 'bold', marginTop: 16 },
});
