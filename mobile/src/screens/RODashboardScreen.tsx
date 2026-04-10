import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../config/api';

interface Stats {
  verifiedVoters: number;
  totalVotes: number;
  batchesProcessed: number;
  pendingBatches: number;
}

interface RODashboardScreenProps {
  navigation: any;
}

const RODashboardScreen: React.FC<RODashboardScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<Stats>({
    verifiedVoters: 0,
    totalVotes: 0,
    batchesProcessed: 0,
    pendingBatches: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.getROStats();
      setStats(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => { logout(); navigation.replace('Login'); } },
    ]);
  };

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Returning Officer</Text>
          <Text style={styles.userName}>{user?.name || 'RO'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          <StatCard title="Verified Voters" value={stats.verifiedVoters} icon="✓" />
          <StatCard title="Total Votes" value={stats.totalVotes} icon="🗳️" />
          <StatCard title="Batches" value={stats.batchesProcessed} icon="📦" />
          <StatCard title="Pending" value={stats.pendingBatches} icon="⏳" />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionlarge}
            onPress={() => navigation.navigate('ScanBatch')}
          >
            <Text style={styles.actionIconLarge}>📷</Text>
            <Text style={styles.actionTextLarge}>Scan Batch QR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionlarge}
            onPress={() => navigation.navigate('VerifyVoter')}
          >
            <Text style={styles.actionIconLarge}>👤</Text>
            <Text style={styles.actionTextLarge}>Verify Voter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#c0392b',
  },
  welcomeText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  logoutText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  content: { flex: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    alignItems: 'center',
  },
  statIcon: { fontSize: 28 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginTop: 8 },
  statTitle: { fontSize: 12, color: '#666', marginTop: 4 },
  quickActions: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  actionlarge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconLarge: { fontSize: 24, marginRight: 16 },
  actionTextLarge: { fontSize: 16, color: '#333', fontWeight: '500' },
});

export default RODashboardScreen;