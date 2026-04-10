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
  totalVoters: number;
  totalVotes: number;
  activeElections: number;
  pendingApplications: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface AdminDashboardScreenProps {
  navigation: any;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const [stats, setStats] = useState<Stats>({
    totalVoters: 0,
    totalVotes: 0,
    activeElections: 0,
    pendingApplications: 0,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        api.getAdminStats(),
        api.getNotifications(),
      ]);
      setStats(statsRes.data);
      setNotifications(notifRes.data.notifications);
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.notifCard, !item.isRead && styles.notifUnread]}>
      <View style={styles.notifHeader}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        {!item.isRead && <View style={styles.unreadBadge} />}
      </View>
      <Text style={styles.notifMessage}>{item.message}</Text>
      <Text style={styles.notifDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Admin Dashboard</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
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
          <StatCard title="Total Voters" value={stats.totalVoters} icon="👥" />
          <StatCard title="Total Votes" value={stats.totalVotes} icon="🗳️" />
          <StatCard title="Active Elections" value={stats.activeElections} icon="�️" />
          <StatCard title="Pending" value={stats.pendingApplications} icon="⏳" />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Voters')}
            >
              <Text style={styles.actionIcon}>👥</Text>
              <Text style={styles.actionText}>Voters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Results')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Results</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Elections')}
            >
              <Text style={styles.actionIcon}>�️</Text>
              <Text style={styles.actionText}>Elections</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notificationsSection}>
          <View style={styles.notifHeaderRow}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {notifications.slice(0, 5).map((item) => (
            <View key={item.id}>{renderNotification({ item })}</View>
          ))}
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
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 24 },
  actionText: { fontSize: 14, color: '#333', marginTop: 8 },
  notificationsSection: { padding: 16 },
  notifHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badge: {
    backgroundColor: '#c0392b',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  notifUnread: { borderLeftWidth: 3, borderLeftColor: '#c0392b' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c0392b',
  },
  notifMessage: { fontSize: 13, color: '#666', marginTop: 4 },
  notifDate: { fontSize: 11, color: '#999', marginTop: 4 },
});

export default AdminDashboardScreen;