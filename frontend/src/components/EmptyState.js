import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

function EmptyState({ icon, title, description, actionText, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 10,
          px: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 107, 53, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            color: '#FF6B35',
            border: '2px dashed rgba(255, 107, 53, 0.3)',
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, color: '#fff', mb: 1, letterSpacing: '-0.02em' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: '#9CA3AF', maxWidth: 380, lineHeight: 1.7, mb: 3 }}
        >
          {description}
        </Typography>
        {actionText && onAction && (
          <Button
            variant="contained"
            onClick={onAction}
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
              boxShadow: '0 4px 14px rgba(255, 107, 53, 0.35)',
              borderRadius: 10,
              px: 4,
              py: 1.2,
              fontWeight: 600,
            }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </motion.div>
  );
}

export default EmptyState;