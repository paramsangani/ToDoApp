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
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './Styles';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

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
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        isNew: true,
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTask('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
  };

  const toggleTask = (taskId) => {
    // Animate the layout changes
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setTasks((prevTasks) => {
      // Update the completed status of the task
      const updatedTasks = prevTasks.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
      );

      // Sort tasks: incomplete first, then completed
      const sortedTasks = [...updatedTasks].sort((a, b) => {
        if (a.completed === b.completed) {
          return 0; // Maintain original order
        }
        return a.completed ? 1 : -1; // Incomplete tasks come first
      });

      return sortedTasks;
    });
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
    setTasks((prevTasks) =>
      prevTasks.map((item) =>
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
        renderItem={({ item }) => (
          <TaskItem
            item={item}
            onToggle={() => toggleTask(item.id)}
            onLongPress={() => longPressMenu(item.id, item.text)}
            onDelete={() => deleteTask(item.id)}
            editingTaskId={editingTaskId}
            editingText={editingText}
            setEditingText={setEditingText}
            updateTask={updateTask}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

const TaskItem = ({
  item,
  onToggle,
  onLongPress,
  onDelete,
  editingTaskId,
  editingText,
  setEditingText,
  updateTask,
}) => {
  const addAnim = useRef(new Animated.Value(item.isNew ? 0 : 1)).current;
  const deleteAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (item.isNew) {
      Animated.timing(addAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Mark the task as no longer new
        item.isNew = false;
      });
    }
  }, []);

  const handleDelete = () => {
    Animated.timing(deleteAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => onDelete());
  };

  return (
    <Animated.View
      style={{
        opacity: Animated.multiply(addAnim, deleteAnim),
        transform: [{ scale: Animated.multiply(addAnim, deleteAnim) }],
      }}
    >
      <View style={styles.taskContainer}>
        {editingTaskId === item.id ? (
          <TextInput
            style={styles.editInput}
            value={editingText}
            onChangeText={setEditingText}
            onSubmitEditing={updateTask}
            autoFocus
          />
        ) : (
          <Text
            style={[
              styles.taskText,
              item.completed && styles.completedTaskText,
            ]}
            onPress={onToggle}
            onLongPress={onLongPress}
          >
            {item.text}
          </Text>
        )}
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>X</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
