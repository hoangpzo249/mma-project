import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReadingHistory, deleteReadingHistory } from '@/services/api';

export default function HistoryScreen() {
  const router = useRouter();
  
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        setLoading(true);
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          
          if (userToken) {
            setIsLoggedIn(true);
            const serverHistory = await getReadingHistory();
            
            // Map SERVER format to match our local format to retain same UI
            const formattedHistory = serverHistory.map((item: any) => ({
              storyId: item.storyId?._id || item.storyId,
              storyTitle: item.storyId?.title,
              storyThumbnail: item.storyId?.thumbnail,
              chapterId: item.lastChapterId?._id,
              chapterNumber: item.lastChapterId?.chapterNumber,
              chapterTitle: item.lastChapterId?.title || item.lastChapterId?.chapterTitle,
              readAt: item.updatedAt
            }));
            
            setHistoryList(formattedHistory);
          } else {
            setIsLoggedIn(false);
            const historyStr = await AsyncStorage.getItem('@reading_history');
            if (historyStr) {
              setHistoryList(JSON.parse(historyStr));
            } else {
              setHistoryList([]);
            }
          }
        } catch (e) {
          console.error("Error loading history", e);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }, [])
  );

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };

  const removeHistoryItem = async (storyId: string) => {
    try {
      const updatedList = historyList.filter(item => item.storyId !== storyId);
      setHistoryList(updatedList);
      
      if (isLoggedIn) {
        await deleteReadingHistory(storyId);
      } else {
        await AsyncStorage.setItem('@reading_history', JSON.stringify(updatedList));
      }
    } catch (e) {
      console.error("Fail to remove history", e);
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.historyCard}
      onPress={() => router.push(`/chapter/${item.chapterId}` as any)}
      activeOpacity={0.8}
    >
      {item.storyThumbnail ? (
        <Image source={{ uri: item.storyThumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={styles.placeholderThumb} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.storyTitle} numberOfLines={2}>{item.storyTitle}</Text>
        <Text style={styles.chapterText} numberOfLines={1}>
          {item.chapterTitle || `Chapter ${item.chapterNumber}`}
        </Text>
        <Text style={styles.readAtText}>Read: {formatTime(item.readAt)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => removeHistoryItem(item.storyId)}
      >
        <Ionicons name="trash-outline" size={20} color="#64748b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reading History</Text>
        <Text style={styles.headerSubtitle}>{historyList.length} items</Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={(item, index) => item.storyId + '-' + index.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={60} color="#475569" />
              <Text style={styles.emptyText}>Your reading history is empty.</Text>
              <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/explore')}>
                <Text style={styles.browseButtonText}>Browse Manga</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b162c' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 15, 
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    alignItems: 'center'
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#64748b', fontSize: 13, marginTop: 4 },
  listContainer: { flexGrow: 1, padding: 15, paddingBottom: 30 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    alignItems: 'center'
  },
  thumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  placeholderThumb: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#334155'
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center'
  },
  storyTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  chapterText: {
    color: '#0ea5e9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  readAtText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 25,
  },
  browseButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
