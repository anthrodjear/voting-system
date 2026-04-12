import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../config/api';

interface Election {
  id: string;
  name: string;
  date: string;
  status: 'upcoming' | 'active' | 'completed';
  type: 'presidential' | 'gubernatorial' | 'county' | 'ward';
}

interface VoterHomeScreenProps {
  navigation: any;
}

const VoterHomeScreen: React.FC<VoterHomeScreenProps> = ({ navigation }) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const response = await api.getElections();
      setElections(response.data.elections);
    } catch (error) {
      Alert.alert('Error', 'Failed to load elections');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadElections();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => {
        logout();
        navigation.replace('Login');
      }},
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#27ae60';
      case 'upcoming': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'upcoming': return styles.statusUpcoming;
      default: return styles.statusCompleted;
    }
  };

  const renderElection = ({ item }: { item: Election }) => (
    <TouchableOpacity
      style={styles.electionItem}
      onPress={() => {
        setSelectedElection(item);
        if (item.status === 'active') {
          navigation.navigate('Vote', { election: item });
        }
      }}
      activeOpacity={0.6}
    >
      <View style={styles.electionInfo}>
        <Text style={styles.electionType}>{item.type}</Text>
        <Text style={styles.electionName}>{item.name}</Text>
        <Text style={styles.electionDate}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
      </View>
      <Text style={getStatusStyle(item.status)}>
        {item.status === 'active' ? '● Vote' : item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Voter'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Elections</Text>
      <FlatList
        data={elections}
        renderItem={renderElection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8e8e93" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No elections available</Text>
        }
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navItemActive]}>●</Text>
          <Text style={[styles.navText, styles.navItemActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Biometrics')}
        >
          <Text style={styles.navIcon}>○</Text>
          <Text style={[styles.navText, styles.navItemInactive]}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('VoterProfile')}
        >
          <Text style={styles.navIcon}>○</Text>
          <Text style={[styles.navText, styles.navItemInactive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  welcomeText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  logoutText: {
    fontSize: 15,
    color: '#ff453a',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: {
    paddingBottom: 100,
  },
  electionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#38383a',
  },
  electionInfo: {
    flex: 1,
  },
  electionType: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  electionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  electionDate: {
    fontSize: 14,
    color: '#8e8e93',
  },
  statusActive: {
    fontSize: 12,
    color: '#30d158',
    fontWeight: '600',
  },
  statusUpcoming: {
    fontSize: 12,
    color: '#0a84ff',
    fontWeight: '600',
  },
  statusCompleted: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8e8e93',
    marginTop: 60,
    fontSize: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#38383a',
    paddingBottom: 34,
    paddingTop: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    color: '#ff453a',
  },
  navItemInactive: {
    color: '#8e8e93',
  },
  navIcon: {
    fontSize: 22,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default VoterHomeScreen;