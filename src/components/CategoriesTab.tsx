import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoriesTabProps {
  categories: string[];
  tasks: any[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onNavigateToTasks?: () => void;
}

// Rich Vibrant Colors: Background tint, Solid Border & Icon Colors
const CATEGORY_META: Record<string, { icon: any; iconBg: string; color: string; border: string; cardBg: string }> = {
  Work: { icon: 'briefcase', iconBg: '#DBEAFE', color: '#1D4ED8', border: '#3B82F6', cardBg: '#EFF6FF' },
  Personal: { icon: 'person', iconBg: '#EDE9FE', color: '#6D28D9', border: '#8B5CF6', cardBg: '#F5F3FF' },
  Study: { icon: 'book', iconBg: '#D1FAE5', color: '#047857', border: '#10B981', cardBg: '#ECFDF5' },
  Shopping: { icon: 'cart', iconBg: '#FEF3C7', color: '#B45309', border: '#F59E0B', cardBg: '#FFFBEB' },
  Health: { icon: 'heart', iconBg: '#FFE4E6', color: '#BE123C', border: '#F43F5E', cardBg: '#FFF1F2' },
  Travel: { icon: 'airplane', iconBg: '#CFFAFE', color: '#0E7490', border: '#06B6D4', cardBg: '#ECFEFF' },
  Finance: { icon: 'wallet', iconBg: '#CCFBF1', color: '#0F766E', border: '#14B8A6', cardBg: '#F0FDFA' },
  Home: { icon: 'home', iconBg: '#E0E7FF', color: '#4338CA', border: '#6366F1', cardBg: '#EEF2FF' },
  Bills: { icon: 'receipt', iconBg: '#FEE2E2', color: '#B91C1C', border: '#EF4444', cardBg: '#FEF2F2' },
  Events: { icon: 'sparkles', iconBg: '#FCE7F3', color: '#BE185D', border: '#EC4899', cardBg: '#FDF2F8' },
};

export default function CategoriesTab({
  categories = [],
  tasks = [],
  selectedCategory,
  onSelectCategory,
  onNavigateToTasks,
}: CategoriesTabProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const displayCategories = categories.filter((c) => c !== 'All');

  const handleCardPress = (category: string) => {
    onSelectCategory(category);
    if (onNavigateToTasks) {
      onNavigateToTasks();
    }
  };

  return (
   <ScrollView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      contentContainerStyle={{
        paddingTop: 16,
        paddingBottom: 120,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <Text style={styles.screenTitle}>Categories</Text>
      <Text style={styles.screenSubtitle}>Organize and track progress by domain</Text>

      <View style={styles.grid}>
        {displayCategories.map((category) => {
          const meta = CATEGORY_META[category] || {
            icon: 'folder',
            iconBg: '#E2E8F0',
            color: '#334155',
            border: '#64748B',
            cardBg: '#F8FAFC',
          };

          const isSelected = selectedCategory === category;
          const isHovered = hoveredCard === category;

          // Task count & completion progress
         const categoryTasks = tasks.filter((t) => t.category === category);
const totalTasks = categoryTasks.length;

// Subtasks count-aiyum serthu accurate-ah calculate panna:
let totalPoints = 0;
let earnedPoints = 0;

categoryTasks.forEach((t) => {
  if (t.subtasks && t.subtasks.length > 0) {
    totalPoints += t.subtasks.length;
    earnedPoints += t.subtasks.filter((st: any) => st.completed).length;
  } else {
    totalPoints += 1;
    if (t.completed) earnedPoints += 1;
  }
});

const progressPercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
          return (
            <View
          key={category}
          style={{
            width: '48%',
          }}
        >
            
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleCardPress(category)}
                style={[
                  styles.card,
                  {
                    backgroundColor: meta.cardBg,
                    borderColor: meta.border,
                    borderWidth: isSelected ? 2.5 : 1.8,
                    shadowColor: meta.border,
                    shadowOpacity: isHovered || isSelected ? 0.28 : 0.08,
                    shadowRadius: isHovered || isSelected ? 12 : 5,
                    elevation: isSelected ? 4 : 2,
                  },
                ]}
              >
                {/* Active Category Badge */}
                {isSelected && (
                  <View style={[styles.activeTag, { backgroundColor: meta.color }]}>
                    <Text style={styles.activeTagText}>Active</Text>
                  </View>
                )}

                {/* Center-aligned Icon Circle */}
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: meta.iconBg,
                      borderColor: meta.border,
                    },
                  ]}
                >
                  <Ionicons name={meta.icon} size={26} color={meta.color} />
                </View>

                {/* Center-aligned Category Name */}
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category}
                </Text>

                {/* Task Count & Percentage Pill */}
                <View style={styles.metaRow}>
                  <Text style={[styles.taskCount, { color: meta.color }]}>
                    {totalTasks} {totalTasks === 1 ? 'Task' : 'Tasks'}
                  </Text>
                  <View style={[styles.percentBadge, { backgroundColor: meta.iconBg }]}>
                    <Text style={[styles.percentText, { color: meta.color }]}>
                      {progressPercent}%
                    </Text>
                  </View>
                </View>

                {/* Centered Mini Progress Bar */}
                <View style={[styles.progressTrack, { backgroundColor: meta.iconBg }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progressPercent}%`,
                        backgroundColor: meta.color,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 95,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
  },
  activeTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  taskCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  percentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    width: '84%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});