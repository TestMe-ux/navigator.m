import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

/**
 * Enhanced Header Component for Mobile
 * 
 * A professional navigation header with:
 * - Brand gradient design system
 * - Hotel search functionality
 * - User notifications and settings
 * - Mobile-optimized responsive design
 * 
 * @component
 * @version 2.0.0
 */
export function Header() {
  const navigation = useNavigation();
  const didFetch = useRef(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [hotelOptions, setHotelOptions] = useState<any>([]);
  const [hotelSearch, setHotelSearch] = useState('');
  const [showHotelDropdown, setShowHotelDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(3);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    // Load from AsyncStorage or API
    // const selectedProperty = await AsyncStorage.getItem('SelectedProperty');
    // const properties = await AsyncStorage.getItem('Properties');
    // if (selectedProperty) {
    //   setSelectedHotel(JSON.parse(selectedProperty));
    //   setHotelOptions(JSON.parse(properties || '[]'));
    // }
  }, []);

  const filteredHotels = hotelOptions.filter((hotel: any) => {
    if (!hotelSearch.trim()) return true;
    const searchLower = hotelSearch.toLowerCase();
    return (
      hotel?.name?.toLowerCase().includes(searchLower) ||
      hotel?.city?.toLowerCase().includes(searchLower) ||
      hotel?.country?.toLowerCase().includes(searchLower)
    );
  });

  const handleHotelSelect = (hotel: any) => {
    setSelectedHotel(hotel);
    setHotelSearch('');
    setShowHotelDropdown(false);
    // Save to AsyncStorage
    // AsyncStorage.setItem('SelectedProperty', JSON.stringify(hotel));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* Left Side - Application Branding */}
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Overview' as never)}>
          <Text style={styles.logoText}>Navigator</Text>
        </TouchableOpacity>

        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          {/* Hotel Selector */}
          <TouchableOpacity
            style={styles.hotelSelector}
            onPress={() => setShowHotelDropdown(true)}>
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName} numberOfLines={1}>
                {truncateText(selectedHotel?.name || 'Select Hotel', 20)}
              </Text>
              <Text style={styles.hotelLocation} numberOfLines={1}>
                {selectedHotel?.city || 'City'}, {selectedHotel?.country || 'Country'}
              </Text>
            </View>
            <Icon name="arrow-drop-down" size={20} color="#e0f2fe" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // Navigate to notifications
            }}>
            <Icon name="notifications" size={24} color="#e0f2fe" />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User Profile */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowUserMenu(true)}>
            <Icon name="account-circle" size={24} color="#e0f2fe" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hotel Dropdown Modal */}
      <Modal
        visible={showHotelDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHotelDropdown(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHotelDropdown(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hotel</Text>
              <TouchableOpacity onPress={() => setShowHotelDropdown(false)}>
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search hotels, locations..."
                value={hotelSearch}
                onChangeText={setHotelSearch}
                placeholderTextColor="#64748b"
              />
            </View>
            <ScrollView style={styles.hotelList}>
              {filteredHotels.length > 0 ? (
                filteredHotels.map((hotel: any) => (
                  <TouchableOpacity
                    key={hotel.hmid}
                    style={[
                      styles.hotelItem,
                      selectedHotel?.hmid === hotel.hmid && styles.hotelItemSelected,
                    ]}
                    onPress={() => handleHotelSelect(hotel)}>
                    <Text style={styles.hotelItemName}>{hotel?.name || 'Unknown Hotel'}</Text>
                    <Text style={styles.hotelItemLocation}>
                      {hotel?.city || 'City'}, {hotel?.country || 'Country'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No hotels found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUserMenu(false)}>
          <View style={styles.userMenuContent}>
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                // Navigate to my account
              }}>
              <Icon name="person" size={20} color="#1e293b" />
              <Text style={styles.userMenuItemText}>My Account</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.userMenuItem}
              onPress={() => {
                setShowUserMenu(false);
                // Handle logout
              }}>
              <Icon name="logout" size={20} color="#ef4444" />
              <Text style={[styles.userMenuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    width: '100%',
    backgroundColor: '#008FFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  logoContainer: {
    flexShrink: 0,
    paddingLeft: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  hotelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hotelInfo: {
    flex: 1,
    marginRight: 4,
  },
  hotelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  hotelLocation: {
    fontSize: 12,
    color: '#bae6fd',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  hotelList: {
    maxHeight: 400,
  },
  hotelItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  hotelItemSelected: {
    backgroundColor: '#e0f2fe',
  },
  hotelItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  hotelItemLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
  },
  userMenuContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    marginTop: 'auto',
    marginBottom: 100,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  userMenuItemText: {
    fontSize: 16,
    color: '#1e293b',
  },
  logoutText: {
    color: '#ef4444',
  },
  separator: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
});

