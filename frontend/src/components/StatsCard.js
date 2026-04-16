import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

function StatsCard({ title, value, icon, color = '#FF6B35', subtitle, trend, trendValue }) {
  const isPositive = trendValue > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          p: 3,
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 12px 30px ${color}20`,
            borderColor: color,
            '& .icon-circle': {
              transform: 'scale(1.08)',
            },
          },
        }}
      >
        {/* Background accent */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `${color}10`,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#9CA3AF',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.7rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1A1A2E',
                mt: 0.5,
                mb: 0.5,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: '#9CA3AF', fontWeight: 500, fontSize: '0.75rem' }}
              >
                {subtitle}
              </Typography>
            )}
            {trendValue !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: isPositive ? '#10B981' : '#EF4444',
                    fontSize: '0.75rem',
                  }}
                >
                  {isPositive ? '↑' : '↓'} {Math.abs(trendValue)}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                  vs last week
                </Typography>
              </Box>
            )}
          </Box>

          <Avatar
            className="icon-circle"
            sx={{
              bgcolor: `${color}15`,
              color: color,
              width: 52,
              height: 52,
              transition: 'transform 0.25s ease',
              border: `2px solid ${color}25`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </Box>
    </motion.div>
  );
}

export default StatsCard;