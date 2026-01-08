import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {DrawerContentScrollView, DrawerContentComponentProps} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {LoadingOverlay} from './LoadingOverlay';

interface NavigationItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  description?: string;
  badge?: string;
}

// Main navigation items - Core revenue management tools
const mainNavigationItems: NavigationItem[] = [
  {
    id: 'cluster',
    title: 'Cluster',
    route: 'ClusterView',
    icon: 'account-tree',
    description: 'Cluster management and analysis',
  },
  {
    id: 'overview',
    title: 'Overview',
    route: 'Overview',
    icon: 'home',
    description: 'Dashboard overview and key metrics',
  },
  {
    id: 'rate-trends',
    title: 'Rate Trends',
    route: 'RateTrend',
    icon: 'trending-up',
    description: 'Rate trends and analysis',
  },
  {
    id: 'demand-forecast',
    title: 'Demand Forecast',
    route: 'Demand',
    icon: 'bar-chart',
    description: 'Market demand forecasting',
  },
  {
    id: 'parity-monitor',
    title: 'Parity Monitor',
    route: 'ParityMonitoring',
    icon: 'security',
    description: 'Rate parity tracking and alerts',
  },
  {
    id: 'ota-rankings',
    title: 'OTA Rankings',
    route: 'OTARankings',
    icon: 'star',
    description: 'Online travel agent rankings',
  },
  {
    id: 'business-insights',
    title: 'Business Insights',
    route: 'BusinessInsights',
    icon: 'lightbulb',
    description: 'Market insights and business intelligence',
  },
  {
    id: 'price-planner',
    title: 'Price Planner',
    route: 'PricePlanner',
    icon: 'attach-money',
    description: 'Price planning and strategy',
  },
  {
    id: 'events',
    title: 'Events Calendar',
    route: 'EventsCalendar',
    icon: 'event',
    description: 'Event impact and calendar management',
  },
];

// Support and configuration items - Bottom section
const supportNavigationItems: NavigationItem[] = [
  {
    id: 'reports',
    title: 'Reports',
    route: 'Reports',
    icon: 'description',
    description: 'View and manage reports',
  },
  {
    id: 'settings',
    title: 'Settings',
    route: 'Settings',
    icon: 'settings',
    description: 'Application settings and preferences',
  },
  {
    id: 'help',
    title: 'Help & Support',
    route: 'Help',
    icon: 'help',
    description: 'Documentation and support resources',
  },
];

export function NavigationDrawer(props: DrawerContentComponentProps) {
  const navigation = useNavigation();
  const {state} = props;
  const currentRoute = state.routes[state.index]?.name;
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = (route: string) => {
    // Don't navigate if already on the same route
    if (currentRoute === route) {
      props.navigation.closeDrawer();
      return;
    }

    // Show loading immediately
    setIsNavigating(true);
    props.navigation.closeDrawer();

    // Small delay to ensure smooth transition
    setTimeout(() => {
      navigation.navigate(route as never);
      // Hide loading after navigation completes
      setTimeout(() => {
        setIsNavigating(false);
      }, 200);
    }, 100);
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = currentRoute === item.route;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => handleNavigation(item.route)}
        activeOpacity={0.7}>
        <Icon
          name={item.icon}
          size={20}
          color={isActive ? '#008FFF' : '#64748b'}
          style={styles.navIcon}
        />
        <View style={styles.navItemContent}>
          <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
            {item.title}
          </Text>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.drawer}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}>
        {/* Main Navigation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Revenue Management</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.navItemsContainer}>
            {mainNavigationItems.map(item => renderNavigationItem(item))}
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.navItemsContainer}>
            {supportNavigationItems.map(item => renderNavigationItem(item))}
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Bottom Footer - Issues Badge */}
      <View style={styles.footer}>
        <View style={styles.issuesBadge}>
          <View style={styles.issuesIconContainer}>
            <Text style={styles.issuesIconText}>N</Text>
          </View>
          <Text style={styles.issuesText}>17 Issues</Text>
          <TouchableOpacity onPress={() => {}}>
            <Icon name="close" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isNavigating} />
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 2, height: 0},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  drawerContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 8,
  },
  navItemsContainer: {
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  navIcon: {
    marginRight: 12,
  },
  navItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
  },
  navItemTextActive: {
    color: '#008FFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  issuesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  issuesIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  issuesIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  issuesText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

