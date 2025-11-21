import { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/api';
import type { Todo } from '../types';
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const todo = await createTodo({
        title: newTodoTitle.trim(),
        description: newTodoDescription.trim() || '',
      });
      setTodos([todo, ...todos]);
      setNewTodoTitle('');
      setNewTodoDescription('');
    } catch (err) {
      setError('Failed to create todo. Please try again.');
      console.error(err);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const updated = await updateTodo(id, { completed: !completed });
      setTodos(todos.map(todo => todo.id === id ? updated : todo));
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error(err);
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const updated = await updateTodo(id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setTodos(todos.map(todo => todo.id === id ? updated : todo));
      setEditingId(null);
      setEditTitle('');
      setEditDescription('');
    } catch (err) {
      setError('Failed to update todo. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo. Please try again.');
      console.error(err);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="todo-app">
      <div className="todo-container">
        <h1 className="todo-title">Todo App</h1>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        <form onSubmit={handleCreateTodo} className="todo-form">
          <input
            type="text"
            placeholder="Add a new todo..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="todo-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            className="todo-textarea"
            rows={2}
          />
          <button type="submit" className="todo-add-btn">Add Todo</button>
        </form>

        <div className="todo-filters">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All ({todos.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'active' : ''}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'active' : ''}
          >
            Completed ({completedCount})
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading todos...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            {filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos.`}
          </div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map(todo => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === todo.id ? (
                  <div className="todo-edit">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="todo-edit-input"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="todo-edit-textarea"
                      rows={2}
                    />
                    <div className="todo-edit-actions">
                      <button
                        onClick={() => handleSaveEdit(todo.id)}
                        className="todo-save-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="todo-cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="todo-checkbox"
                      />
                      <div className="todo-text">
                        <h3 className={`todo-text-title ${todo.completed ? 'strikethrough' : ''}`}>
                          {todo.title}
                        </h3>
                        {todo.description && (
                          <p className={`todo-text-description ${todo.completed ? 'strikethrough' : ''}`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button
                        onClick={() => handleStartEdit(todo)}
                        className="todo-edit-btn"
                        disabled={todo.completed}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="todo-delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
