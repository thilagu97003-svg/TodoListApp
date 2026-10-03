import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ovvoru category-kum specific colors
const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  Home: { border: '#6366F1', bg: '#EEF2FF', text: '#4F46E5' },
  Bills: { border: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
  Health: { border: '#B91C1C', bg: '#FFE4E6', text: '#9F1239' },
  Finance: { border: '#0D9488', bg: '#CCFBF1', text: '#0F766E' },
  Events: { border: '#EC4899', bg: '#FCE7F3', text: '#BE185D' },
  Travel: { border: '#06B6D4', bg: '#CFFAFE', text: '#0E7490' },
  Work: { border: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8' },
  Study: { border: '#10B981', bg: '#D1FAE5', text: '#047857' },
  Personal: { border: '#8B5CF6', bg: '#EDE9FE', text: '#6D28D9' },
};

export default function CompletedTab({ 
  completedTasks, 
  tasks, 
  onToggleTask, 
  onDeleteTask, 
  onClearHistory 
}: any) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const displayTasks = completedTasks || tasks || [];

  const renderItem = ({ item }: { item: any }) => {
    const isHovered = hoveredId === item.id;
    const subtasksDone = item.subtasks ? item.subtasks.filter((st: any) => st.completed).length : 0;
    const totalSubtasks = item.subtasks ? item.subtasks.length : 0;

    // Category color scheme edukkirom
    const theme = (item.category && CATEGORY_COLORS[item.category]) || {
      border: '#10B981',
      bg: '#DCFCE7',
      text: '#15803D',
    };

    return (
      <View
        // @ts-ignore - Web hover events
        onMouseEnter={() => setHoveredId(item.id)}
        onMouseLeave={() => setHoveredId(null)}
        style={[
          styles.taskCard,
          isHovered && styles.taskCardHovered,
        ]}
      >
        {/* Category Specific Left Accent Line */}
        <View style={[styles.accentBorder, { backgroundColor: theme.border }]} />

        <View style={styles.cardMain}>
         {/* Completed Green Badge */}
<View style={{ marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
</View>
          {/* Details Section */}
          <View style={styles.detailsContainer}>
            {/* Normal Text (No strike-through) */}
            <Text style={styles.taskTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.metadataRow}>
              {/* Category Badge with custom color */}
              {item.category && (
                <View style={[styles.categoryBadge, { backgroundColor: theme.bg }]}>
                  <Text style={[styles.categoryText, { color: theme.text }]}>
                    {item.category}
                  </Text>
                </View>
              )}

              {/* Subtasks Badge */}
              {totalSubtasks > 0 && (
                <View style={styles.subtaskBadge}>
                  <Ionicons name="checkmark-done" size={13} color="#16A34A" />
                  <Text style={styles.subtaskBadgeText}>
                    {subtasksDone}/{totalSubtasks} subtasks
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.dateText}>
              Completed on: {item.completedDate || 'Today'}
            </Text>
          </View>

          {/* Delete Single Task Button */}
          {onDeleteTask && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteTask(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Main Screen Title */}
      <Text 
  style={{ 
    fontFamily: 'Lexend_700Bold', // alladhu Lexend_600SemiBold
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1E293B', 
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6 
  }}
>
  Completed Tasks
</Text>

      {/* 2. Subtitle with Count & Clear History */}
      {displayTasks.length > 0 && (
        <View style={styles.headerBar}>
          <Text style={styles.headerSubtitle}>
            {displayTasks.length} {displayTasks.length === 1 ? 'task' : 'tasks'} finished
          </Text>
          {onClearHistory && (
            <TouchableOpacity style={styles.clearBtn} onPress={onClearHistory}>
              <Ionicons name="trash-bin-outline" size={15} color="#EF4444" />
              <Text style={styles.clearBtnText}>Clear History</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={displayTasks}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyText}>No completed tasks yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    // @ts-ignore
    transitionDuration: '0.2s',
  },
  taskCardHovered: {
    // @ts-ignore
    transform: [{ translateY: -3 }],
    shadowOpacity: 0.12,
    shadowRadius: 14,
    borderColor: '#CBD5E1',
  },
  accentBorder: {
    width: 6,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  taskTitle: {
  fontFamily: 'Lexend_600SemiBold', // <--- idha add pannunga
  fontSize: 15,
  fontWeight: '600',
  color: '#0F172A',
  lineHeight: 20,
},
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subtaskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#94A3B8',
  },
});