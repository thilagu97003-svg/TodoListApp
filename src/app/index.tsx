// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { Ionicons, Feather } from '@expo/vector-icons';

// Component imports
import SplashScreen from '../components/SplashScreen';
import TasksTab from '../components/TasksTab';
import CategoriesTab from '../components/CategoriesTab';
import CompletedTab from '../components/CompletedTab';

const STORAGE_KEY = '@taskmaster_tasks_v4';
const CATEGORIES_KEY = '@taskmaster_categories_v4';

const INITIAL_CATEGORIES = ['Work', 'Personal', 'Study', 'Shopping', 'Health', 'Travel', 'Finance', 'Events', 'Bills', 'Home'];
const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Prepare presentation for team meeting',
    category: 'Work',
    dueDate: '10/01/2026',
    completed: false,
    completedOn: null,
    subtasks: [
      { id: 's1', title: 'Collect metrics', completed: true },
      { id: 's2', title: 'Prepare slide deck', completed: false },
    ],
  },
  {
    id: '2',
    title: "Schedule doctor's appointment",
    category: 'Personal',
    dueDate: '10/01/2026',
    completed: false,
    completedOn: null,
    subtasks: [],
  },
  {
    id: '3',
    title: 'Grocery shopping',
    category: 'Shopping',
    dueDate: '10/01/2026',
    completed: false,
    completedOn: null,
    subtasks: [
      { id: 's3', title: 'Buy milk', completed: true },
      { id: 's4', title: 'Buy eggs', completed: false },
      { id: 's5', title: 'Buy bread', completed: false },
    ],
  },
  {
    id: '4',
    title: "Read a chapter of 'The Great Gatsby'",
    category: 'Personal',
    dueDate: '10/01/2026',
    completed: false,
    completedOn: null,
    subtasks: [],
  },
  {
    id: '5',
    title: 'Respond to emails',
    category: 'Work',
    dueDate: '10/01/2026',
    completed: false,
    completedOn: null,
    subtasks: [],
  },
  {
    id: '6',
    title: 'Book Appointment',
    category: 'Health',
    dueDate: '2024-01-18',
    completed: true,
    completedOn: '2024-01-18',
    subtasks: [],
  },
  {
    id: '7',
    title: 'Pay Bills',
    category: 'Personal',
    dueDate: '2024-01-15',
    completed: true,
    completedOn: '2024-01-15',
    subtasks: [],
  },
];
const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string; activeBg: string }> = {
  Home: { border: '#6366F1', bg: '#EEF2FF', text: '#4F46E5', activeBg: '#6366F1' },
  Bills: { border: '#EF4444', bg: '#FEE2E2', text: '#B91C1C', activeBg: '#EF4444' },
  Health: { border: '#B91C1C', bg: '#FFE4E6', text: '#9F1239', activeBg: '#B91C1C' },
  Finance: { border: '#0D9488', bg: '#CCFBF1', text: '#0F766E', activeBg: '#0D9488' },
  Events: { border: '#EC4899', bg: '#FCE7F3', text: '#BE185D', activeBg: '#EC4899' },
  Travel: { border: '#06B6D4', bg: '#CFFAFE', text: '#0E7490', activeBg: '#06B6D4' },
  Work: { border: '#3B82F6', bg: '#DBEAFE', text: '#1D4ED8', activeBg: '#3B82F6' },
  Study: { border: '#10B981', bg: '#D1FAE5', text: '#047857', activeBg: '#10B981' },
  Personal: { border: '#8B5CF6', bg: '#EDE9FE', text: '#6D28D9', activeBg: '#8B5CF6' },
  Shopping: { border: '#F59E0B', bg: '#FEF3C7', text: '#B45309', activeBg: '#F59E0B' },
};

export default function IndexScreen() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const [showSplash, setShowSplash] = useState(true);
  const [currentTab, setCurrentTab] = useState('Tasks'); // 'Tasks' | 'Categories' | 'Completed'
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [newDetailSubtask, setNewDetailSubtask] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('10/01/2026');
  const [dueTime, setDueTime] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [currentSubtaskInput, setCurrentSubtaskInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);
