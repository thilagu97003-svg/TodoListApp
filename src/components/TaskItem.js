import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

const CATEGORY_COLORS = {
  Work: { bg: '#EFF6FF', text: '#2563EB', bar: '#2563EB' },
  Personal: { bg: '#F5F3FF', text: '#7C3AED', bar: '#7C3AED' },
  Study: { bg: '#ECFDF5', text: '#059669', bar: '#059669' },
  Shopping: { bg: '#FFFBEB', text: '#D97706', bar: '#D97706' },
  Health: { bg: '#FFF1F2', text: '#E11D48', bar: '#E11D48' },
  Travel: { bg: '#ECFEFF', text: '#0891B2', bar: '#0891B2' },
  Finance: { bg: '#F0FDFA', text: '#0F766E', bar: '#0F766E' },
  Home: { bg: '#EEF2FF', text: '#4F46E5', bar: '#4F46E5' },
  Bills: { bg: '#FEF2F2', text: '#DC2626', bar: '#DC2626' },
  Events: { bg: '#FDF2F8', text: '#DB2777', bar: '#DB2777' },
};

// Standardize time string into 12-hour AM/PM format
const formatTo12Hour = (timeStr) => {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    if (isNaN(hours)) return timeStr;
    const modifier = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    return `${formattedHours}:${minutes} ${modifier}`;
  }
  return timeStr;
};

const checkIsOverdue = (dateStr, timeStr) => {
  if (!timeStr) return false;
  try {
    const now = new Date();
    let day = now.getDate();
    let month = now.getMonth();
    let year = now.getFullYear();

    if (dateStr && typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.trim().split('/');
      if (parts.length === 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      }
    }

    const trimmed = String(timeStr).trim();
    const isPM = /pm/i.test(trimmed);
    const isAM = /am/i.test(trimmed);
    const clean = trimmed.replace(/am|pm/gi, '').trim();
    const timeParts = clean.split(/[:.]/);

    if (timeParts.length < 2) return false;

    let hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10) || 0;

    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    // Task set panna minute mudinjadhum overdue aaganum
    const taskDate = new Date(year, month, day, hours, minutes, 0);
    return now.getTime() >= taskDate.getTime();
  } catch (e) {
    return false;
  }
};
const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();

  // Already AM / PM irundhaa apdiye vitrum
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }

  // Dot (.) irundhaalum colon (:) irundhaalum split panna normalize panrom
  const clean = trimmed.replace('.', ':');
  const parts = clean.split(':');
  if (parts.length < 2) return trimmed;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);

  if (isNaN(hours)) return trimmed;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours < 10 ? `0${hours}` : hours;

  return `${formattedHours}:${minutes} ${ampm}`;
};
export default function TaskItem({ task, onPress, onToggle, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
 const [, setTick] = useState(0);

  useEffect(() => {
    // Ovvoru second-um check panni UI-ah force update pannum
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const categoryTheme = CATEGORY_COLORS[task.category] || {
    bg: '#F1F5F9',
    text: '#475569',
    bar: '#126EED',
  };

 // 1. isExpired-ah modhalla declare pannanum
  const taskDueDate = task.dueDate || task.date;
  const taskDueTime = task.dueTime || task.time;
  
  // 1. formattedTime-ah first-e create pannidunga
  const formattedTime = formatTo12Hour(taskDueTime);

  // 2. Adhukku apram checkIsOverdue call pannunga
  const isExpired = checkIsOverdue(task.dueDate || task.date, formattedTime || taskDueTime);
  // 2. Adhukku aprom dhaan console.log pannanum
  console.log('Task:', task.title, 'isExpired:', isExpired, 'dueTime:', task.dueTime);

  const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
  const completedSubtasks = task.subtasks
    ? task.subtasks.filter((st) => st.completed).length
    : 0;

  return (
   <View
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  onTouchStart={() => setIsPressed(true)}
  onTouchEnd={() => setIsPressed(false)}
  style={{
    width: '100%',
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease',
    transform: (isHovered || isPressed) ? 'scale(1.018) translateY(-3px)' : 'scale(1)',
    cursor: 'pointer',
  }}
      
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.card,
          {
            borderLeftColor: categoryTheme.bar,
            borderLeftWidth: 4,
            borderColor: isHovered ? categoryTheme.bar : '#F0F3F8',
            shadowColor: isHovered ? categoryTheme.bar : '#126EED',
            shadowOpacity: isHovered ? 0.16 : 0.05,
            shadowRadius: isHovered ? 12 : 8,
          },
          task.completed && styles.cardCompleted,
        ]}
      >
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onToggle(task.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={task.completed ? 'checkbox' : 'square-outline'}
            size={24}
            color={task.completed ? '#126EED' : '#94A3B8'}
          />
        </TouchableOpacity>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.titleCompleted,
            ]}
          >
            {task.title}
          </Text>

          {task.description ? (
            <Text style={styles.taskTitle} numberOfLines={2} ellipsizeMode="tail">
          {task.title}
          </Text>
          ) : null}

          {/* Badges Row */}
          <View style={styles.badgeRow}>
            {task.category ? (
              <View style={[styles.categoryBadge, { backgroundColor: categoryTheme.bg }]}>
                <Text style={[styles.categoryText, { color: categoryTheme.text }]}>
                  {task.category}
                </Text>
              </View>
            ) : null}

            {totalSubtasks > 0 ? (
              <View style={styles.subtaskBadgeNeutral}>
                <Ionicons name="checkbox-outline" size={13} color="#64748B" />
                <Text style={styles.subtaskTextNeutral}>
                  {completedSubtasks}/{totalSubtasks} subtasks
                </Text>
              </View>
            ) : null}
          </View>
{/* Due Date & 12-Hour Time Row */}
            {(task.dueDate || task.date || formattedTime) ? (
              <View style={styles.dateTimeRow}>
                {(task.dueDate || task.date) ? (
                  <View style={styles.dateItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#4338CA"
                    />
                    <Text style={[styles.dateTimeText, styles.dateTimeActive]}>
                      {task.dueDate || task.date}
                    </Text>
                  </View>
                ) : null}

                {formattedTime ? (
                  <View style={styles.dateItem}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color="#4338CA"
                    />
                    <Text style={[styles.dateTimeText, styles.dateTimeActive]}>
                      {formattedTime}
                    </Text>
                  </View>
                ) : null}

                {/* Overdue Badge Text */}
                {isExpired ? (
                  <View style={styles.overdueBadge}>
                    <Ionicons name="alert-circle" size={12} color="#DC2626" />
                   <Text style={styles.overdueText}>Overdue</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={19} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
  },
  cardCompleted: {
    opacity: 0.65,
    backgroundColor: '#F9FAFB',
  },
  checkboxContainer: {
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskDesc: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    fontWeight: '700',
  },
  subtaskBadgeNeutral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subtaskTextNeutral: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateTimeText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
  },
  dateTimeActive: {
    color: '#4338CA',
    fontWeight: '600',
  },
 dateTimeExpired: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 6,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overdueText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize', // 'uppercase'-ku badhila capitalize
  },
});