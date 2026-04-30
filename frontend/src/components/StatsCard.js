import React from 'react';
import { Box, Typography, Avatar, alpha } from '@mui/material';
import { motion } from 'framer-motion';

function StatsCard({ title, value, icon, color = '#FF6B35', subtitle, trend, trendValue, pulse = false }) {
  const isPositive = trendValue > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        className="glass-card"
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.01)',
          borderRadius: 3,
          p: 3,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 12px 30px ${alpha(color, 0.2)}`,
            borderColor: alpha(color, 0.4),
            '& .icon-circle': {
              transform: 'scale(1.1) rotate(-5deg)',
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
            background: `radial-gradient(circle, ${alpha(color, 0.1)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontSize: '0.65rem',
                }}
              >
                {title}
              </Typography>
              {pulse && (
                <Box
                  component={motion.div}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }}
                />
              )}
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#fff',
                mt: 0.5,
                mb: 0.5,
                letterSpacing: '-0.04em',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 600, fontSize: '0.75rem' }}
              >
                {subtitle}
              </Typography>
            )}
            {trendValue !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.2, 
                  px: 0.8, 
                  py: 0.2, 
                  borderRadius: 1, 
                  bgcolor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: isPositive ? '#10B981' : '#EF4444',
                      fontSize: '0.65rem',
                    }}
                  >
                    {isPositive ? '↑' : '↓'} {Math.abs(trendValue)}%
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.2)', fontWeight: 600, fontSize: '0.65rem' }}>
                  VS BASELINE
                </Typography>
              </Box>
            )}
          </Box>

          <Avatar
            className="icon-circle"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 52,
              height: 52,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              border: `1px solid ${alpha(color, 0.2)}`,
              flexShrink: 0,
              boxShadow: `0 8px 20px ${alpha(color, 0.1)}`
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
          </Avatar>
        </Box>
      </Box>
    </motion.div>
  );
}

export default StatsCard;