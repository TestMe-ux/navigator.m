import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {overviewData} from '../data/staticData';

/**
 * Rate Trends Page for Mobile
 * Rate trends and pricing analysis
 */
export function RateTrendsPage() {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [dateFilter, setDateFilter] = useState('7days');
  const [channelFilter, setChannelFilter] = useState('all');

  // Mock rate trends data
  const rateTrendsData = [
    {date: '7 Jan', day: 'Mon', myAdr: 220, myAdrVariance: -5, compAvg: 225, compAvgVariance: 8, status: 'below'},
    {date: '8 Jan', day: 'Tue', myAdr: 235, myAdrVariance: 15, compAvg: 230, compAvgVariance: 5, status: 'above'},
    {date: '9 Jan', day: 'Wed', myAdr: 245, myAdrVariance: 10, compAvg: 250, compAvgVariance: 20, status: 'below'},
    {date: '10 Jan', day: 'Thu', myAdr: 250, myAdrVariance: 5, compAvg: 245, compAvgVariance: -5, status: 'above'},
    {date: '11 Jan', day: 'Fri', myAdr: 260, myAdrVariance: 10, compAvg: 265, compAvgVariance: 20, status: 'below'},
    {date: '12 Jan', day: 'Sat', myAdr: 280, myAdrVariance: 20, compAvg: 275, compAvgVariance: 10, status: 'above'},
    {date: '13 Jan', day: 'Sun', myAdr: 275, myAdrVariance: -5, compAvg: 280, compAvgVariance: 5, status: 'below'},
  ];

  // Mock insights data
  const insightsData = [
    {
      id: '1',
      text: 'Your rate is $5 below competitor avg on 7 Jan - consider increasing by 2%',
    },
    {
      id: '2',
      text: "You're $5 above competitor avg on 8 Jan - maintain competitive advantage",
    },
  ];

  return (
    <View style={[styles.container, {paddingTop: insets.top + 64}]}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              dateFilter === '7days' && styles.filterButtonActive,
            ]}
            onPress={() => setDateFilter('7days')}>
            <Icon name="calendar-today" size={16} color={dateFilter === '7days' ? '#ffffff' : '#64748b'} />
            <Text
              style={[
                styles.filterButtonText,
                dateFilter === '7days' && styles.filterButtonTextActive,
              ]}>
              Next 7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              channelFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setChannelFilter('all')}>
            <Icon name="language" size={16} color={channelFilter === 'all' ? '#ffffff' : '#64748b'} />
            <Text
              style={[
                styles.filterButtonText,
                channelFilter === 'all' && styles.filterButtonTextActive,
              ]}>
              All Channels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterIconButton}>
            <Icon name="tune" size={20} color="#64748b" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Rate Trends</Text>
            <Text style={styles.subtitle}>
              Rate trends and pricing analysis
            </Text>
          </View>
        </View>

        {/* Insights Widget */}
        <View style={styles.section}>
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
                        <View style={styles.insightDot} />
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

        {/* Detailed Analysis Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  viewMode === 'table' && styles.viewToggleButtonActive,
                ]}
                onPress={() => setViewMode('table')}>
                <Icon
                  name="table-chart"
                  size={20}
                  color={viewMode === 'table' ? '#008FFF' : '#64748b'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  viewMode === 'chart' && styles.viewToggleButtonActive,
                ]}
                onPress={() => setViewMode('chart')}>
                <Icon
                  name="show-chart"
                  size={20}
                  color={viewMode === 'chart' ? '#008FFF' : '#64748b'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Table View */}
          {viewMode === 'table' && (
            <View style={styles.card}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Date</Text>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>
                    My ADR
                  </Text>
                  <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>
                    Comp 1
                  </Text>
                </View>
                {rateTrendsData.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tableRow,
                      index < rateTrendsData.length - 1 && styles.tableRowBorder,
                    ]}>
                    <View style={styles.tableCellContainer}>
                      <Text style={styles.tableCellDate}>{item.date}</Text>
                      <Text style={styles.tableCellDay}>{item.day}</Text>
                    </View>
                    <View style={[styles.tableCellContainer, styles.tableCellRight]}>
                      <Text style={styles.tableCellRate}>${item.myAdr}</Text>
                      <Text
                        style={[
                          styles.tableCellVariance,
                          {
                            color:
                              item.myAdrVariance >= 0 ? '#ef4444' : '#10b981',
                          },
                        ]}>
                        {item.myAdrVariance >= 0 ? '+' : ''}
                        {item.myAdrVariance}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tableCellContainer,
                        styles.tableCellRight,
                      ]}>
                      <Text
                        style={[
                          styles.tableCellRate,
                          {color: item.status === 'above' ? '#10b981' : '#ef4444'},
                        ]}>
                        ${item.compAvg}
                      </Text>
                      <Text
                        style={[
                          styles.tableCellVariance,
                          {
                            color:
                              item.compAvgVariance >= 0 ? '#ef4444' : '#10b981',
                          },
                        ]}>
                        {item.compAvgVariance >= 0 ? '+' : ''}
                        {item.compAvgVariance}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Chart View */}
          {viewMode === 'chart' && (
            <View style={styles.chartPlaceholder}>
              <Icon name="show-chart" size={48} color="#cbd5e1" />
              <Text style={styles.placeholderText}>Rate Trends Chart</Text>
              <Text style={styles.placeholderSubtext}>
                Chart visualization will be displayed here
              </Text>
            </View>
          )}
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
  filterBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#008FFF',
    borderColor: '#008FFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  viewToggleButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  insightsWrapper: {
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginTop: 8,
    flexShrink: 0,
  },
  insightText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 22,
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
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
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  tableHeaderRight: {
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCellContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tableCell: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  tableCellDate: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  tableCellDay: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  tableCellRight: {
    alignItems: 'flex-end',
  },
  tableCellRate: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  tableCellVariance: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
    lineHeight: 14,
  },
  chartPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
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
  bottomSpacing: {
    height: 20,
  },
});

