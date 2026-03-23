import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions, StatusBar, Alert, Modal, FlatList, TouchableWithoutFeedback, Image as RNImage } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchChapterContent, fetchChaptersByStoryId, syncReadingHistory } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AutoHeightImage = ({ uri }: { uri: string }) => {
  const [imgHeight, setImgHeight] = useState(width * 1.5);

  useEffect(() => {
    if (uri) {
      RNImage.getSize(uri, (imgW, imgH) => {
        if (imgW > 0) {
          setImgHeight(width * (imgH / imgW));
        }
      }, () => {});
    }
  }, [uri]);

  return (
    <Image 
      source={uri} 
      style={{ width: width, height: imgHeight }} 
      contentFit='fill'
      cachePolicy='disk'
    />
  );
};

export default function ChapterRead() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [chapter, setChapter] = useState<any>(null);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showChapterModal, setShowChapterModal] = useState(false);

  // Constants for theme
  const bg = '#000000';
  const text = '#e2e8f0';
  const controlBg = 'rgba(15, 23, 42, 0.95)';
  const iconCol = '#ffffff';

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      try {
        const data = await fetchChapterContent(id as string);
        setChapter(data);

        // Save to Local History
        try {
          if (data && data.story) {
            const historyStr = await AsyncStorage.getItem('@reading_history');
            let historyList = historyStr ? JSON.parse(historyStr) : [];
            
            // Remove if this story already exists in history
            historyList = historyList.filter((item: any) => item.storyId !== data.storyId);
            
            // Add current chapter to top of history
            historyList.unshift({
                storyId: data.storyId,
                storyTitle: data.story.title,
                storyThumbnail: data.story.thumbnail,
                chapterId: data._id,
                chapterNumber: data.chapterNumber,
                chapterTitle: data.title,
                readAt: new Date().toISOString()
            });
            
            // Limit to 100 history items to prevent enormous storage
            if(historyList.length > 100) historyList = historyList.slice(0, 100);
            
            await AsyncStorage.setItem('@reading_history', JSON.stringify(historyList));

            // Sync with Server if Logged In
            syncReadingHistory(data.storyId, data._id);
          }
        } catch (storageError) {
          console.log('Error saving reading history locally', storageError);
        }

        if (data?.storyId) {
          const chaptersData = await fetchChaptersByStoryId(data.storyId);
          const sorted = [...chaptersData].sort((a, b) => a.chapterNumber - b.chapterNumber);
          setAllChapters(sorted);
        }
      } catch (error: any) {
        if (!error.requiresVip) { console.warn(error); }
        if (error.requiresVip) {
          if (error.status === 403) {
            Alert.alert(
              'VIP Required',
              'You need to upgrade to VIP for $2/month to read this chapter.',
              [
                { text: 'Back', style: 'cancel', onPress: () => router.back() },
                { text: 'Unlock VIP', onPress: () => router.push('/payment') }
              ]
            );
          } else {
            Alert.alert(
              'Login Required',
              'You need to login to read this VIP chapter.',
              [
                { text: 'Back', style: 'cancel', onPress: () => router.back() },
                { text: 'Login', onPress: () => router.push('/login') }
              ]
            );
          }
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadChapter();
      const timeout = setTimeout(() => setShowControls(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [id]);

  const handleToggleControls = () => {
    setShowControls(!showControls);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bg }]}>
        <ActivityIndicator size='large' color='#0ea5e9' />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: bg }]}>
        <Text style={[styles.errorText, { color: text }]}>Chapter content not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentIndex = allChapters.findIndex(c => c._id === chapter._id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const navigateToChapter = (chapterId: string) => {
    setShowChapterModal(false);
    setLoading(true);
    router.replace(`/chapter/${chapterId}` as any);
  };

  const renderContent = () => {
    return (
       <>
         <View style={{ flex: 1, backgroundColor: bg }}>
            <TouchableWithoutFeedback onPress={handleToggleControls}>
               <View style={StyleSheet.absoluteFillObject} />
            </TouchableWithoutFeedback>
            {chapter.content && chapter.content.length > 0 ? (
              <FlatList
                 data={chapter.content}
                 keyExtractor={(item, index) => `img-${index}`}
                 renderItem={({ item }) => (
                    <TouchableWithoutFeedback onPress={handleToggleControls}>
                       <View>
                          <AutoHeightImage uri={item} />
                       </View>
                    </TouchableWithoutFeedback>
                 )}
                 showsVerticalScrollIndicator={false}
                 bounces={false}
                 ListFooterComponent={() => (
                   <View style={styles.endOfChapter}>
                      <Text style={{color: '#64748b', marginBottom: 20}}>End of Chapter</Text>
                      <View style={styles.bottomNavButtons}>
                        <TouchableOpacity 
                          style={[styles.navBtn, !prevChapter && styles.disabledNavBtn]}
                          onPress={() => prevChapter && navigateToChapter(prevChapter._id)}
                          disabled={!prevChapter}
                        >
                          <Ionicons name='chevron-back' size={20} color={!prevChapter ? '#475569' : iconCol} />
                          <Text style={[styles.navBtnText, !prevChapter && styles.disabledText, { color: !prevChapter ? '#475569' : iconCol }]}>Previous</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.navBtn, !nextChapter && styles.disabledNavBtn]}
                          onPress={() => nextChapter && navigateToChapter(nextChapter._id)}
                          disabled={!nextChapter}
                        >
                          <Text style={[styles.navBtnText, !nextChapter && styles.disabledText, { color: !nextChapter ? '#475569' : iconCol }]}>Next</Text>
                          <Ionicons name='chevron-forward' size={20} color={!nextChapter ? '#475569' : iconCol} />
                        </TouchableOpacity>
                      </View>
                   </View>
                 )}
              />
            ) : (
              <Text style={[styles.bodyText, { fontSize: 16, color: text, textAlign: 'center', marginTop: 50 }]}>
                Content has not been updated yet...
              </Text>
            )}
         </View>
       </>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle='light-content' backgroundColor={showControls ? controlBg : 'transparent'} translucent={true} />
      
      {showControls && (
        <View style={[styles.header, { backgroundColor: controlBg }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(`/story/${chapter.storyId}` as any)}>
            <Ionicons name='arrow-back' size={24} color={iconCol} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={[styles.headerTitle, { color: text }]} numberOfLines={1}>
              Chapter {chapter.chapterNumber}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{chapter.title || ''}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      )}

      {renderContent()}

      {showControls && (
        <View style={[styles.footer, { backgroundColor: controlBg }]}>
           <TouchableOpacity 
              style={[styles.footerBtn, !prevChapter && { opacity: 0.3 }]}
              onPress={() => prevChapter && navigateToChapter(prevChapter._id)}
              disabled={!prevChapter}
           >
              <Ionicons name='play-skip-back' size={22} color={iconCol} />
              <Text style={styles.footerBtnText}>Prev</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              style={styles.chapterMenuBtn}
              onPress={() => setShowChapterModal(true)}
           >
              <Ionicons name='list' size={20} color={iconCol} style={{marginRight: 6}} />
              <Text style={[styles.progressText, { color: text }]}>
                 Ch. {chapter.chapterNumber} / {allChapters.length}
              </Text>
           </TouchableOpacity>

           <TouchableOpacity 
              style={[styles.footerBtn, !nextChapter && { opacity: 0.3 }]}
              onPress={() => nextChapter && navigateToChapter(nextChapter._id)}
              disabled={!nextChapter}
           >
              <Ionicons name='play-skip-forward' size={22} color={iconCol} />
              <Text style={styles.footerBtnText}>Next</Text>
           </TouchableOpacity>
        </View>
      )}

      <Modal visible={showChapterModal} transparent animationType='slide'>
         <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowChapterModal(false)}
         >
            <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Chapters ({allChapters.length})</Text>
                 <TouchableOpacity onPress={() => setShowChapterModal(false)}>
                    <Ionicons name='close-circle' size={26} color='#94a3b8' />
                 </TouchableOpacity>
               </View>
               <FlatList
                 data={allChapters}
                 keyExtractor={(item) => item._id}
                 contentContainerStyle={{ padding: 10, paddingBottom: 40 }}
                 renderItem={({ item }) => {
                    const isCurrent = item._id === chapter._id;
                    return (
                       <TouchableOpacity 
                          style={[styles.chapterItem, isCurrent && styles.chapterItemActive]}
                          onPress={() => {
                             if (!isCurrent) navigateToChapter(item._id);
                             else setShowChapterModal(false);
                          }}
                       >
                          <Text style={[styles.chapterItemText, isCurrent && { color: '#0ea5e9', fontWeight: 'bold' }]}>
                             Chapter {item.chapterNumber}: {item.title || ''}
                          </Text>
                          {item.isVip && (
                            <View style={styles.vipBadge}>
                                <Text style={styles.vipText}>VIP</Text>
                            </View>
                          )}
                       </TouchableOpacity>
                    );
                 }}
               />
            </View>
            </TouchableWithoutFeedback>
         </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#0ea5e9', borderRadius: 20 },
  backBtnText: { color: 'white', fontWeight: 'bold' },
  
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50, paddingBottom: 15,
    zIndex: 50, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  iconBtn: { padding: 8 },
  headerTitleBox: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  
  endOfChapter: {
    paddingVertical: 50,
    alignItems: 'center',
    backgroundColor: '#000000'
  },
  bodyText: { lineHeight: 32 },
  
  bottomNavButtons: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 10, gap: 15, width: '100%', maxWidth: 350
  },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 30, backgroundColor: '#1e293b', gap: 6, borderWidth: 1, borderColor: '#334155'
  },
  disabledNavBtn: { opacity: 0.5 },
  navBtnText: { fontSize: 14, fontWeight: '600' },
  disabledText: { color: '#475569' },
  
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 15, paddingBottom: 35,
    zIndex: 50, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)'
  },
  footerBtn: {
     alignItems: 'center',
     justifyContent: 'center',
     paddingHorizontal: 10,
  },
  footerBtnText: {
     color: '#cbd5e1',
     fontSize: 11,
     marginTop: 4,
     fontWeight: '500'
  },
  chapterMenuBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: '#334155'
  },
  progressText: { fontSize: 14, fontWeight: '700' },
  
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    height: height * 0.65,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b'
  },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  chapterItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 15, borderBottomWidth: 1, borderBottomColor: '#1e293b'
  },
  chapterItemActive: { backgroundColor: 'rgba(14, 165, 233, 0.1)' },
  chapterItemText: { color: '#cbd5e1', fontSize: 15, flex: 1 },
  vipBadge: { backgroundColor: 'rgba(251, 191, 36, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.3)' },
  vipText: { color: '#fbbf24', fontSize: 10, fontWeight: '800' }
});