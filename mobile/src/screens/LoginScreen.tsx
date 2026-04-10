import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import api from '../config/api';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'voter' | 'admin' | 'ro'>('voter');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!nationalId || !password) {
      Alert.alert('Error', 'Please enter National ID and password');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (role === 'voter') {
        response = await api.voterLogin({ nationalId, password });
      } else if (role === 'admin') {
        response = await api.adminLogin({ email: nationalId, password });
      } else {
        response = await api.roLogin({ email: nationalId, password });
      }

      const { token, user } = response.data;
      login(user, token);
      api.setToken(token);

      if (role === 'voter') {
        navigation.replace('VoterHome');
      } else if (role === 'admin') {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('RODashboard');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleSelector = () => (
    <View style={styles.roleSelector}>
      <TouchableOpacity
        style={[styles.roleButton, role === 'voter' && styles.roleButtonActive]}
        onPress={() => setRole('voter')}
      >
        <Text style={[styles.roleText, role === 'voter' && styles.roleTextActive]}>
          Voter
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
        onPress={() => setRole('admin')}
      >
        <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>
          Admin
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.roleButton, role === 'ro' && styles.roleButtonActive]}
        onPress={() => setRole('ro')}
      >
        <Text style={[styles.roleText, role === 'ro' && styles.roleTextActive]}>
          R.O.
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>IEBC</Text>
          </View>
          <Text style={styles.title}>Voting System</Text>
          <Text style={styles.subtitle}>Secure. Transparent. Democratic.</Text>
        </View>

        <RoleSelector />

        <View style={styles.form}>
          <Text style={styles.label}>
            {role === 'voter' ? 'National ID' : 'Email'}
          </Text>
          <TextInput
            style={styles.input}
            value={nationalId}
            onChangeText={setNationalId}
            placeholder={role === 'voter' ? 'Enter National ID' : 'Enter Email'}
            keyboardType={role === 'voter' ? 'numeric' : 'email-address'}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleButtonActive: {
    backgroundColor: '#c0392b',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#c0392b',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#c0392b',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LoginScreen;