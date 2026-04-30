import React from 'react';
import { Box, Skeleton } from '@mui/material';

const glassSx = {
  p: 3,
  bgcolor: 'rgba(255, 255, 255, 0.01)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 3,
  backdropFilter: 'blur(10px)',
};

const skeletonSx = {
  bgcolor: 'rgba(255, 255, 255, 0.05)',
  '&::after': {
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)',
  },
};

function LoadingSkeleton({ type = 'table' }) {
  if (type === 'dashboard') {
    return (
      <Box sx={{ p: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={glassSx}>
              <Skeleton variant="text" width="60%" height={20} sx={skeletonSx} />
              <Skeleton variant="text" width="40%" height={48} sx={{ ...skeletonSx, my: 1 }} />
              <Skeleton variant="text" width="50%" height={16} sx={skeletonSx} />
            </Box>
          ))}
        </Box>
        <Box sx={glassSx}>
          <Skeleton variant="rectangular" height={350} sx={{ ...skeletonSx, borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (type === 'card') {
    return (
      <Box sx={glassSx}>
        <Skeleton variant="text" width="60%" height={32} sx={{ ...skeletonSx, mb: 3 }} />
        <Skeleton variant="rectangular" height={220} sx={{ ...skeletonSx, borderRadius: 2, mb: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width="25%" height={24} sx={skeletonSx} />
          <Skeleton variant="text" width="25%" height={24} sx={skeletonSx} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={glassSx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Skeleton variant="text" width="30%" height={48} sx={skeletonSx} />
        <Skeleton variant="text" width="20%" height={48} sx={skeletonSx} />
      </Box>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="text" width="100%" height={56} sx={{ ...skeletonSx, borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

export default LoadingSkeleton;