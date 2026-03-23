import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loginUser } from '@/services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    
    setLoading(true);
    try {
      const data = await loginUser(username, password);
      // Success, you would save data.token to SecureStore or AsyncStorage here
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Sai tài khoản hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0b162c" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng nhập</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.logoText}>MANGA<Text style={styles.logoLight}>CLOUD</Text></Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b162c' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoText: {
    color: '#ff3366',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
    marginBottom: 40,
  },
  logoLight: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: { color: '#94a3b8', fontSize: 14 },
  registerText: { color: '#0ea5e9', fontSize: 14, fontWeight: 'bold' }
});
