import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Text, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchStoryById, fetchChaptersByStoryId } from '@/services/api';
import StoryHeader from '@/components/Story/StoryHeader';
import StoryInfo from '@/components/Story/StoryInfo';
import ChapterList from '@/components/Story/ChapterList';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StoryDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [firstChapterId, setFirstChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const storyData = await fetchStoryById(id as string);
        setStory(storyData);
        
        const chaptersData = await fetchChaptersByStoryId(id as string);
        if (chaptersData && chaptersData.length > 0) {
          const sorted = [...chaptersData].sort((a, b) => a.chapterNumber - b.chapterNumber);
          setFirstChapterId(sorted[0]._id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) loadDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b162c" />
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0b162c" />
        <Ionicons name="book-outline" size={64} color="#334155" style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <StoryHeader story={story} />
        
        <View style={styles.bodyContainer}>
            <StoryInfo story={story} />
            <View style={styles.divider} />
            <ChapterList storyId={id as string} />
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBarWrapper}>
        <LinearGradient
            colors={['transparent', 'rgba(11,22,44,0.95)', '#0b162c']}
            style={styles.fadeGradient}
        />
        <View style={styles.bottomBar}>
            <TouchableOpacity 
            style={styles.bookmarkBtn} 
            onPress={() => alert('Added to Library')}
            activeOpacity={0.7}
            >
            <Ionicons name="bookmark" size={24} color="#0ea5e9" />
            </TouchableOpacity>

            <TouchableOpacity
            style={[styles.readNowBtnWrapper, !firstChapterId && styles.disabledBtnWrapper]}
            onPress={() => firstChapterId && router.push(`/chapter/${firstChapterId}` as any)}
            disabled={!firstChapterId}
            activeOpacity={0.8}
            >
            <LinearGradient
                colors={firstChapterId ? ['#0ea5e9', '#0284c7'] : ['#475569', '#334155']}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
                <Ionicons name="book" size={20} color="white" />
                <Text style={styles.readNowText}>
                {firstChapterId ? 'Read First Chapter' : 'No Chapters Yet'}
                </Text>
            </LinearGradient>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b162c',
  },
  scrollContent: {
    paddingBottom: 120, // Space for the floating bottom bar
  },
  bodyContainer: {
    backgroundColor: '#0b162c',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b162c',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b162c',
  },
  errorText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 20,
  },
  backBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    justifyContent: 'flex-end',
  },
  fadeGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30, // Safe area assuming iOS / standard Android padding
    paddingTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  bookmarkBtn: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  readNowBtnWrapper: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtnWrapper: {
    shadowOpacity: 0,
    elevation: 0,
  },
  readNowText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});