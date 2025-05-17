import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';
import { formatDate, getNextOccurrence } from '../utils/dateUtils';

// Import icons
const PlusIcon = getIcon('Plus');
const EditIcon = getIcon('Edit2');
const TrashIcon = getIcon('Trash2');
const CalendarIcon = getIcon('Calendar');
const FlagIcon = getIcon('Flag');
const CheckIcon = getIcon('Check');
const XIcon = getIcon('X');
const ClockIcon = getIcon('Clock');
const ArrowUpIcon = getIcon('ArrowUp');
const ArrowDownIcon = getIcon('ArrowDown');
const ListIcon = getIcon('ListTodo');
const CheckCircleIcon = getIcon('CheckCircle');
const AlertCircleIcon = getIcon('AlertCircle');
const RepeatIcon = getIcon('Repeat');
const InfoIcon = getIcon('Info');

function MainFeature({ setStatsSummary }) {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentTask, setCurrentTask] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'Medium',
    updatedAt: '',
    isRecurring: false,
    recurrence: {
      frequency: 'daily', // daily, weekly, monthly, custom
      interval: 1,
      weekdays: [], // For weekly: array of days (0-6, Sunday-Saturday)
      monthlyOption: 'dayOfMonth', // dayOfMonth or dayOfWeek
      monthlyDay: 1, // Day of month (1-31)
      endOption: 'never', // never, after, onDate
      endAfter: 10 // Number of occurrences
    },
    
    dueDate: '',
    createdAt: '',
    updatedAt: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Update stats summary
    const now = new Date();
    const stats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'Completed').length,
      inProgress: tasks.filter(task => task.status === 'In Progress').length,
      overdue: tasks.filter(task => 
        task.status !== 'Completed' && 
        new Date(task.dueDate) < now
      ).length
    };
    
    setStatsSummary(stats);
  }, [tasks, setStatsSummary]);

  const handleAddNewTask = () => {
    // Reset form for a new task
    setCurrentTask({
      id: `task_${Date.now()}`,
      title: '',
      description: '',
      priority: 'Medium',
      status: 'To Do',
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRecurring: false,
      recurrence: {
        frequency: 'daily',
        interval: 1,
        weekdays: [],
        monthlyOption: 'dayOfMonth',
        monthlyDay: 1,
        endOption: 'never',
        endAfter: 10
      }
    });
    setIsEditing(false);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setCurrentTask({
      ...task,
      dueDate: task.dueDate.slice(0, 10) // Format date for input
    });
    setIsEditing(true);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      setTasks(tasks.filter(task => task.id !== id));
      toast.success('Task deleted successfully!');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { 
          ...task, 
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        // If marking as complete, show a success toast
        if (newStatus === 'Completed' && task.status !== 'Completed') {
          setTimeout(() => toast.success('Task completed! 🎉'), 100);
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const handleCompleteRecurringTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.isRecurring) return;
    
    // Calculate the next occurrence
    const nextOccurrence = getNextOccurrence(task.recurrence, task.dueDate);
    if (!nextOccurrence) return;
    
    // Create a new task instance for the next occurrence
    const newTask = {
      ...task,
      id: `task_${Date.now()}`,
      status: 'To Do',
      dueDate: nextOccurrence.toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the new task
    setTasks(prevTasks => [...prevTasks, newTask]);
    
    // Mark the current instance as completed
    handleStatusChange(taskId, 'Completed');
    
    // Show toast notification
    toast.info('Recurring task completed. Next occurrence added!');
  };

  const getNextRecurrenceDate = (task) => {
    if (!task.isRecurring) return null;
    
    try {
      const nextDate = getNextOccurrence(task.recurrence, task.dueDate);
      return nextDate;
    } catch (error) {
      console.error("Error calculating next recurrence:", error);
      return null;
    }
  };

  const formatNextRecurrence = (task) => {
    const nextDate = getNextRecurrenceDate(task);
    if (!nextDate) return '';
    
    return format(nextDate, 'EEE, MMM d, yyyy');
  };

  // Handle saving a task (create or update)
  const handleSaveTask = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!currentTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    if (!currentTask.dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    if (isEditing) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === currentTask.id 
          ? { 
              ...currentTask, 
              updatedAt: new Date().toISOString(),
              // Ensure weekdays is an array
              recurrence: { ...currentTask.recurrence, weekdays: Array.isArray(currentTask.recurrence.weekdays) ? currentTask.recurrence.weekdays : [] }
            } 
          : task
      ));
      toast.success('Task updated successfully!');
    } else {
      // Add new task
      setTasks([...tasks, currentTask]);
      toast.success('New task added!');
    }
    
    setShowTaskModal(false);
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(task => task.status === activeFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'priority') {
        const priorityWeight = { 'Low': 1, 'Medium': 2, 'High': 3, 'Urgent': 4 };
        return sortDirection === 'asc' 
          ? priorityWeight[a.priority] - priorityWeight[b.priority]
          : priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sortBy === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
    
    return filtered;
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Function to determine if a task is overdue
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate !== '';
  };
  
  // Function to handle setting weekdays for weekly recurrence
  const handleWeekdayToggle = (day) => {
    const weekdays = currentTask.recurrence.weekdays || [];
    const updatedWeekdays = weekdays.includes(day) ? weekdays.filter(d => d !== day) : [...weekdays, day];
    
    setCurrentTask({
      ...currentTask,
      recurrence: { ...currentTask.recurrence, weekdays: updatedWeekdays }
    });
  };

  // Get priority color class
  const getPriorityColorClass = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'To Do': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.2 } 
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Left side - Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <h3 className="font-medium text-lg dark:text-white">Filter by:</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'To Do', 'In Progress', 'Completed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-primary text-white'
                      : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-300 dark:hover:bg-surface-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right side - Sort and Add */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Sort Controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-surface-600 dark:text-surface-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg px-2 py-1 text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="p-1 bg-surface-100 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600"
              >
                {sortDirection === 'asc' ? 
                  <ArrowUpIcon className="w-4 h-4 text-surface-600 dark:text-surface-400" /> : 
                  <ArrowDownIcon className="w-4 h-4 text-surface-600 dark:text-surface-400" />
                }
              </button>
            </div>
            
            {/* Add Task Button */}
            <motion.button
              onClick={handleAddNewTask}
              className="btn btn-primary flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Task</span>
            </motion.button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-4 pr-10 py-2 rounded-lg bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-white border border-surface-200 dark:border-surface-600 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-surface-400 dark:text-surface-500">
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')}>
                  <XIcon className="w-4 h-4" />
                </button>
              ) : (
                <span>
                  {/* Optional search icon */}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
      
      {/* Tasks List */}
      <div className="min-h-[300px]">
        {filterTasks().length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-surface-800 rounded-xl shadow-md p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center mb-4">
              <ListIcon className="w-8 h-8 text-surface-500 dark:text-surface-400" />
            </div>
            <h3 className="text-xl font-medium text-surface-800 dark:text-white">No tasks found</h3>
            <p className="text-surface-600 dark:text-surface-400 mt-2 mb-4">
              {searchQuery 
                ? "No tasks match your search criteria" 
                : activeFilter !== 'All'
                  ? `You don't have any ${activeFilter.toLowerCase()} tasks`
                  : "Add your first task to get started"}
            </p>
            <motion.button
              onClick={handleAddNewTask}
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create a Task
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4"
          >
            <AnimatePresence>
              {filterTasks().map(task => (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`task-card ${task.status === 'Completed' ? 'opacity-80' : ''} ${task.isRecurring ? 'task-recurring' : ''} border-l-4 ${
                    task.priority === 'Urgent' ? 'border-l-red-500' :
                    task.priority === 'High' ? 'border-l-orange-500' :
                    task.priority === 'Medium' ? 'border-l-yellow-500' :
                    'border-l-green-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Main Task Content */}
                    <div className="flex-grow">
                      <div className="flex items-start space-x-3">
                        {/* Status Checkbox for quick toggle */}
                        <button 
                          onClick={() => task.isRecurring ? handleCompleteRecurringTask(task.id) : 
                            handleStatusChange(task.id, 
                            task.status === 'Completed' ? 'To Do' : 'Completed'
                          )}
                          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border ${
                            task.status === 'Completed' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-surface-300 dark:border-surface-600'
                          } flex items-center justify-center`}
                          aria-label={task.status === 'Completed' ? "Mark as incomplete" : "Mark as complete"}
                        >
                          {task.status === 'Completed' && (
                            <CheckIcon className="w-3 h-3" />
                          )}
                        </button>
                        
                        {/* Title and Description */}
                        <div className="flex-grow">
                          <h3 className={`text-lg font-medium dark:text-white ${
                            task.status === 'Completed' ? 'line-through text-surface-500 dark:text-surface-400' : ''
                          } flex items-center gap-2`}>
                            {task.isRecurring && (
                              <RepeatIcon className="inline-block w-4 h-4 text-secondary" />
                            )}
                            {task.title}
                          </h3>
                          <p className="text-surface-600 dark:text-surface-400 mt-1 text-sm">
                            {task.description}
                          </p>
                          
                          {/* Meta information - Due Date and Priority */}
                          <div className="flex flex-wrap items-center mt-3 space-x-3">
                            {/* Status Badge */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                              {task.status === 'Completed' ? (
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                              ) : task.status === 'In Progress' ? (
                                <ClockIcon className="w-3 h-3 mr-1" />
                              ) : (
                                <ListIcon className="w-3 h-3 mr-1" />
                              )}
                              {task.status}
                            </span>
                            
                            {/* Due Date */}
                            <span className={`inline-flex items-center text-xs ${
                              isOverdue(task.dueDate) && task.status !== 'Completed'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-surface-500 dark:text-surface-400'
                            }`}>
                              <CalendarIcon className="w-3 h-3 mr-1" />
                              {isOverdue(task.dueDate) && task.status !== 'Completed' ? (
                                <span className="flex items-center">
                                  <AlertCircleIcon className="w-3 h-3 mr-1 text-red-600 dark:text-red-400" />
                                  Overdue:
                                </span>
                              ) : null}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            
                            {/* Recurring Task Next Occurrence */}
                            {task.isRecurring && task.status !== 'Completed' && (
                              <div className="relative inline-flex group">
                                <span className="inline-flex items-center text-xs text-secondary cursor-help">
                                  <RepeatIcon className="w-3 h-3 mr-1" />
                                  Recurring
                                  <InfoIcon className="w-3 h-3 ml-1" />
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 p-2 bg-white dark:bg-surface-700 rounded-md shadow-md text-xs hidden group-hover:block z-10 text-center">
                                  <p className="font-medium text-surface-800 dark:text-white">
                                    Next occurrence:
                                    <span className="block mt-1 text-secondary">{formatNextRecurrence(task)}</span>
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {/* Priority */}
                            <span className="inline-flex items-center text-xs text-surface-500 dark:text-surface-400">
                              <FlagIcon className="w-3 h-3 mr-1" />
                              <span className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getPriorityColorClass(task.priority)}`}></span>
                                {task.priority}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions Buttons */}
                    <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                      {/* Edit Button */}
                      <motion.button
                        onClick={() => handleEditTask(task)}
                        className="p-2 bg-surface-100 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-600 dark:text-surface-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Edit task"
                      >
                        <EditIcon className="w-4 h-4" />
                      </motion.button>
                      
                      {/* Delete Button */}
                      <motion.button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Delete task"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowTaskModal(false)}
            ></motion.div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-lg w-full max-w-lg relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-surface-200 dark:border-surface-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium dark:text-white">
                    {isEditing ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body - Form */}
              <form onSubmit={handleSaveTask}>
                <div className="p-5 space-y-4">
                  {/* Title Input */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={currentTask.title}
                      onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                      placeholder="Enter task title"
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  {/* Description Input */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={currentTask.description}
                      onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                      placeholder="Enter task description"
                      rows="3"
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-700 dark:text-white"
                    ></textarea>
                  </div>
                  
                  {/* Due Date Input */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={currentTask.dueDate}
                      onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  {/* Priority Select */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={currentTask.priority}
                      onChange={(e) => setCurrentTask({...currentTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-700 dark:text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  
                  {/* Status Select */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      value={currentTask.status}
                      onChange={(e) => setCurrentTask({...currentTask, status: e.target.value})}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-700 dark:text-white"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  {/* Recurring Task Toggle */}
                  <div className="mt-6 mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={currentTask.isRecurring}
                        onChange={(e) => setCurrentTask({
                          ...currentTask, 
                          isRecurring: e.target.checked
                        })}
                        className="w-4 h-4 text-primary focus:ring-primary border-surface-300 rounded"
                      />
                      <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-surface-700 dark:text-surface-300">
                        Recurring Task
                      </label>
                    </div>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                      Schedule this task to repeat automatically
                    </p>
                  </div>
                  
                  {/* Recurring Task Options - Only show if recurring is checked */}
                  {currentTask.isRecurring && (
                    <div className="space-y-4 p-4 bg-surface-50 dark:bg-surface-700/50 rounded-lg mt-2">
                      <h4 className="font-medium text-surface-800 dark:text-white flex items-center">
                        <RepeatIcon className="w-4 h-4 mr-2" />
                        Recurrence Pattern
                      </h4>
                      
                      {/* Frequency Selection */}
                      <div>
                        <label htmlFor="recurrenceFrequency" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                          Repeat
                        </label>
                        <select
                          id="recurrenceFrequency"
                          value={currentTask.recurrence.frequency}
                          onChange={(e) => setCurrentTask({
                            ...currentTask, 
                            recurrence: { 
                              ...currentTask.recurrence, 
                              frequency: e.target.value 
                            }
                          })}
                          className="w-full px-3 py-1.5 border border-surface-300 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-800 dark:text-white text-sm"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                      
                      {/* Interval Input */}
                      <div className="flex items-center space-x-2">
                        <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-surface-700 dark:text-surface-300 whitespace-nowrap">
                          Every
                        </label>
                        <input
                          type="number"
                          id="recurrenceInterval"
                          min="1"
                          max="100"
                          value={currentTask.recurrence.interval}
                          onChange={(e) => setCurrentTask({
                            ...currentTask, 
                            recurrence: { 
                              ...currentTask.recurrence, 
                              interval: Math.max(1, parseInt(e.target.value) || 1)
                            }
                          })}
                          className="w-16 px-2 py-1 border border-surface-300 dark:border-surface-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-surface-800 dark:text-white text-sm"
                        />
                        <span className="text-sm text-surface-700 dark:text-surface-300">
                          {currentTask.recurrence.frequency === 'daily' ? 'day(s)' :
                           currentTask.recurrence.frequency === 'weekly' ? 'week(s)' :
                           currentTask.recurrence.frequency === 'monthly' ? 'month(s)' : 'day(s)'}
                        </span>
                      </div>
                      
                      {/* Weekly Options - Day Selection */}
                      {currentTask.recurrence.frequency === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                            Repeat on
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  const weekdays = currentTask.recurrence.weekdays || [];
                                  const updatedWeekdays = weekdays.includes(index) 
                                    ? weekdays.filter(d => d !== index) 
                                    : [...weekdays, index];
                                  setCurrentTask({
                                    ...currentTask, 
                                    recurrence: { ...currentTask.recurrence, weekdays: updatedWeekdays }
                                  });
                                }}
                                className={`w-8 h-8 rounded-full text-xs font-medium ${currentTask.recurrence.weekdays?.includes(index) ? 'bg-secondary text-white' : 'bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300'}`}
                              >{day}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Modal Footer - Actions */}
                <div className="p-5 border-t border-surface-200 dark:border-surface-700 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;