import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';

const CATEGORY_COLORS = {
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

export default function AddTaskModal({ visible, onClose, onAddTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSave = () => {
    if (!title.trim()) return;
    onAddTask({
      id: Date.now().toString(),
      title,
      description,
      priority,
      completed: false,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
    setTitle('');
    setDescription('');
    setPriority('Medium');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Task</Text>

          <TextInput
            placeholder="Task Title (e.g., Design Review)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Description (Optional)"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.priorityLabel}>Priority</Text>
          <View style={styles.priorityGroup}>
            {['Low', 'Medium', 'High'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.priorityBtn,
                  priority === item && styles.priorityBtnSelected,
                ]}
                onPress={() => setPriority(item)}
              >
                <Text style={[styles.priorityBtnText, priority === item && styles.priorityBtnTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
              <Text style={styles.submitText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalTitle: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 20,
    color: '#1E293B',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Lexend_400Regular',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityLabel: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  priorityGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  priorityBtnSelected: {
    backgroundColor: '#126EED',
    borderColor: '#126EED',
  },
  priorityBtnText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 13,
    color: '#64748B',
  },
  priorityBtnTextSelected: {
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Lexend_500Medium',
    fontSize: 15,
    color: '#64748B',
  },
  submitButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#126EED',
    alignItems: 'center',
  },
  submitText: {
    fontFamily: 'Lexend_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});