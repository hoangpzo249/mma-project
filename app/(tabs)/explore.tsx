import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchStories, searchStories } from '@/services/api';

const { width } = Dimensions.get('window');
const numColumns = 2; // 2 items per row
const itemWidth = (width - 40 - (numColumns - 1) * 15) / numColumns;

export default function ExploreScreen() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<'A-Z' | 'views'>('views');

  // Lazy loading states
  const [displayedStories, setDisplayedStories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (debouncedQuery.trim()) {
          data = await searchStories(debouncedQuery);
        } else {
          data = await fetchStories();
        }
        setStories(data);
        setPage(1); // Reset page on new data
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [debouncedQuery]);

  useEffect(() => {
    const sortedStories = [...stories].sort((a, b) => {
      if (sortBy === 'A-Z') {
        return (a.title || '').localeCompare(b.title || '');
      } else {
        return (b.views || 0) - (a.views || 0);
      }
    });

    setDisplayedStories(sortedStories.slice(0, page * ITEMS_PER_PAGE));
  }, [stories, sortBy, page]);

  const loadMoreData = () => {
    if (displayedStories.length < stories.length) {
      setPage(prev => prev + 1);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => item._id && router.push(/story/ + item._id as any)}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      {item.latestChapter && (
        <TouchableOpacity
          onPress={(e) => {
             e.stopPropagation();
             router.push(/chapter/ + item.latestChapter._id as any);
          }}
        >
          <Text style={styles.latestChapterText} numberOfLines={1}>
            Latest: Chapter {item.latestChapter.chapterNumber}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search manga..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter / Sort Row */}
      <View style={styles.filterRow}>
        <Text style={styles.resultCount}>
          <Text style={{ fontWeight: 'bold', color: 'white' }}>{stories.length}</Text> mangas
        </Text>
        <View style={styles.sortContainer}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'views' && styles.activeSortBtn]}
            onPress={() => setSortBy('views')}
          >
            <Text style={[styles.sortText, sortBy === 'views' && styles.activeSortText]}>Popular</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'A-Z' && styles.activeSortBtn]}
            onPress={() => setSortBy('A-Z')}
          >
            <Text style={[styles.sortText, sortBy === 'A-Z' && styles.activeSortText]}>A-Z</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : (
        <FlatList
          data={displayedStories}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No mangas found.</Text>
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
             displayedStories.length < stories.length ? (
               <ActivityIndicator size="small" color="#0ea5e9" style={{ marginVertical: 20 }} />
             ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0b162c' },
  header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10, backgroundColor: '#0f172a' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 25, paddingHorizontal: 15, height: 45 },
  searchInput: { flex: 1, color: 'white', fontSize: 15, marginLeft: 10 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  resultCount: { color: '#94a3b8', fontSize: 14 },
  sortContainer: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 15, overflow: 'hidden' },
  sortBtn: { paddingHorizontal: 15, paddingVertical: 8 },
  activeSortBtn: { backgroundColor: '#0ea5e9' },
  sortText: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold' },
  activeSortText: { color: 'white' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 15 },
  card: { width: itemWidth },
  thumbnail: { width: itemWidth, height: itemWidth * 1.4, borderRadius: 8, marginBottom: 8 },
  imagePlaceholder: { width: itemWidth, height: itemWidth * 1.4, backgroundColor: '#475569', borderRadius: 8, marginBottom: 8 },
  title: { color: '#f8fafc', fontSize: 14, fontWeight: '600' },
  latestChapterText: { color: '#3b82f6', fontSize: 12, marginTop: 4, fontWeight: '500' },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 50, fontSize: 15 }
});
