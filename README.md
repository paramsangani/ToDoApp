# ToDoApp

A simple React Native To-Do List application with support for adding, editing, deleting, and toggling tasks. The app also includes animations for better user experience and uses `AsyncStorage` to persist tasks.

---

## Features

- Add new tasks.
- Edit existing tasks.
- Delete tasks with animations.
- Toggle tasks as completed or incomplete.
- Persist tasks using `AsyncStorage`.

---

## Prerequisites

To run this application, ensure you have the following installed on your system:

1. **Node.js** (https://nodejs.org/)
2. **React Native CLI** (https://reactnative.dev/docs/environment-setup)
3. **Android Studio** or **Xcode** for device simulation.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/paramsangani/ToDoApp.git
    ```

2. Navigate to the Project Directory:
    ```bash
    cd ToDoApp
    ```

3. Install Dependencies
    ```
    npm install
    ```

## Running the App

1.  Start the Metro bundler
    ```
    npx react-native start
    ```

2. Run the app on your desired platform
    - For Android:
    ```
    npx react-native run-android
    ```
    - For IOS:
    ```
    npx react-native run-ios
    ```

## Dependencies

This project uses the following major dependencies:
- React Native: Framework for building native applications.
- @react-native-async-storage/async-storage: To persist tasks locally.
- Animated: For task animations.
- Install all dependencies via `npm install`

## How it works

Add Task
1. Type the task in the input field.
2.	Click the + button to add the task to the list.

Edit Task
1.	Long-press on a task to open the options menu.
2.	Select Edit to update the task.

Delete Task
1.	Click the X button to delete the task with an animation.

Toggle Task Completion
1.	Tap on a task to toggle its completion status.
2.  Long hold on task to edit