import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

// Import icons as components
const HomeIcon = getIcon('Home');
const AlertTriangleIcon = getIcon('AlertTriangle');

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      <motion.div 
        className="glass-card max-w-lg w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mx-auto w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6"
        >
          <AlertTriangleIcon className="w-12 h-12 text-orange-500" />
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-surface-800 dark:text-surface-100 mb-2">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-surface-700 dark:text-surface-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <motion.button
          onClick={() => navigate('/')}
          className="btn btn-primary inline-flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HomeIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFound;