// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import TaskItem from './TaskItem.js';
// Category wise distinct color palette
export const CATEGORY_COLORS = {
  Work: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', bar: '#2563EB', glow: 'rgba(37, 99, 235, 0.25)' },
  Personal: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', bar: '#7C3AED', glow: 'rgba(124, 58, 237, 0.25)' },
  Study: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0', bar: '#059669', glow: 'rgba(5, 150, 105, 0.25)' },
  Shopping: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A', bar: '#D97706', glow: 'rgba(217, 119, 6, 0.25)' },
  Health: { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3', bar: '#E11D48', glow: 'rgba(225, 29, 72, 0.25)' },
  Travel: { bg: '#ECFEFF', text: '#0891B2', border: '#A5F3FC', bar: '#0891B2', glow: 'rgba(8, 145, 178, 0.25)' },
  Finance: { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4', bar: '#0F766E', glow: 'rgba(15, 118, 110, 0.25)' },
  Events: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8', bar: '#DB2777', glow: 'rgba(219, 39, 119, 0.25)' },
  Bills: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', bar: '#BE123C', glow: 'rgba(190, 18, 60, 0.25)' },
  Home: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE', bar: '#4F46E5', glow: 'rgba(79, 70, 229, 0.25)' },
};
// Time-ah eppovume 12-hour AM/PM format-la uniform-ah maatha:
const formatDisplayTime = (timeStr?: string) => {
  if (!timeStr || !timeStr.includes(':')) return timeStr || '';

  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) return trimmed.toUpperCase();

  const [hStr, mStr] = trimmed.split(':');
  let hours = parseInt(hStr, 10);
  const minutes = mStr ? mStr.slice(0, 2) : '00';

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours < 10 ? `0${hours}` : hours;

  return `${formattedHours}:${minutes} ${ampm}`;
};
const DEFAULT_COLOR = { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1', bar: '#0F172A', glow: 'rgba(15, 23, 42, 0.15)' };
// Helper to check if both Due Date and Time are in the past
function checkIsPastDue(dueDateStr, dueTimeStr) {
  if (!dueDateStr) return false;

  const parts = dueDateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  let hours = 23;
  let minutes = 59;

  if (dueTimeStr && dueTimeStr.includes(':')) {
    const isPM = /pm/i.test(dueTimeStr);
    const isAM = /am/i.test(dueTimeStr);
    const cleanTime = dueTimeStr.replace(/am|pm/gi, '').trim();
    const [hStr, mStr] = cleanTime.split(':');
    let parsedH = parseInt(hStr, 10);
    const parsedM = parseInt(mStr, 10);

    if (!isNaN(parsedH) && !isNaN(parsedM)) {
      if (isPM && parsedH < 12) parsedH += 12;
      else if (isAM && parsedH === 12) parsedH = 0;
      else if (!isPM && !isAM) {
        const curH = new Date().getHours();
        if (parsedH >= 1 && parsedH <= 11 && curH >= 12) parsedH += 12;
      }
      hours = parsedH;
      minutes = parsedM;
    }
  }

  const taskTime = new Date(year, month, day, hours, minutes, seconds).getTime();
  const now = new Date();

  return now > taskDeadline;
}
// Separate Card Component with Hover State
function HoverableTaskCard({
  item,
  theme,
  onSelectTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const completedSubs = item.subtasks ? item.subtasks.filter((s) => s.completed).length : 0;
  const totalSubs = item.subtasks ? item.subtasks.length : 0;

  return (
    <TouchableOpacity
      style={[
        styles.taskCard,
        // Normal state border
        { borderColor: isHovered ? theme.bar : '#EDF2F7' },
        // Hover state changes
        isHovered && {
          borderWidth: 1.5,
          backgroundColor: '#FFFFFF',
          shadowColor: theme.bar,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 5,
          transform: [{ translateY: -2 }],
        },
      ]}
      activeOpacity={0.9}
      onPress={() => onSelectTask(item)}
      // Web Hover Listeners
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Category Left Accent Strip */}
      <View
        style={[
          styles.accentStrip,
          {
            backgroundColor: theme.bar,
            width: isHovered ? 6 : 4.5, // Hover pannum bodhu strip konjam highlight aagum
          },
        ]}
      />

      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        activeOpacity={0.7}
        onPress={() => onToggleTask(item.id)}
      >
        <Ionicons
          name="square-outline"
          size={24}
          color={isHovered ? theme.bar : '#94A3B8'}
        />
      </TouchableOpacity>

      {/* Card Details */}
      <View style={styles.cardDetails}>
        <Text style={styles.taskTitleText} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.metaRow}>
          {/* Category Pill Badge with Color */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: theme.bg, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.categoryBadgeText, { color: theme.text }]}>
              {item.category}
            </Text>
          </View>

          {/* Subtask Counter Pill */}
          {totalSubs > 0 && (
            <View style={styles.subtaskPill}>
              <Feather name="check" size={11} color="#126EED" />
              <Text style={styles.subtaskPillText}>
                {completedSubs}/{totalSubs} subtasks
              </Text>
            </View>
          )}

         {/* Dynamic Due Date & Time Badge */}
          {item.dueDate && (() => {
            const isExpired = checkIsPastDue(item.dueDate, item.dueTime);

            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isExpired ? '#F8FAFC' : '#EFF6FF',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: isExpired ? '#E2E8F0' : '#DBEAFE',
                  opacity: isExpired ? 0.65 : 1,
                }}
              >
                {/* Calendar Date */}
                <Feather
                  name="calendar"
                  size={11}
                  color={isExpired ? '#94A3B8' : '#2563EB'}
                />
                <Text
                  style={{
                    fontSize: 11,
                    marginLeft: 4,
                    color: isExpired ? '#94A3B8' : '#1E40AF',
                    fontWeight: isExpired ? '400' : '700',
                    textDecorationLine: isExpired ? 'line-through' : 'none',
                  }}
                >
                  {item.dueDate}
                </Text>

                {/* Clock Time */}
                {item.dueTime ? (
                  <>
                    <Feather
                      name="clock"
                      size={11}
                      color={isExpired ? '#94A3B8' : '#2563EB'}
                      style={{ marginLeft: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        marginLeft: 3,
                        color: isExpired ? '#94A3B8' : '#1E40AF',
                        fontWeight: isExpired ? '400' : '700',
                        textDecorationLine: isExpired ? 'line-through' : 'none',
                      }}
                    >
                      {formatDisplayTime(item.dueTime)}
                    </Text>
                  </>
                ) : null}
              </View>
            );
          })()}
        </View>
      </View>

      {/* Delete Action Button */}
      <TouchableOpacity
        style={styles.deleteAction}
        activeOpacity={0.7}
        onPress={() => onDeleteTask(item.id)}
      >
        <Feather
          name="trash-2"
          size={16}
          color={isHovered ? '#EF4444' : '#CBD5E1'} // Hover aana red trash icon kaattum
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
// Interactive Category Filter Chip with Solid Color Hover & White Text
function CategoryFilterChip({
  label,
  isActive,
  colorTheme,
  onPress,
}: {
  label: string;
  isActive: boolean;
  colorTheme: { bg: string; text: string; border: string; bar: string };
  onPress: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Hover pannaalum seri, click panni active aanaalum seri, full solid color fill aagum:
  const isHighlighted = isActive || isHovered;

  const backgroundColor = isHighlighted ? colorTheme.bar : colorTheme.bg;
  const textColor = isHighlighted ? '#FFFFFF' : colorTheme.text;
  const borderColor = colorTheme.bar;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      // @ts-ignore Web hover support
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.filterChip,
        {
          backgroundColor,
          borderColor,
          borderWidth: 1.5,
          paddingHorizontal: 16,
          paddingVertical: 7,
          borderRadius: 22,
          cursor: 'pointer',
          // Mouse hover aagumbodhu smooth lift & glow
          transform: [{ scale: isHovered ? 1.06 : 1 }],
          boxShadow: isHighlighted ? `0 4px 12px ${colorTheme.bar}40` : 'none',
          transition: 'all 0.2s ease',
        },
      ]}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 13,
          fontWeight: isHighlighted ? '700' : '600',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
