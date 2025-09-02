import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  IconButton, 
  Typography, 
  useTheme,
  Paper,
  Chip,
  Fade,
  useMediaQuery
} from '@mui/material';
import { 
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MobileStepper from '@mui/material/MobileStepper';

export const ProductBanner = ({ images, autoPlayInterval = 5000 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const carouselRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const maxSteps = images.length;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered || isDragging) return;

    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, isDragging, maxSteps, autoPlayInterval]);

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + maxSteps) % maxSteps);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Touch and mouse drag handling
  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    setDragStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const offset = clientX - dragStartX;
    setDragOffset(offset);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        handleBack();
      } else {
        handleNext();
      }
    }
    setDragOffset(0);
  };

  // Add event listeners for drag
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleMouseDown = (e) => handleDragStart(e);
    const handleMouseMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchStart = (e) => handleDragStart(e);
    const handleTouchMove = (e) => handleDragMove(e);
    const handleTouchEnd = () => handleDragEnd();

    carousel.addEventListener('mousedown', handleMouseDown);
    carousel.addEventListener('mousemove', handleMouseMove);
    carousel.addEventListener('mouseup', handleMouseUp);
    carousel.addEventListener('mouseleave', handleMouseUp);
    carousel.addEventListener('touchstart', handleTouchStart);
    carousel.addEventListener('touchmove', handleTouchMove);
    carousel.addEventListener('touchend', handleTouchEnd);

    return () => {
      carousel.removeEventListener('mousedown', handleMouseDown);
      carousel.removeEventListener('mousemove', handleMouseMove);
      carousel.removeEventListener('mouseup', handleMouseUp);
      carousel.removeEventListener('mouseleave', handleMouseUp);
      carousel.removeEventListener('touchstart', handleTouchStart);
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStartX, dragOffset]);

  return (
    <Box
      ref={carouselRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '300px' : isMedium ? '400px' : '500px',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        '&:hover .banner-controls': {
          opacity: 1,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner Images */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          >
            <Box
              component="img"
              src={images[activeStep]}
              alt={`Banner ${activeStep + 1}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.9)',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
            
            {/* Overlay with content */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                p: 4,
              }}
            >
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography
                    variant={isMobile ? 'h4' : isMedium ? 'h3' : 'h2'}
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      mb: 2,
                    }}
                  >
                    Discover Amazing Products
                  </Typography>
                  <Typography
                    variant={isMobile ? 'body1' : 'h6'}
                    sx={{
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      mb: 3,
                      maxWidth: '600px',
                    }}
                  >
                    Shop from thousands of trusted sellers with quality guaranteed
                  </Typography>
                  <Chip
                    label={`${activeStep + 1} of ${maxSteps}`}
                    color="primary"
                    variant="filled"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Box>
              </Fade>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Navigation Controls */}
      <Box
        className="banner-controls"
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <IconButton
          onClick={handleBack}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeftIcon />
        </IconButton>

        <IconButton
          onClick={handleNext}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowRightIcon />
        </IconButton>
      </Box>

      {/* Top Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 1,
        }}
      >
        <Paper
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            p: 0.5,
          }}
        >
          <IconButton
            onClick={toggleAutoPlay}
            size="small"
            sx={{
              color: isAutoPlaying ? 'success.main' : 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.1)',
              },
            }}
          >
            {isAutoPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
        </Paper>
      </Box>

      {/* Progress Indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Paper
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            px: 2,
            py: 1,
          }}
        >
          <MobileStepper
            steps={maxSteps}
            position="static"
            activeStep={activeStep}
            sx={{
              bgcolor: 'transparent',
              '& .MuiMobileStepper-dot': {
                bgcolor: 'rgba(0,0,0,0.3)',
                '&.MuiMobileStepper-dotActive': {
                  bgcolor: 'primary.main',
                },
              },
            }}
          />
        </Paper>
      </Box>

      {/* Step Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <Paper
          sx={{
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="caption" fontWeight={600}>
            {activeStep + 1} / {maxSteps}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
