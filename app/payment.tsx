import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { upgradeToVip } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await upgradeToVip();
      Alert.alert('Success', 'You are now a VIP member!', [
        { 
          text: 'OK', 
          onPress: async () => {
            const userInfoStr = await AsyncStorage.getItem('userInfo');
            if (userInfoStr) {
               const userInfo = JSON.parse(userInfoStr);
               userInfo.isVip = true;
               await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
            }
            router.back();
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: 'book', text: 'Read latest premium chapters' },
    { icon: 'shield-checkmark', text: 'No ads or interruptions' },
  ];      

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b162c" />
      
      {/* Header */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Unlock Premium</Text>
         <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Glow & Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.glow} />
          <Ionicons name="diamond" size={90} color="#fbbf24" style={styles.icon} />
        </View>

        <Text style={styles.title}>VIP Access</Text>
        <Text style={styles.description}>
          Elevate your manga reading experience with exclusive features and unlimited access.
        </Text>

        {/* Pricing Card */}
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.15)', 'rgba(245, 158, 11, 0.05)']}
          style={styles.priceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.priceLabel}>Monthly Plan</Text>
          <Text style={styles.priceValue}>$2.00<Text style={styles.priceSuffix}> / month</Text></Text>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {benefits.map((item, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={18} color="#fbbf24" />
              </View>
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.buttonWrapper} 
          onPress={handlePayment} 
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#fbbf24', '#f59e0b']}
            style={styles.paymentButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.paymentButtonText}>Upgrade Now</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b162c',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 60,
    transform: [{ scale: 1.2 }],
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 10,
  },
  icon: {
    zIndex: 2,
    textShadowColor: 'rgba(251, 191, 36, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  priceCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    marginBottom: 30,
  },
  priceLabel: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  priceSuffix: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  benefitsContainer: {
    width: '100%',
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 20,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  paymentButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});