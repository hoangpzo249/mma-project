import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchChaptersByStoryId } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChapterList({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVipUser, setIsVipUser] = useState(false);

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

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        if (userInfoStr) {
           const userInfo = JSON.parse(userInfoStr);
           setIsVipUser(userInfo.isVip || false);
        }
        
        const data = await fetchChaptersByStoryId(storyId);
        if (data) {
          // Sort chapters mostly latest or lowest
          const sortedData = data.sort((a: any, b: any) => b.chapterNumber - a.chapterNumber); // descending order
          setChapters(sortedData);
        }
      } catch (error) {
        console.error("Error loading chapters:", error);
      } finally {
        setLoading(false);
      }
    };
    if (storyId) loadChapters();
  }, [storyId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  }

  if (chapters.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No chapters available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <Text style={styles.sectionTitle}>Chapters</Text>
          <Text style={styles.countText}>{chapters.length} total</Text>
        </View>
        <TouchableOpacity>
           <Ionicons name="filter" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {chapters.map((chapter) => {
        // Evaluate locked state visually
        const isLocked = chapter.isVip && !isVipUser;
        return (
          <TouchableOpacity 
            key={chapter._id} 
            style={styles.chapterItem}
            onPress={() => router.push(`/chapter/${chapter._id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.chapterInfo}>
              <Text style={[styles.chapterTitle, isLocked && styles.lockedText]} numberOfLines={1}>
                Chapter {chapter.chapterNumber}: {chapter.title}
              </Text>
              <Text style={styles.chapterDate}>
                {formatTime(chapter.updatedAt)}
              </Text>
            </View>

            <View style={styles.rightSection}>
               {chapter.isVip && (
                 <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>VIP</Text>
                 </View>
               )}
               <Ionicons 
                 name={isLocked ? "lock-closed" : "chevron-forward"} 
                 size={20} 
                 color={isLocked ? "#fbbf24" : "#475569"} 
               />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0b162c',
  },
  centerContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  countText: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 2,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  chapterInfo: {
    flex: 1,
    paddingRight: 15,
  },
  chapterTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  lockedText: {
    color: '#94a3b8',
  },
  chapterDate: {
    color: '#64748b',
    fontSize: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vipBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  vipText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '800',
  }
});