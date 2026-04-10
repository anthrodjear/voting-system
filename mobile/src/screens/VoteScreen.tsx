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
        styles.candidateCard,
        selectedCandidate?.id === item.id && styles.candidateCardSelected,
      ]}
      onPress={() => setSelectedCandidate(item)}
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
        <ActivityIndicator size="large" color="#c0392b" />
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#c0392b',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statusBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ffebee',
  },
  statusVerified: {
    backgroundColor: '#e8f5e9',
  },
  statusIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: '#333',
  },
  list: {
    padding: 16,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  candidateCardSelected: {
    borderColor: '#c0392b',
    backgroundColor: '#fdf2f2',
  },
  candidateRadio: {
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#c0392b',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#c0392b',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  candidateParty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  candidatePosition: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default VoteScreen;