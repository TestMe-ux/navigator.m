import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {overviewData} from '../data/staticData';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

/**
 * Overview Page for Mobile
 * Dashboard overview and key metrics
 */
export function OverviewPage() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  // Load static data
  const insightsData = overviewData.insights;
  const kpiData = overviewData.kpi;
  const healthScore = overviewData.healthScore;

  return (
    <View style={[styles.container, {paddingTop: insets.top + 64}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Dashboard Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Overview</Text>
            <Text style={styles.subtitle}>
              Real-time insights for optimal pricing and revenue performance
            </Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          {kpiData.map((kpi, index) => (
            <View key={kpi.id} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIconContainer, {backgroundColor: `${kpi.color}20`}]}>
                  <Icon name={kpi.icon} size={24} color={kpi.color} />
                </View>
                <Text style={styles.kpiTitle}>{kpi.title}</Text>
              </View>
              <Text style={[styles.kpiValue, {color: kpi.color}]}>{kpi.value}</Text>
              <Text style={styles.kpiSubtitle}>{kpi.subtitle}</Text>
            </View>
          ))}
        </View>

        {/* Rate Trends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rate Trends</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartPlaceholder}>
            <Icon name="show-chart" size={48} color="#cbd5e1" />
            <Text style={styles.placeholderText}>Rate Trends Chart</Text>
            <Text style={styles.placeholderSubtext}>
              Chart visualization will be displayed here
            </Text>
          </View>

          {/* Insights Widget - Below Rate Trends helper text */}
          <View style={styles.insightsWrapper}>
            <View style={styles.insightsGradientBorder}>
              <Svg
                style={StyleSheet.absoluteFillObject}
                preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="insightsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#60a5fa" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  rx="12"
                  fill="url(#insightsGradient)"
                />
              </Svg>
              <View style={styles.insightsContent}>
                <Text style={styles.insightsTitle}>Insights</Text>
                <View style={styles.insightsList}>
                  {insightsData && insightsData.length > 0 ? (
                    insightsData.map((insight, index) => (
                      <View key={insight.id} style={styles.insightItem}>
                        <Text style={styles.insightText}>{insight.text}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.insightText}>No insights available</Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Property Health Score */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Property Health Score</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.healthScoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>{healthScore.overallScore}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.healthMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Parity</Text>
                  <Text style={styles.metricValue}>{healthScore.parity}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Rate</Text>
                  <Text style={styles.metricValue}>{healthScore.rate}%</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Demand</Text>
                  <Text style={styles.metricValue}>{healthScore.demand}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Market Demand Widget */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Demand</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.demandPlaceholder}>
              <Icon name="bar-chart" size={48} color="#cbd5e1" />
              <Text style={styles.placeholderText}>Market Demand Widget</Text>
              <Text style={styles.placeholderSubtext}>
                Demand forecast visualization will be displayed here
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  insightsWrapper: {
    marginTop: 16,
    width: '100%',
  },
  insightsGradientBorder: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
    backgroundColor: '#8b5cf6',
  },
  insightsContent: {
    padding: 16,
    backgroundColor: '#1e293b',
    margin: 2,
    borderRadius: 10,
    minHeight: 136,
    position: 'relative',
    zIndex: 1,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightsList: {
    gap: 10,
  },
  insightItem: {
    marginBottom: 4,
  },
  insightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 22,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  kpiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionLink: {
    fontSize: 14,
    color: '#008FFF',
    fontWeight: '600',
  },
  chartPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#e2e8f0',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  healthMetrics: {
    flex: 1,
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  demandPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  bottomSpacing: {
    height: 20,
  },
});

