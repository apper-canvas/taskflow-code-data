import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Import icons as components
const CheckCircleIcon = getIcon('CheckCircle');
const ListTodoIcon = getIcon('Clipboard');
const ClockIcon = getIcon('Timer');
const UserIcon = getIcon('UserCircle');
const RepeatIcon = getIcon('Repeat');

function Home() {
  const [statsSummary, setStatsSummary] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const now = new Date();
      
      const stats = {
        total: storedTasks.length,
        completed: storedTasks.filter(task => task.status === 'Completed').length,
        inProgress: storedTasks.filter(task => task.status === 'In Progress').length,
        overdue: storedTasks.filter(task => 
          task.status !== 'Completed' && 
          new Date(task.dueDate) < now
        ).length
      };
      
      setStatsSummary(stats);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 md:mb-0"
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                TaskFlow
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                Organize your tasks, boost your productivity
              </p>
            </motion.div>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center"
            >
              <button
                onClick={() => toast.info("This would open your profile!")}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden md:inline">Welcome, Guest</span>
              </button>
            </motion.div> 
          </div>
        </div>
      </header>

      {/* Stats Cards Section */}
      <section className="bg-surface-100 dark:bg-surface-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Total Tasks Card */}
            <motion.div variants={itemVariants} className="neu-card flex items-center space-x-4">
              <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full">
                <ListTodoIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium dark:text-white">Total Tasks</h3>
                <p className="text-2xl font-bold text-primary">{statsSummary.total}</p>
              </div>
            </motion.div>
            
            {/* Completed Tasks Card */}
            <motion.div variants={itemVariants} className="neu-card flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium dark:text-white">Completed</h3>
                <p className="text-2xl font-bold text-green-500">{statsSummary.completed}</p>
              </div>
            </motion.div>
            
            {/* In Progress Tasks Card */}
            <motion.div variants={itemVariants} className="neu-card flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-full">
                <getIcon('Hourglass') className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium dark:text-white">In Progress</h3>
                <p className="text-2xl font-bold text-blue-500">{statsSummary.inProgress}</p>
              </div>
            </motion.div>
            
            {/* Overdue Tasks Card */}
            <motion.div variants={itemVariants} className="neu-card flex items-center space-x-4">
              <div className="p-3 bg-red-500/10 dark:bg-red-500/20 rounded-full">
                <getIcon('AlarmExclamation') className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium dark:text-white">Overdue</h3>
                <p className="text-2xl font-bold text-red-500">{statsSummary.overdue}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <motion.section 
        className="flex-grow bg-surface-50 dark:bg-surface-900 py-6 md:py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MainFeature setStatsSummary={setStatsSummary} />
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-surface-200 dark:bg-surface-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => toast.info("Feature coming soon!")}
                className="text-surface-600 dark:text-surface-400 text-sm hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                About
              </button>
              <button
                onClick={() => toast.info("Feature coming soon!")}
                className="text-surface-600 dark:text-surface-400 text-sm hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => toast.info("Feature coming soon!")}
                className="text-surface-600 dark:text-surface-400 text-sm hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;