import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  useFonts, 
  Lexend_400Regular, 
  Lexend_500Medium, 
  Lexend_600SemiBold, 
  Lexend_700Bold 
} from '@expo-google-fonts/lexend';
import { Ionicons } from '@expo/vector-icons';
import TaskItem from './components/TaskItem';
import AddTaskModal from './components/AddTaskModal';

const STORAGE_KEY = '@todo_list_data';

export default function App() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All'); // All | Active | Completed
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load saved tasks on start
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error reading storage', e);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      setTasks(newTasks);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Error saving storage', e);
    }
  };

  const addTask = (newTask) => {
    const updated = [newTask, ...tasks];
    saveTasks(updated);
  };

  const toggleTask = (id) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          // Parent task tick aana ella subtasks-um auto-completed aagum
          subtasks: t.subtasks
            ? t.subtasks.map((st) => ({ ...st, completed: nextCompleted }))
            : [],
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Subtasks complete aagumpothu parent task auto-complete aaga
  const toggleSubtask = (taskId, subtaskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted =
          updatedSubtasks.length > 0 &&
          updatedSubtasks.every((st) => st.completed);

        return {
          ...t,
          subtasks: updatedSubtasks,
          completed: allCompleted, // 3/3 subtasks mudinja udane parent task-um complete aagidum
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#126EED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Welcome back 👋</Text>
          <Text style={styles.headerTitle}>To-Do List</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {tasks.filter((t) => !t.completed).length} Pending
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Active', 'Completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onToggle={toggleTask} onDelete={deleteTask} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptySubtitle}>Tap the '+' button below to add your first task!</Text>
          </View>
        }
      />

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={addTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerSubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 14,
    color: '#64748B',
  },
  headerTitle: {
    fontFamily: 'Lexend_700Bold',
    fontSize: 26,
    color: '#0F172A',
  },
  counterBadge: {
    backgroundColor: '#E8F1FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontFamily: 'Lexend_600SemiBold',
    color: '#126EED',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 14,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EEF2F6',
  },
  filterTabActive: {
    backgroundColor: '#126EED',
  },
  filterTabText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 18,
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: 'Lexend_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#126EED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#126EED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});