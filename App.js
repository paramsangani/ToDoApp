import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Text,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './Styles';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const fadeAnim = useRef(new Animated.Value(50)).current; // Fade animation value
  const positionAnim = useRef(new Animated.Value(50)).current; // Slide animation value

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };

    saveTasks();
  }, [tasks]);

  const addTask = () => {
    if (task.trim()) {
      const newTask = { id: Date.now().toString(), text: task, completed: false };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTask('');

      // Trigger animation for the new task
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(positionAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const deleteTask = (taskId) => {
    // Animation before removing the task
    const deleteAnim = new Animated.Value(1);

    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
    });
  };

  const toggleTask = (taskId) => {
    setTasks(
      tasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const longPressMenu = (taskId, text) => {
    Alert.alert(
      'Task Options',
      'What would you like to do?',
      [
        {
          text: 'Edit',
          onPress: () => startEditing(taskId, text),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const startEditing = (taskId, text) => {
    setEditingTaskId(taskId);
    setEditingText(text);
  };

  const updateTask = () => {
    setTasks(
      tasks.map((item) =>
        item.id === editingTaskId ? { ...item, text: editingText } : item
      )
    );
    setEditingTaskId(null);
    setEditingText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Simple To-Do List</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
  data={tasks}
  renderItem={({ item }) => {
    const deleteAnim = new Animated.Value(1); // Local animation for each task
    return (
      <Animated.View
        style={{
          opacity: deleteAnim,
          transform: [
            {
              scale: deleteAnim,
            },
          ],
        }}
      >
        <View style={styles.taskContainer}>
          {editingTaskId === item.id ? (
            // Show TextInput for editing the task
            <TextInput
              style={styles.editInput}
              value={editingText}
              onChangeText={(text) => setEditingText(text)}
              onSubmitEditing={updateTask} // Update task on submit
              autoFocus
            />
          ) : (
            // Show task text for non-editing tasks
            <Text
              style={[
                styles.taskText,
                item.completed && styles.completedTaskText,
              ]}
              onPress={() => toggleTask(item.id)} // Toggle completed status
              onLongPress={() => longPressMenu(item.id, item.text)} // Edit options on long press
            >
              {item.text}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              // Trigger delete animation
              Animated.timing(deleteAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }).start(() => deleteTask(item.id));
            }}
          >
            <Text style={styles.deleteButton}>X</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }}
  keyExtractor={(item) => item.id}
/>
    </SafeAreaView>
  );
}