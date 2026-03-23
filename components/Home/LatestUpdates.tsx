import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchRecentUpdates } from '@/services/api';

const LatestUpdates = () => {
  const router = useRouter();
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpdates = async () => {
      const data = await fetchRecentUpdates();
      setUpdates(data);
      setLoading(false);
    };
    loadUpdates();
  }, []);

  // Helper to format date easily
  const formatTime = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const MathFloor = Math.floor;
    const diffInSeconds = MathFloor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const minutes = MathFloor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = MathFloor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = MathFloor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    const months = MathFloor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    
    const years = MathFloor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 200 }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.blueBar} />
          <Text style={styles.title}>Latest Updates</Text>
        </View>
        <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/explore')}>
          <Text style={styles.viewAll}>VIEW ALL </Text>
          <Ionicons name="caret-forward" size={12} color="#cbd5e1" />
        </TouchableOpacity>
      </View>

      {updates.map((item, idx) => (
        <View key={idx} style={styles.itemContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => item._id && router.push(`/story/${item._id}` as any)}
          >
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </TouchableOpacity>
          <View style={styles.info}>
            <TouchableOpacity onPress={() => item._id && router.push(`/story/${item._id}` as any)}>
              <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            </TouchableOpacity>
            
            <View style={styles.chaptersContainer}>
              {item.latestChapters && item.latestChapters.map((chap: any, i: number) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.chapterRow}
                  onPress={() => router.push(`/chapter/${chap._id}` as any)}
                >
                  <Text style={styles.chapterText}>{chap.title || chap.chapterTitle || `Chapter ${chap.chapterNumber}`}</Text>
                  <Text style={styles.timeText}>{formatTime(chap.updatedAt)}</Text>
                </TouchableOpacity>
              ))}

              {(!item.latestChapters || item.latestChapters.length === 0) && (
                 <Text style={styles.timeText}>Updating new chapters...</Text>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    marginHorizontal: 10,
    marginTop: -20, // overlapping a bit
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  blueBar: {
    width: 6,
    height: 24,
    backgroundColor: '#0ea5e9',
    borderRadius: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  viewAll: {
    color: '#cbd5e1',
    fontWeight: 'bold',
    fontSize: 12,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  imageWrapper: {
    marginRight: 15,
  },
  thumbnail: {
    width: 100,
    height: 140,
    borderRadius: 15,
  },
  imagePlaceholder: {
    width: 100,
    height: 140,
    backgroundColor: '#475569',
    borderRadius: 15,
  },
  info: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  itemTitle: {
    color: '#3b82f6', // Lighter, more vibrant blue
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chaptersContainer: {
    marginTop: 8,
    gap: 4,
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 2,
  },
  chapterText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 12,
  }
});

export default LatestUpdates;
