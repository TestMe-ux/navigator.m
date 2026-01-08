import React, {useState, useEffect} from 'react';
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
import {demandData} from '../data/staticData';

/**
 * Demand Page for Mobile
 * Market demand forecasting
 */
export function DemandPage() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'wow' | 'mom' | 'yoy'>('wow'); // wow, mom, yoy

  // Load static data based on filter
  const summaryData = demandData[filter].summary;
  const events = demandData.events;

  const filterOptions = [
    {id: 'wow', label: 'WoW', value: 'wow' as const},
    {id: 'mom', label: 'MoM', value: 'mom' as const},
    {id: 'yoy', label: 'YoY', value: 'yoy' as const},
  ];

  return (
    <View style={[styles.container, {paddingTop: insets.top + 64}]}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterButton,
                filter === option.value && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(option.value as 'wow' | 'mom' | 'yoy')}>
              <Text
                style={[
                  styles.filterButtonText,
                  filter === option.value && styles.filterButtonTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Demand Forecast</Text>
            <Text style={styles.subtitle}>
              Market demand forecasting and analysis
            </Text>
          </View>
          <TouchableOpacity style={styles.downloadButton}>
            <Icon name="download" size={20} color="#008FFF" />
            <Text style={styles.downloadButtonText}>Download CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Demand Calendar Overview */}
        <View style={styles.section}>
          <View style={styles.calendarPlaceholder}>
            <Icon name="calendar-today" size={48} color="#cbd5e1" />
            <Text style={styles.placeholderText}>Demand Calendar</Text>
            <Text style={styles.placeholderSubtext}>
              Calendar view with demand indicators will be displayed here
            </Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            {summaryData.map((item, index) => (
              <View key={item.id} style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View
                    style={[
                      styles.summaryIconContainer,
                      {backgroundColor: `${item.color}20`},
                    ]}>
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.summaryTitle}>{item.title}</Text>
                </View>
                <Text style={[styles.summaryValue, {color: item.color}]}>
                  {item.value}
                </Text>
                <View style={styles.summaryChange}>
                  <Icon
                    name="trending-up"
                    size={14}
                    color={item.change?.startsWith('+') ? '#10b981' : '#ef4444'}
                  />
                  <Text
                    style={[
                      styles.summaryChangeText,
                      {
                        color: item.change?.startsWith('+') ? '#10b981' : '#ef4444',
                      },
                    ]}>
                    {item.change}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Demand Trends Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demand Trends</Text>
          <View style={styles.chartPlaceholder}>
            <Icon name="show-chart" size={48} color="#cbd5e1" />
            <Text style={styles.placeholderText}>Demand Trends Chart</Text>
            <Text style={styles.placeholderSubtext}>
              Chart visualization will be displayed here
            </Text>
          </View>
        </View>

        {/* Events & Holidays Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Events & Holidays</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {events.length > 0 ? (
              <View style={styles.eventsList}>
                {events.map(event => (
                  <View key={event.id} style={styles.eventItem}>
                    <View style={styles.eventIconContainer}>
                      <Icon
                        name={event.type === 'holiday' ? 'celebration' : 'event'}
                        size={20}
                        color={
                          event.impact === 'high'
                            ? '#ef4444'
                            : event.impact === 'medium'
                            ? '#f59e0b'
                            : '#10b981'
                        }
                      />
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <Text style={styles.eventDate}>{event.date}</Text>
                    </View>
                    <View
                      style={[
                        styles.eventBadge,
                        {
                          backgroundColor:
                            event.impact === 'high'
                              ? '#fee2e2'
                              : event.impact === 'medium'
                              ? '#fef3c7'
                              : '#d1fae5',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.eventBadgeText,
                          {
                            color:
                              event.impact === 'high'
                                ? '#ef4444'
                                : event.impact === 'medium'
                                ? '#f59e0b'
                                : '#10b981',
                          },
                        ]}>
                        {event.impact.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.eventsPlaceholder}>
                <Icon name="event" size={48} color="#cbd5e1" />
                <Text style={styles.placeholderText}>No Events Found</Text>
                <Text style={styles.placeholderSubtext}>
                  Events and holidays will be displayed here
                </Text>
              </View>
            )}
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
  },
  filterButton: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    gap: 12,
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
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008FFF',
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
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 14,
    color: '#008FFF',
    fontWeight: '600',
  },
  calendarPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
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
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  summaryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartPlaceholder: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
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
  eventsPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  bottomSpacing: {
    height: 20,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#64748b',
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

