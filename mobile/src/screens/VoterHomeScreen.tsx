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

  const renderElection = ({ item }: { item: Election }) => (
    <TouchableOpacity
      style={styles.electionCard}
      onPress={() => {
        setSelectedElection(item);
        if (item.status === 'active') {
          navigation.navigate('Vote', { election: item });
        }
      }}
    >
      <View style={styles.electionHeader}>
        <Text style={styles.electionType}>{item.type.toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.electionName}>{item.name}</Text>
      <Text style={styles.electionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      {item.status === 'active' && (
        <TouchableOpacity
          style={styles.voteButton}
          onPress={() => navigation.navigate('Vote', { election: item })}
        >
          <Text style={styles.voteButtonText}>Cast Vote</Text>
        </TouchableOpacity>
      )}
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

      <FlatList
        data={elections}
        renderItem={renderElection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No elections available</Text>
        }
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Biometrics')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Biometrics</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('VoterProfile')}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#c0392b',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  electionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  electionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  electionType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  electionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  electionDate: {
    fontSize: 14,
    color: '#666',
  },
  voteButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  voteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default VoterHomeScreen;