export default function TasksTab({
  tasks,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onSelectTask,
  onToggleTask,
  onDeleteTask,
}) {
  const categoryScrollRef = useRef<any>(null);
  const datePickerRef = useRef<any>(null);
  // Date filter state
  const [selectedDateFilter, setSelectedDateFilter] = useState<'All' | 'Today' | 'Tomorrow' | string>('All');

  // System dates
  const getTodayStr = () => new Date().toLocaleDateString('en-GB');
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-GB');
  };

  // Filtered tasks logic
  const filteredTasks = tasks.filter((task: any) => {
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;

    let matchesDate = true;
    if (selectedDateFilter === 'Today') {
      matchesDate = task.dueDate === getTodayStr();
    } else if (selectedDateFilter === 'Tomorrow') {
      matchesDate = task.dueDate === getTomorrowStr();
    } else if (selectedDateFilter !== 'All') {
      matchesDate = task.dueDate === selectedDateFilter;
    }

    const matchesSearch = !searchQuery || task.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDate && matchesSearch;
  });
  // Date title-ah "10/10/2026"-ku badhila "10 Oct, 2026" nu clean-ah kaata
  const getHeaderDisplayTitle = () => {
    if (selectedDateFilter === 'All') {
      return selectedCategory === 'All' ? 'My Tasks' : `${selectedCategory} Tasks`;
    }
    const parts = selectedDateFilter.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return selectedDateFilter;
  };
  // Today date format (DD/MM/YYYY)
  const today = new Date();
  const formatZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const todayStr = `${formatZero(today.getDate())}/${formatZero(today.getMonth() + 1)}/${today.getFullYear()}`;

  // Date base panni tasks-ah pirikirom:
  const todayTasks = tasks.filter((t: any) => t.dueDate === todayStr);
  const otherTasks = tasks.filter((t: any) => t.dueDate !== todayStr);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const el = categoryScrollRef.current?.getScrollableNode
      ? categoryScrollRef.current.getScrollableNode()
      : categoryScrollRef.current;

    if (!el || !el.addEventListener) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);
 
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Today Section Header */}
      {/* Header Section */}
        <View style={styles.subHeaderRow}>
          <View>
            <Text style={styles.sectionHeaderTitle}>
          {getHeaderDisplayTitle()}
        </Text>
            <Text style={styles.subtaskCountSubtitle}>
              {filteredTasks.length} tasks remaining
            </Text>
          </View>

          {/* Action Buttons: Calendar + Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
           {/* Calendar Icon Button with Reliable Web Picker */}
            <View style={{ position: 'relative' }}>
              <TouchableOpacity
                onPress={() => {
              if (Platform.OS === 'web' && datePickerRef.current) {
                if (typeof datePickerRef.current.showPicker === 'function') {
                  datePickerRef.current.showPicker();
                } else {
                  datePickerRef.current.click();
                }
              } else {
                const formatDate = (offsetDays: number) => {
                  const d = new Date();
                  d.setDate(d.getDate() + offsetDays);
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                };

                const todayStr = formatDate(0);
                const tomorrowStr = formatDate(1);
                const dayAfterStr = formatDate(2);

               Alert.alert(
                  'Filter Tasks',
                  `Showing: ${selectedDateFilter}`,
                  [
                    {
                      text: 'All Tasks',
                      onPress: () => setSelectedDateFilter('All'),
                    },
                    {
                      text: `Today (${todayStr.slice(0, 5)})`,
                      onPress: () => setSelectedDateFilter(todayStr),
                    },
                    {
                      text: `Tomorrow (${tomorrowStr.slice(0, 5)})`,
                      onPress: () => setSelectedDateFilter(tomorrowStr),
                    },
                  ],
                  { cancelable: true }
                );
              }
            }}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: selectedDateFilter !== 'All' ? '#EFF6FF' : '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: selectedDateFilter !== 'All' ? '#2563EB' : '#E2E8F0',
                  cursor: 'pointer',
                }}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={selectedDateFilter !== 'All' ? '#2563EB' : '#475569'}
                />
              </TouchableOpacity>

              {/* Native Date Picker element (Web Only) */}
{Platform.OS === 'web' && (
  <input
    ref={datePickerRef}
    type="date"
    onChange={(e: any) => {
      if (e.target.value) {
        const [year, month, day] = e.target.value.split('-');
        setSelectedDateFilter(`${day}/${month}/${year}`);
      }
    }}
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: 1,
      height: 1,
      opacity: 0,
      pointerEvents: 'none',
    }}
  />
)}
            </View>
            {/* Existing Add Task Button */}
            <TouchableOpacity style={styles.addTodayBtn} activeOpacity={0.8} onPress={onOpenAddModal}>
              <Ionicons name="add" size={24} color="#126EED" />
            </TouchableOpacity>
          </View>
        </View>

    {/* Calendar Selected Date Filter Badge Only (All, Today, Tomorrow buttons removed) */}
      {selectedDateFilter && selectedDateFilter !== 'All' && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedDateFilter('All')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 16,
              backgroundColor: '#EFF6FF',
              borderWidth: 1,
              borderColor: '#2563EB',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>
              {selectedDateFilter}
            </Text>
            <Ionicons name="close-circle" size={14} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}
      {/* Search Input Box */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={17} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your tasks..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#94A3B8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={{ height: 48, marginVertical: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
        {/* Left Arrow Button */}
        <TouchableOpacity
          onPress={() => {
            if (categoryScrollRef.current) {
              const node = categoryScrollRef.current.getScrollableNode ? categoryScrollRef.current.getScrollableNode() : categoryScrollRef.current;
              node?.scrollBy({ left: -150, behavior: 'smooth' });
            }
          }}
          style={{ padding: 6, zIndex: 10 }}
        >
          <Ionicons name="chevron-back" size={20} color="#64748B" />
        </TouchableOpacity>

        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, alignItems: 'center', gap: 8 }}
          style={{
            // @ts-ignore
            overflowX: 'auto',
          }}
        >
          {/* 'All' Chip */}
          <CategoryFilterChip
            label="All"
            isActive={selectedCategory === 'All'}
            colorTheme={{ bg: '#F1F5F9', text: '#0F172A', border: '#CBD5E1', bar: '#0F172A' }}
            onPress={() => onSelectCategory('All')}
          />

          {/* Dynamic Category Chips */}
          {categories.map((cat) => {
            // @ts-ignore
            const theme = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
            return (
              <CategoryFilterChip
                key={cat}
                label={cat}
                isActive={selectedCategory === cat}
                colorTheme={theme}
                onPress={() => onSelectCategory(cat)}
              />
            );
          })}
        </ScrollView>

        {/* Right Arrow Button */}
        <TouchableOpacity
          onPress={() => {
            if (categoryScrollRef.current) {
              const node = categoryScrollRef.current.getScrollableNode ? categoryScrollRef.current.getScrollableNode() : categoryScrollRef.current;
              node?.scrollBy({ left: 150, behavior: 'smooth' });
            }
          }}
          style={{ padding: 6, zIndex: 10 }}
        >
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      {/* Tasks List with Interactive Hover Cards */}
      <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id.toString()}
            extraData={filteredTasks}
            showsVerticalScrollIndicator={false}
            style={{ scrollbarWidth: 'none' }}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onPress={() => onSelectTask(item)}
                onToggle={() => onToggleTask(item.id)}
                onDelete={() => onDeleteTask(item.id)}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, paddingTop: 6 }}
            ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 50,
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  backgroundColor: '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <Ionicons name="calendar-outline" size={34} color="#3B82F6" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                No tasks found
              </Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                {selectedDateFilter !== 'All'
                  ? `No tasks scheduled for ${selectedDateFilter}. Click '+' to schedule one!`
                  : 'No tasks available in this filter.'}
              </Text>
            </View>
          }
        />
    </View>
  );
}

const styles = StyleSheet.create({
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 14,
    marginBottom: 6,
  },
  sectionHeaderTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 22,
    color: '#0F172A',
  },
  subtaskCountSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  addTodayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F1FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#0F172A',
    marginLeft: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#0F172A', // Black active style
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 28,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out', // Smooth animation
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    transition: 'width 0.15s ease',
  },
  checkboxTouch: {
    marginRight: 12,
    marginLeft: 4,
  },
  cardDetails: {
    flex: 1,
  },
  taskTitleText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14.5,
    color: '#1E293B',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 11,
  },
  subtaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subtaskPillText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: '#126EED',
  },
  dueDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 11,
    color: '#94A3B8',
  },
  deleteAction: {
    padding: 6,
    marginLeft: 6,
  },
  centerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 16,
    color: '#64748B',
    marginTop: 10,
  },
  emptySub: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
});