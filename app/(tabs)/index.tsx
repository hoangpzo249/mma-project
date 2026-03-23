import { Platform, StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useRef, useCallback } from 'react';

import FeaturedSection from '@/components/Home/FeaturedSection';
import LatestUpdates from '@/components/Home/LatestUpdates';
import PopularRank from '@/components/Home/PopularRank';
import { fetchHotStories, fetchRandomStories, getUserData } from '@/services/api';

const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 70; // Adjust for iOS notch safely

export default function HomeScreen() {
  const router = useRouter();
  const [hotStories, setHotStories] = useState([]);
  const [randomStories, setRandomStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const checkUser = async () => {
        const userData = await getUserData();
        setUser(userData);
      };
      checkUser();
    }, [])
  );

  // Simple state instead of complex Animated that might hide under safe area
  const scrollY = useRef(new Animated.Value(0)).current;

  // Use simple interpolation without diffClamp which can be buggy on some React Native versions
  const translateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hotStoriesData, randomData] = await Promise.all([ fetchHotStories(), fetchRandomStories() ]);
        setHotStories(hotStoriesData);
        setRandomStories(randomData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { transform: [{ translateY }] }]}>
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <Text style={styles.logoText}>MANGA<Text style={styles.logoLight}>CLOUD</Text></Text>
            <View style={styles.headerIcons}>
              {user && !user.isVip && (
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/payment')}>
                  <Ionicons name="diamond" size={24} color="#fbbf24" style={{ marginRight: 8 }} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="bookmark-outline" size={24} color="white" />
              </TouchableOpacity>
              {user ? (
                <TouchableOpacity style={styles.userIconBtn} onPress={() => router.push('/profile')}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.userIconBtn} onPress={() => router.push('/login')}>
                  <Ionicons name="person-outline" size={18} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <FeaturedSection randomStories={randomStories} />
        <LatestUpdates />
        <PopularRank hotStories={hotStories} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0b162c',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    zIndex: 9999, // Ensure it is on top
    elevation: 100, // Android shadow/z-index
    height: HEADER_HEIGHT,
  },
  headerSafeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Fix vertical alignment to center 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Padding for Android status bar without notch
  },
  logoText: {
    color: '#ff3366',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoLight: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconBtn: {
    padding: 5,
  },
  userIconBtn: {
    backgroundColor: '#0ea5e9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b162c',
  }
});