// Standard Professional Reminder Timer (Colon ':' format only)
// Date & Time Aware Professional Reminder Timer
  useEffect(() => {
    const parseTaskDateTime = (dateStr?: string, timeStr?: string) => {
      if (!timeStr) return null;

      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth();
      let day = now.getDate();

      if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.trim().split('/');
        if (parts.length === 3) {
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          year = parseInt(parts[2], 10);
        }
      }

      const trimmed = timeStr.trim();
      const isPM = /pm/i.test(trimmed);
      const isAM = /am/i.test(trimmed);
      const cleanTime = trimmed.replace(/am|pm/gi, '').trim();

      // Colon (:) mattrum Dot (.) rendayum accept pannum
      const timeParts = cleanTime.split(/[:.]/);
      if (timeParts.length < 2) return null;

      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) return null;

      if (isPM && hours < 12) hours += 12;
      else if (isAM && hours === 12) hours = 0;
      else if (!isPM && !isAM) {
        if (hours >= 1 && hours <= 11 && now.getHours() >= 12) hours += 12;
      }

      return new Date(year, month, day, hours, minutes, 0).getTime();
    };

    const checkReminder = () => {
      const nowTime = new Date().getTime();

      tasks.forEach((task) => {
        if (!task.completed && task.dueTime && !task.reminderFired) {
          const taskTimestamp = parseTaskDateTime(task.dueDate || task.date, task.dueTime);

          if (taskTimestamp !== null && nowTime >= taskTimestamp) {
            // Task-ah instant-ah fired nu mark panniduvom (duplicate alert block aaga)
            task.reminderFired = true;

            const categoryTemplates: Record<string, { icon: string; tag: string; action: string }> = {
              Work: { icon: '💼', tag: 'Work Priority', action: 'Scheduled time reached. Ensure presentation & deliverables are ready!' },
              Study: { icon: '📚', tag: 'Study Block', action: 'Time to practice notes, problems & revisions!' },
              Health: { icon: '🩺', tag: 'Health Priority', action: 'Medical & wellness schedule active. Keep health reports ready!' },
              Personal: { icon: '🌱', tag: 'Personal Priority', action: 'Personal career growth block active. Complete your scheduled task!' },
              Shopping: { icon: '🛒', tag: 'Shopping Reminder', action: 'Check checklist items and proceed with order/purchase!' },
              Travel: { icon: '🧳', tag: 'Travel Checklist', action: 'Verify itinerary, tickets and packing list!' },
              Finance: { icon: '💰', tag: 'Finance Audit', action: 'Review monthly expense sheets & savings!' },
              Events: { icon: '🎉', tag: 'Event & Function', action: 'Event schedule nearing! Check preparation, dress & gift checklist!' },
              Bills: { icon: '⚡', tag: 'Bills & Utilities', action: 'Payment deadline active. Complete pending bill/recharge payments!' },
              Home: { icon: '🏠', tag: 'Home & Errands', action: 'Maintenance/errand time active. Complete household tasks on schedule!' },
            };

            const template = categoryTemplates[task.category] || {
              icon: '⏰',
              tag: 'Task Reminder',
              action: 'Your scheduled deadline is active now.',
            };

            const alertText = `${template.icon} [${template.tag}]\n\nTask: "${task.title}"\n\n📌 Action: ${template.action}`;

            if (typeof window !== 'undefined') {
              window.alert(alertText);
            }

            const updated = tasks.map((t) =>
              t.id === task.id ? { ...t, reminderFired: true } : t
            );
            persistTasks(updated);
          }
        }
      });
    };

    const interval = setInterval(checkReminder, 5000);

    return () => clearInterval(interval);
  }, [tasks]);
  const loadData = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      const storedCats = await AsyncStorage.getItem(CATEGORIES_KEY);
      const defaultList = ['Work', 'Personal', 'Study', 'Shopping', 'Health', 'Travel', 'Finance', 'Events', 'Bills', 'Home'];

      if (storedTasks) setTasks(JSON.parse(storedTasks));

      if (storedCats) {
        const parsed = JSON.parse(storedCats);
        const merged = Array.from(new Set([...parsed, ...defaultList]));
        setCategories(merged);
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(merged));
      } else {
        setCategories(defaultList);
      }
    } catch (e) {
      console.log('Error loading data', e);
    }
  };

  const persistTasks = async (updated) => {
    setTasks(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const persistCategories = async (updated) => {
    setCategories(updated);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
  };

  const handleToggleTask = (id) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextState = !t.completed;
        return {
          ...t,
          completed: nextState,
          completedOn: nextState ? new Date().toISOString().split('T')[0] : null,
        };
      }
      return t;
    });
    persistTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    persistTasks(updated);
  };
  const handleClearCompleted = () => {
    const updated = tasks.filter((t: any) => !t.completed);
    persistTasks(updated);
  };

  const handleAddSubtaskInput = () => {
    if (!currentSubtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: Date.now().toString(), title: currentSubtaskInput.trim(), completed: false },
    ]);
    setCurrentSubtaskInput('');
  };

  const handleSaveNewTask = () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Please provide a task title.');
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      category: category || 'Work',
      dueDate: dueDate.trim() || '10/01/2026',
      dueTime: dueTime.trim(), //
      completed: false,
      completedOn: null,
      subtasks: subtasks,
    };
    persistTasks([newTask, ...tasks]);
    setTitle('');
    setCategory('Work');
    setDueDate('10/01/2026');
    setDueTime(''); //
    setSubtasks([]);
    setIsAddModalOpen(false);
  };

  const handleToggleSubtaskInDetail = (subtaskId) => {
    if (!selectedTask) return;
    const updatedSubtasks = selectedTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Ella subtasks-um completed aana automatic-ah parent task completed = true aagidum
    const allDone =
      updatedSubtasks.length > 0 &&
      updatedSubtasks.every((st) => st.completed);

    const updatedTask = {
      ...selectedTask,
      subtasks: updatedSubtasks,
      completed: allDone,
    };

    setSelectedTask(updatedTask);
    persistTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleUpdateTaskDetails = () => {
    if (!selectedTask) return;
    const allDone =
      selectedTask.subtasks &&
      selectedTask.subtasks.length > 0 &&
      selectedTask.subtasks.every((st) => st.completed);

    const finalTask = {
      ...selectedTask,
      completed: allDone,
    };

    persistTasks(tasks.map((t) => (t.id === finalTask.id ? finalTask : t)));
    setIsDetailModalOpen(false);
  };

  const handleAddSubtaskInDetail = () => {
    if (!newDetailSubtask.trim() || !selectedTask) return;
    const newSub = {
      id: Date.now().toString(),
      title: newDetailSubtask.trim(),
      completed: false,
    };
    const updatedSubtasks = [...(selectedTask.subtasks || []), newSub];
    const updatedTask = { ...selectedTask, subtasks: updatedSubtasks };
    setSelectedTask(updatedTask);
    setNewDetailSubtask('');
    persistTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (categories.includes(newCatName.trim())) {
      Alert.alert('Notice', 'Category already exists.');
      return;
    }
    persistCategories([...categories, newCatName.trim()]);
    setNewCatName('');
    setIsAddCategoryOpen(false);
  };

  if (!fontsLoaded) return <View style={styles.center} />;

  // 1. MANUAL TAP TO CONTINUE SPLASH SCREEN
  if (showSplash) {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#B5BDC7" />
        <View style={styles.mobileShell}>
          <SplashScreen onContinue={() => setShowSplash(false)} />
        </View>
      </SafeAreaView>
    );
  }

  // 2. MAIN APP DASHBOARD
  const activeTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (selectedCategoryFilter !== 'All' && t.category !== selectedCategoryFilter) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const completedTasks = tasks.filter((t) => t.completed);
  const totalTasksCount = tasks.length;
  const completedCount = completedTasks.length;
  const progressPercent = totalTasksCount > 0 ? (completedCount / totalTasksCount) * 100 : 0;
  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#B5BDC7" />

      <View style={styles.mobileShell}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSplash(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="star" size={18} color="#FBBF24" />
                <Text style={styles.brandTitle}>TaskMaster</Text>
              </View>
            <Text style={styles.tagline}>Organize your day, conquer your goals.</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completedCount}/{totalTasksCount} done</Text>
          </View>
        </View>

        {/* Tab Components */}
        <View style={{ flex: 1 }}>
          {currentTab === 'Tasks' && (
            <TasksTab
              tasks={activeTasks}
              categories={categories}
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={setSelectedCategoryFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onSelectTask={(task) => {
                setSelectedTask(task);
                setIsDetailModalOpen(true);
              }}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentTab === 'Categories' && (
            <CategoriesTab
              categories={categories}
              tasks={tasks}
              onSelectCategory={(cat) => {
                setSelectedCategoryFilter(cat);
                setCurrentTab('Tasks');
              }}
              onOpenAddCategory={() => setIsAddCategoryOpen(true)}
            />
          )}

          {currentTab === 'Completed' && (
    <CompletedTab
      completedTasks={completedTasks}
      tasks={completedTasks}
      onToggleTask={handleToggleTask}
      onDeleteTask={handleDeleteTask}
      onClearHistory={handleClearCompleted}
    />
  )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('Tasks')}>
            <Feather name="check-square" size={20} color={currentTab === 'Tasks' ? '#126EED' : '#94A3B8'} />
            <Text style={[styles.navLabel, currentTab === 'Tasks' && styles.navLabelActive]}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('Categories')}>
            <Feather name="grid" size={20} color={currentTab === 'Categories' ? '#126EED' : '#94A3B8'} />
            <Text style={[styles.navLabel, currentTab === 'Categories' && styles.navLabelActive]}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('Completed')}>
            <Feather name="check-circle" size={20} color={currentTab === 'Completed' ? '#126EED' : '#94A3B8'} />
            <Text style={[styles.navLabel, currentTab === 'Completed' && styles.navLabelActive]}>Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Modal 1: Add Task */}
        <Modal visible={isAddModalOpen} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Add Task</Text>
                <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Task title</Text>
                <TextInput
                  style={styles.inputBox}
                  placeholder="Enter task title (e.g., Pay bills, Project meeting)..."
                  placeholderTextColor="#94A3B8"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#A0AAB5"
                />
                <Text style={styles.inputLabel}>Category</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {categories.map((c) => {
            const isSelected = category === c;
            const theme = (CATEGORY_COLORS as any)?.[c] || {
              border: '#E2E8F0',
              bg: '#F8FAFC',
              text: '#475569',
              activeBg: '#2563EB',
            };

            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1.5,
                  borderColor: isSelected ? theme.activeBg : theme.border,
                  backgroundColor: isSelected ? theme.activeBg : theme.bg,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Lexend_600SemiBold',
                    color: isSelected ? '#FFFFFF' : theme.text,
                    fontWeight: '600',
                  }}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

     {/* Due Date */}
        <Text style={styles.inputLabel}>Due date</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="DD/MM/YYYY (e.g. 10/10/2026)"
          placeholderTextColor="#94A3B8"
          value={dueDate}
          onChangeText={setDueDate}
        />

        {/* Due Time */}
        <Text style={[styles.inputLabel, { marginTop: 10 }]}>Due Time (HH:MM)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. 10:30 AM or 16:45"
          placeholderTextColor="#94A3B8"
          value={dueTime}
          onChangeText={setDueTime}
        />
                <Text style={styles.inputLabel}>Subtasks</Text>
                <View style={styles.addSubtaskRow}>
                  <TextInput
                    style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}
                    placeholder="Add a step or subtask..."
                    placeholderTextColor="#94A3B8"
                    value={currentSubtaskInput}
                    onChangeText={setCurrentSubtaskInput}
                    
                  />
                  <TouchableOpacity style={styles.addSubtaskBtn} onPress={handleAddSubtaskInput}>
                    <Text style={styles.addSubtaskBtnText}>+ Add Subtask</Text>
                  </TouchableOpacity>
                </View>

                {subtasks.map((st) => (
                  <View key={st.id} style={styles.subtaskPreviewItem}>
                    <Ionicons name="square-outline" size={16} color="#126EED" />
                    <Text style={styles.subtaskPreviewText}>{st.title}</Text>
                  </View>
                ))}

                <TouchableOpacity style={styles.saveMainBtn} onPress={handleSaveNewTask}>
                  <Text style={styles.saveMainBtnText}>Save Task</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal 2: Task Details */}
        <Modal visible={isDetailModalOpen} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Task Details</Text>
                <TouchableOpacity onPress={() => setIsDetailModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              {selectedTask && (
                <ScrollView showsVerticalScrollIndicator={false}>
                 {/* Editable Title */}
              <Text style={styles.inputLabel}>Task Title</Text>
              <TextInput
                style={styles.inputBox}
                value={selectedTask.title}
                onChangeText={(newTitle) =>
                  setSelectedTask({ ...selectedTask, title: newTitle })
                }
                placeholder="Task title"
                placeholderTextColor="#Aolder0AAB5"
              />

              {/* Category */}
              <Text style={styles.detailCategoryLabel}>Category: {selectedTask.category}</Text>

              {/* Editable Due Date */}
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Due Date</Text>
              <TextInput
                style={styles.inputBox}
                value={selectedTask.dueDate}
                onChangeText={(newDate) =>
                  setSelectedTask({ ...selectedTask, dueDate: newDate })
                }
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#A0AAB5"
              />
             {/* Professional Due Time Box */}
  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Due Time (HH:MM)</Text>
  <TextInput
    style={styles.inputBox}
    value={selectedTask.dueTime || ''}
    onChangeText={(newTime) =>
      setSelectedTask({ ...selectedTask, dueTime: newTime, reminderFired: false })
    }
    placeholder="e.g. 03:25 PM or 15:25"
    placeholderTextColor="#A0AAB5"
  />

              {/* Subtasks Section Header */}
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Subtasks</Text>

              {/* Pudhu Subtask Input Box & Add Button */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 }}>
                <TextInput
                  style={[styles.inputBox, { flex: 1, marginBottom: 0 }]}
                  placeholder="Add a new subtask..."
                  placeholderTextColor="#A0AAB5"
                  value={newDetailSubtask}
                  onChangeText={setNewDetailSubtask}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#126EED',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 10,
                    marginLeft: 8,
                  }}
                  onPress={handleAddSubtaskInDetail}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 }}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {/* Subtasks List */}
              {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                selectedTask.subtasks.map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    style={styles.subtaskRow}
                    onPress={() => handleToggleSubtaskInDetail(st.id)}
                  >
                    <Ionicons
                      name={st.completed ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={st.completed ? '#126EED' : '#94A3B8'}
                    />
                    <Text style={[styles.subtaskTitle, st.completed && styles.subtaskTitleChecked]}>
                      {st.title}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSubtasksNotice}>No subtasks added yet.</Text>
              )}

              {/* Save Changes Button */}
              <TouchableOpacity
                style={[styles.saveMainBtn, { marginTop: 22 }]}
                onPress={handleUpdateTaskDetails}
              >
                <Text style={styles.saveMainBtnText}>Save Changes</Text>
              </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal 3: Add Category */}
        <Modal visible={isAddCategoryOpen} animationType="fade" transparent>
          <View style={styles.centerModalBg}>
            <View style={styles.dialogCard}>
              <Text style={styles.dialogTitle}>Add category</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="Category name..."
                value={newCatName}
                onChangeText={setNewCatName}
                placeholderTextColor="#A0AAB5"
                autoFocus
              />
              <View style={styles.dialogActions}>
                <TouchableOpacity style={styles.dialogCancel} onPress={() => setIsAddCategoryOpen(false)}>
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dialogAddBtn} onPress={handleAddCategory}>
                  <Text style={styles.dialogAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
  },
  mobileShell: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#E2E8F0',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
  backgroundColor: '#FFFFFF', // soft modern background
  borderBottomWidth: 1,
  borderBottomColor: '#E2E8F0',
  paddingHorizontal: 16,
  paddingVertical: 12,
},
  brandTitle: {
  fontFamily: 'Lexend_700Bold',
  fontSize: 22,
  color: '#0F172A', // Pure solid dark
},
  tagline: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressWrap: {
    alignItems: 'flex-end',
  },
  progressTrack: {
    width: 68,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#126EED',
  },
  progressLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#126EED',
    fontFamily: 'Lexend_600SemiBold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#1E293B',
  },
  inputLabel: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    fontFamily: 'Lexend_400Regular',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    marginBottom: 12,
  },
  smallCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  smallCatChipActive: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },
  smallCatText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 11,
    color: '#64748B',
  },
  smallCatTextActive: {
    color: '#FFFFFF',
  },
  addSubtaskRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addSubtaskBtn: {
    backgroundColor: '#E8F1FD',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSubtaskBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 12,
    color: '#126EED',
  },
  subtaskPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  subtaskPreviewText: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#334155',
  },
  saveMainBtn: {
    backgroundColor: '#126EED',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  saveMainBtnText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  detailTaskTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
  },
  detailCategoryLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#126EED',
    marginBottom: 2,
  },
  detailDueLabel: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 10,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
  },
  subtaskTitle: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#1E293B',
  },
  subtaskTitleChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  noSubtasksNotice: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 4,
  },
  centerModalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
  },
  dialogTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  dialogCancel: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dialogCancelText: {
    fontFamily: 'Lexend_500Medium',
    color: '#64748B',
    fontSize: 13,
  },
  dialogAddBtn: {
    backgroundColor: '#126EED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dialogAddText: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#FFFFFF',
    fontSize: 13,
  },
  pickerBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
});