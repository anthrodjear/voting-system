import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  CameraView,
  useCameraPermissions,
} from 'react-native';
import api from '../config/api';
import { useAuthStore } from '../store/useAuthStore';

interface BiometricsScreenProps {
  navigation: any;
}

const BiometricsScreen: React.FC<BiometricsScreenProps> = ({ navigation }) => {
  const [faceData, setFaceData] = useState<string | null>(null);
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkBiometricsStatus();
  }, []);

  const checkBiometricsStatus = async () => {
    try {
      const response = await api.verifyBiometrics();
      if (response.data.enrolled) {
        setFaceData('enrolled');
        setFingerprintData('enrolled');
      }
    } catch (error) {
      // Not enrolled yet
    }
  };

  const handleFaceCapture = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed for biometric verification');
        return;
      }
    }
    
    setIsVerifying(true);
    try {
      // Simulate face capture - in production, capture actual image
      setTimeout(() => {
        setFaceData('captured');
        setIsVerifying(false);
        Alert.alert('Success', 'Face captured successfully');
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture face');
      setIsVerifying(false);
    }
  };

  const handleFingerprintCapture = () => {
    setIsVerifying(true);
    // Simulate fingerprint capture
    setTimeout(() => {
      setFingerprintData('captured');
      setIsVerifying(false);
      Alert.alert('Success', 'Fingerprint captured successfully');
    }, 1500);
  };

  const handleSubmitBiometrics = async () => {
    if (!faceData || !fingerprintData) {
      Alert.alert('Error', 'Please capture both face and fingerprint');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitBiometrics({
        faceData: faceData || '',
        fingerprintData: fingerprintData || '',
      });

      Alert.alert('Success', 'Biometrics submitted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit biometrics');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEnrolled = faceData && fingerprintData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biometric Enrollment</Text>
        <Text style={styles.subtitle}>
          {isEnrolled ? 'Your biometrics are enrolled' : 'Enroll your biometrics to vote'}
        </Text>
      </View>

      {isEnrolled ? (
        <View style={styles.enrolledContainer}>
          <View style={styles.enrolledIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.enrolledText}>Biometrics Enrolled</Text>
          <Text style={styles.enrolledSubtext}>
            Your face and fingerprint are verified
          </Text>
          <TouchableOpacity
            style={styles.reEnrollButton}
            onPress={() => {
              setFaceData(null);
              setFingerprintData(null);
            }}
          >
            <Text style={styles.reEnrollText}>Re-enroll</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Face Recognition</Text>
            <Text style={styles.cardDescription}>
              Position your face within the frame
            </Text>
            <TouchableOpacity
              style={[styles.captureButton, isVerifying && styles.captureButtonDisabled]}
              onPress={handleFaceCapture}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.captureButtonText}>
                  {faceData ? 'Captured' : 'Capture Face'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fingerprint</Text>
            <Text style={styles.cardDescription}>
              Place your finger on the scanner
            </Text>
            <TouchableOpacity
              style={[styles.captureButton, isVerifying && styles.captureButtonDisabled]}
              onPress={handleFingerprintCapture}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.captureButtonText}>
                  {fingerprintData ? 'Captured' : 'Scan Fingerprint'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!faceData || !fingerprintData || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitBiometrics}
            disabled={!faceData || !fingerprintData || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Biometrics</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#c0392b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  enrolledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  enrolledIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 40,
    color: '#fff',
  },
  enrolledText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
  },
  enrolledSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  reEnrollButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: 8,
  },
  reEnrollText: {
    color: '#c0392b',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  captureButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  captureButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#c0392b',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default BiometricsScreen;