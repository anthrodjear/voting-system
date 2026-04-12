import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import api from '../config/api';

interface Candidate {
  id: string;
  name: string;
  party: string;
  logo?: string;
  position: string;
}

interface VoteScreenProps {
  navigation: any;
  route: any;
}

const VoteScreen: React.FC<VoteScreenProps> = ({ navigation, route }) => {
  const { election } = route.params;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCandidates();
    verifyBiometrics();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await api.getCandidates(election.id);
      setCandidates(response.data.candidates);
    } catch (error) {
      Alert.alert('Error', 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBiometrics = async () => {
    try {
      const response = await api.verifyBiometrics();
      setBiometricVerified(response.data.verified);
    } catch (error) {
      setBiometricVerified(false);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      Alert.alert('Error', 'Please select a candidate');
      return;
    }

    if (!biometricVerified) {
      Alert.alert('Verification Required', 'Please verify your biometrics first');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.castVote({
        electionId: election.id,
        candidateId: selectedCandidate.id,
        biometricData: 'verified',
      });

      Alert.alert('Success', 'Your vote has been cast successfully!', [
        { text: 'OK', onPress: () => navigation.replace('VoterHome') },
      ]);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cast vote';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCandidate = ({ item }: { item: Candidate }) => (
    <TouchableOpacity
      style={[
        styles.candidateItem,
        selectedCandidate?.id === item.id && styles.candidateCardSelected,
      ]}
      onPress={() => setSelectedCandidate(item)}
      activeOpacity={0.6}
    >
      <View style={styles.candidateRadio}>
        <View style={[
          styles.radioOuter,
          selectedCandidate?.id === item.id && styles.radioOuterSelected,
        ]}>
          {selectedCandidate?.id === item.id && <View style={styles.radioInner} />}
        </View>
      </View>
      <View style={styles.candidateInfo}>
        <Text style={styles.candidateName}>{item.name}</Text>
        <Text style={styles.candidateParty}>{item.party}</Text>
        <Text style={styles.candidatePosition}>{item.position}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff453a" />
        <Text style={styles.loadingText}>Loading candidates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{election.name}</Text>
        <Text style={styles.subtitle}>Select your candidate</Text>
      </View>

      <View style={styles.statusBar}>
        <View style={[styles.statusItem, biometricVerified && styles.statusVerified]}>
          <Text style={styles.statusIcon}>{biometricVerified ? '✓' : '!'}</Text>
          <Text style={styles.statusLabel}>
            Biometrics {biometricVerified ? 'Verified' : 'Required'}
          </Text>
        </View>
      </View>

      <FlatList
        data={candidates}
        renderItem={renderCandidate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No candidates available</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedCandidate || !biometricVerified || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitVote}
          disabled={!selectedCandidate || !biometricVerified || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Vote</Text>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    color: '#8e8e93',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  backButton: {
    color: '#0a84ff',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: 4,
  },
  statusBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1c1c1e',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2c2c2e',
  },
  statusVerified: {
    backgroundColor: '#1a3d1a',
  },
  statusIcon: {
    marginRight: 8,
    fontSize: 14,
    color: '#30d158',
  },
  statusLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  list: {
    paddingBottom: 100,
  },
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#38383a',
  },
  candidateCardSelected: {
    backgroundColor: '#1c1c1e',
  },
  candidateRadio: {
    marginRight: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#48484a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#ff453a',
    borderWidth: 3,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff453a',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  candidateParty: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
  },
  candidatePosition: {
    fontSize: 12,
    color: '#636366',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8e8e93',
    marginTop: 60,
    fontSize: 15,
  },
  footer: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#1c1c1e',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#38383a',
  },
  submitButton: {
    backgroundColor: '#ff453a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#48484a',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default VoteScreen;