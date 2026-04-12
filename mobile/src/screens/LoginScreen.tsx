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
    backgroundColor: '#000000',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff453a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: '#38383a',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8e8e93',
  },
  roleTextActive: {
    color: '#ffffff',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#38383a',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#1c1c1e',
    color: '#ffffff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0a84ff',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff453a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#48484a',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default LoginScreen;