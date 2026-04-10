import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import api from '../config/api';

interface RegisterScreenProps {
  navigation: any;
}

interface FormData {
  nationalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female';
  password: string;
  confirmPassword: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [form, setForm] = useState<FormData>({
    nationalId: '', firstName: '', lastName: '', email: '', phone: '', dob: '',
    gender: 'male', password: '', confirmPassword: '',
  });
  const [counties, setCounties] = useState<{id: string; name: string}[]>([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    if (!form.nationalId || !form.firstName || !form.lastName || !form.email ||
        !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.registerVoter({
        nationalId: form.nationalId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        county: selectedCounty,
        password: form.password,
      });
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.replace('Login') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const Input = ({ label, field, secure }: { label: string; field: keyof FormData; secure?: boolean }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} *</Text>
      <TextInput
        style={styles.input}
        value={form[field]}
        onChangeText={(v) => updateField(field, v)}
        secureTextEntry={secure}
        keyboardType={field === 'phone' ? 'phone-pad' : field === 'email' ? 'email-address' : 'default'}
        placeholder={label}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Register to Vote</Text>
        <Text style={styles.subtitle}>Enter your details to create an account</Text>

        <Input label="National ID" field="nationalId" />
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input label="First Name" field="firstName" />
          </View>
          <View style={styles.halfInput}>
            <Input label="Last Name" field="lastName" />
          </View>
        </View>
        <Input label="Email" field="email" />
        <Input label="Phone" field="phone" />
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={form.dob}
            onChangeText={(v) => updateField('dob', v)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, form.gender === 'male' && styles.genderActive]}
              onPress={() => updateField('gender', 'male')}
            >
              <Text style={[styles.genderText, form.gender === 'male' && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, form.gender === 'female' && styles.genderActive]}
              onPress={() => updateField('gender', 'female')}
            >
              <Text style={[styles.genderText, form.gender === 'female' && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Input label="Password" field="password" secure />
        <Input label="Confirm Password" field="confirmPassword" secure />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.replace('Login')}>
          <Text style={styles.loginLinkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a', marginTop: 20 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 16, fontSize: 16, backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row', marginHorizontal: -8 },
  halfInput: { flex: 1, paddingHorizontal: 8 },
  genderRow: { flexDirection: 'row' },
  genderBtn: {
    flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8,
    backgroundColor: '#f0f0f0', marginHorizontal: 4,
  },
  genderActive: { backgroundColor: '#c0392b' },
  genderText: { fontSize: 14, color: '#666', fontWeight: '600' },
  genderTextActive: { color: '#fff' },
  button: {
    height: 50, backgroundColor: '#c0392b', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', marginTop: 24,
  },
  buttonDisabled: { backgroundColor: '#a0a0a0' },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  loginLink: { alignItems: 'center', marginTop: 16, marginBottom: 40 },
  loginLinkText: { fontSize: 14, color: '#c0392b', fontWeight: '500' },
});

export default RegisterScreen;