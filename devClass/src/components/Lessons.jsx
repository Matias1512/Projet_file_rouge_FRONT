import { Box, VStack, Text, Icon, Flex, Button } from "@chakra-ui/react";
import { FaBook } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Lessons = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [setCurrentLesson] = useState(null);
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const getLessonColor = (language) => {
    if (language?.toLowerCase() === 'java') {
      return "red.400";
    }
    return "blue.400";
  };

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchLessons = async () => {
      try {
        const response = await axios.get('https://schooldev.duckdns.org/api/lessons');
        setLessons(response.data);
        if (response.data.length > 0) {
          setCurrentLesson(response.data[0]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des leçons:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    fetchLessons();
  }, [isAuthenticated, logout, navigate, isLoading]);

  if (lessons.length === 0) {
    return (
      <Box minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <Text>Chargement des leçons...</Text>
      </Box>
    );
  }

  return (
    <Box h="100vh" p={6} display="flex" flexDirection="column" alignItems="center" overflowY="auto">
      <VStack spacing={10} w="full" align="center" pb={10}>
        {lessons.map((lesson, lessonIndex) => {
          const lessonColor = getLessonColor(lesson.course?.language);
          return (
            <Box key={lesson.lessonId} w="full" mb={10}>
              <Box w="lg" bg={lessonColor} p={4} borderRadius="lg" margin="auto" textAlign="center" color={"white"}>
                <Text fontSize="lg" fontWeight="bold">Lesson {lesson.orderInCourse || lessonIndex + 1}</Text>
                <Text fontSize="xl">{lesson.title || `Leçon ${lessonIndex + 1}`}</Text>
              </Box>
              <VStack spacing={6} mt={6} align="center">
                <Flex align="center" direction="row" position="relative">
                  {hoveredItem === lesson.lessonId && (
                    <Box
                      position="absolute"
                      right="-170px"
                      bg={lessonColor}
                      color={"white"}
                      p={2}
                      borderRadius="md"
                      width="150px"
                      textAlign="center"
                      zIndex="1"
                    >
                      {lesson.title}
                    </Box>
                  )}
                  <Button
                    onMouseEnter={() => setHoveredItem(lesson.lessonId)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => console.log("Clicked", lesson.title)}
                    isDisabled={lessonIndex > 0}
                    borderRadius="full"
                    w={12}
                    h={12}
                    bg={lessonIndex > 0 ? "gray.300" : lessonColor}
                    _hover={{ bg: lessonIndex > 0 ? "gray.300" : lessonColor.replace('400', '500') }}
                    p={0}
                  >
                    <Icon as={FaBook} color={lessonIndex > 0 ? "gray.500" : "white"} w={6} h={6} />
                  </Button>
                </Flex>
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Lessons;
