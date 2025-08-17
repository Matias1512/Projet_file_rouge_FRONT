import { Box, Button, Flex, Heading, Progress, Text, useColorModeValue, Badge } from "@chakra-ui/react"
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth";

import axios from "axios";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [coursesProgress, setCoursesProgress] = useState({});
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get('https://schooldev.duckdns.org/api/courses');
        setCourses(response.data);
        
        // Calculate progress for each course
        await calculateCoursesProgress(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    const calculateCoursesProgress = async (coursesList) => {
      if (!user) {
        return;
      }
      
      // Try different possible user ID fields from JWT
      const userId = user.id || user.userId || user.sub || user.user_id;
      
      if (!userId) {
        return;
      }

      const progressData = {};
      
      for (const course of coursesList) {
        try {
          const progressResponse = await axios.get(`https://schooldev.duckdns.org/api/progress/user/${userId}/course/${course.courseId}/percentage`);
          const progressPercentage = Math.round(progressResponse.data);
          
          progressData[course.courseId] = {
            percentage: progressPercentage
          };
          
        } catch (error) {
          console.error(`Erreur lors de la récupération de la progression pour le cours ${course.courseId}:`, error);
          progressData[course.courseId] = {
            percentage: 0
          };
        }
      }
      
      setCoursesProgress(progressData);
    };

    fetchCourses();
  }, [isAuthenticated, logout, navigate, isLoading, user]);

  const bgPage = useColorModeValue("white", "gray.800");

  return (
    <Box w="100%" h="100%" bg={bgPage} p={0} overflow="hidden">
      <Flex 
        direction="row" 
        w="100%" 
        h="100%" 
        overflowX="auto" 
        overflowY="hidden"
        css={{
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        {courses.map((course, index) => {
          const courseProgress = coursesProgress[course.courseId] || { percentage: 0 };
          const previousCourseProgress = index > 0 ? coursesProgress[courses[index - 1].courseId] : null;
          const isLocked = index > 0 && (!previousCourseProgress || previousCourseProgress.percentage < 100);
          
          return (
            <Box key={course.courseId} minW="20vw" h="100%" flexShrink={0}>
              <CoursesCard course={course} isLocked={isLocked} progress={courseProgress} />
            </Box>
          );
        })}
      </Flex>
    </Box>
  )
}

function CoursesCard({ course, isLocked, progress }) {
  const navigate = useNavigate()

  const cardBg = useColorModeValue("white", "gray.900");
  const cardText = useColorModeValue("gray.800", "white");
  const languageColors = {
    'JAVA': '#f89500',
    'PYTHON': '#3776ab',
    'ANGULAR': '#dd0031',
    'PHP': '#777bb4'
  };
  
  const languageColor = languageColors[course.language?.toUpperCase()] || '#666';
  
  const getDifficultyColor = (level) => {
    switch(level?.toUpperCase()) {
      case 'EASY': return 'green';
      case 'MEDIUM': return 'orange';
      case 'HARD': return 'red';
      default: return 'blue';
    }
  };

  const getDifficultyLabel = (level) => {
    switch(level?.toUpperCase()) {
      case 'EASY': return 'FACILE';
      case 'MEDIUM': return 'MOYEN';
      case 'HARD': return 'DIFFICILE';
      default: return 'DÉBUTANT';
    }
  };

  return (
    <Box 
      position="relative"
      h="100%"
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="visible"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bg={cardBg}
        border="2px solid"
        borderColor={languageColor}
        opacity={isLocked ? 0.5 : 1}
      />
      
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        h="100%"
        w="100%"
        gap={6}
        opacity={isLocked ? 0.4 : 1}
        filter={isLocked ? "grayscale(100%)" : "none"}
      >
        <img
          src="/images/mascotte.png"
          alt={`${course.language} mascot`}
          width="350"
          height="350"
        />

        <Flex direction="column" align="center" gap={2}>
          <Badge colorScheme={getDifficultyColor(course.difficultyLevel)} fontSize="sm" px={3} py={1}>
            {getDifficultyLabel(course.difficultyLevel)}
          </Badge>
          <Heading as="h2" size="lg" color={cardText} textAlign="center" fontWeight="bold">
            {course.title}
          </Heading>
        </Flex>

        <Flex align="center" gap={3} w="300px">
          <Progress value={progress.percentage} size="md" colorScheme="green" bg="white" flex="1" />
          <Text color={cardText} fontSize="md" fontWeight="bold">
            {progress.percentage}%
          </Text>
        </Flex>

        {isLocked && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={3}
            fontSize="6xl"
            opacity={0.3}
          >
            🔒
          </Box>
        )}

        <Button 
          colorScheme={isLocked ? "gray" : "red"} 
          size="md" 
          fontWeight="bold" 
          px={8}
          onClick={() => !isLocked && navigate(`/lessons/${course.courseId}`)}
          disabled={isLocked}
        >
          {isLocked ? "VERROUILLÉ" : "CONTINUER"}
        </Button>
      </Flex>
    </Box>
  )
}

CoursesCard.propTypes = {
  course: PropTypes.shape({
    courseId: PropTypes.number.isRequired,
    language: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    difficultyLevel: PropTypes.string
  }).isRequired,
  isLocked: PropTypes.bool.isRequired,
  progress: PropTypes.shape({
    percentage: PropTypes.number.isRequired
  }).isRequired
};
