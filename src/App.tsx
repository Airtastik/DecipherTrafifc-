import React, { useState } from 'react';
import './App.css';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Deploy to AWS', completed: false },
    { id: 2, text: 'Test the app', completed: false }
  ]);
  const [inputValue, setInputValue] = useState<string>('');

  const addTask = (): void => {
    if (inputValue.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      setTasks([...tasks, newTask]);
      setInputValue('');
    }
  };

  const toggleTask = (id: number): void => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number): void => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>My AWS React App</h1>
        <p>A simple task manager built with React & TypeScript</p>
      </header>
      
      <main className="App-main">
        <div className="task-input">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
          />
          <button onClick={addTask}>Add Task</button>
        </div>

        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              <span onClick={() => toggleTask(task.id)}>{task.text}</span>
              <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
