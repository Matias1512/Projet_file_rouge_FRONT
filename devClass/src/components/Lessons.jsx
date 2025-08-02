import { Box, VStack, Text, Icon, Flex, Button, Spinner } from "@chakra-ui/react";
import { FaBook, FaDumbbell, FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const getIconForType = (type) => {
  switch(type?.toLowerCase()) {
    case 'exercise': return FaDumbbell;
    case 'reading': return FaBook;
    case 'challenge': return FaStar;
    case 'qcm': return FaStar;
    default: return FaStar;
  }
};

const Lessons = () => {
  const [lessons, setLessons] = useState([]);
  const [exercisesByLesson, setExercisesByLesson] = useState({});
  const [loadingExercises, setLoadingExercises] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
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
        
        // Récupérer les exercices pour chaque leçon
        const exercisesPromises = response.data.map(async (lesson) => {
          setLoadingExercises(prev => ({ ...prev, [lesson.lessonId]: true }));
          try {
            const exercisesResponse = await axios.get(`https://schooldev.duckdns.org/api/exercises/lesson/${lesson.lessonId}`);
            return { lessonId: lesson.lessonId, exercises: exercisesResponse.data || [] };
          } catch (error) {
            // Ne pas considérer comme une erreur critique si une leçon n'a pas d'exercices
            if (error.response?.status === 404) {
              console.log(`Aucun exercice trouvé pour la leçon ${lesson.lessonId}`);
            } else {
              console.error(`Erreur lors de la récupération des exercices pour la leçon ${lesson.lessonId}:`, error);
            }
            return { lessonId: lesson.lessonId, exercises: [] };
          } finally {
            setLoadingExercises(prev => ({ ...prev, [lesson.lessonId]: false }));
          }
        });

        const exercisesResults = await Promise.all(exercisesPromises);
        const exercisesMap = {};
        exercisesResults.forEach(result => {
          exercisesMap[result.lessonId] = result.exercises;
        });
        setExercisesByLesson(exercisesMap);
        
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
          const exercises = exercisesByLesson[lesson.lessonId];
          const exercisesArray = Array.isArray(exercises) ? exercises : [];
          
          return (
            <Box key={lesson.lessonId} w="full" mb={10}>
              <Box w="lg" bg={lessonColor} p={4} borderRadius="lg" margin="auto" textAlign="center" color={"white"}>
                <Text fontSize="lg" fontWeight="bold">Lesson {lesson.orderInCourse || lessonIndex + 1}</Text>
                <Text fontSize="xl">{lesson.title || `Leçon ${lessonIndex + 1}`}</Text>
              </Box>
              <VStack spacing={6} mt={6} align="center">
                {loadingExercises[lesson.lessonId] ? (
                  <Flex align="center" gap={2}>
                    <Spinner size="sm" />
                    <Text fontSize="sm" color="gray.500">Chargement des exercices...</Text>
                  </Flex>
                ) : exercisesArray.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">Cette leçon ne contient pas d&apos;exercices interactifs</Text>
                ) : (
                  <VStack spacing={3} align="center">
                    {exercisesArray.map((exercise, exerciseIndex) => (
                      <Flex key={exercise.exerciseId} align="center" direction="row" gap={4}>
                        <Button
                          onClick={() => {
                            console.log("Clicked exercise", exercise.title, "Type:", exercise.type, "ID:", exercise.exerciseId);
                            if (exercise.type?.toLowerCase() === 'exercise') {
                              navigate('/editor');
                            } else if (exercise.type?.toLowerCase() === 'qcm') {
                              navigate(`/exercise/${exercise.exerciseId}/qcm`);
                            }
                          }}
                          isDisabled={lessonIndex > 0 || exerciseIndex > 0}
                          borderRadius="full"
                          w={12}
                          h={12}
                          bg={(lessonIndex > 0 || exerciseIndex > 0) ? "gray.300" : lessonColor}
                          _hover={{ bg: (lessonIndex > 0 || exerciseIndex > 0) ? "gray.300" : lessonColor.replace('400', '500') }}
                          p={0}
                        >
                          <Icon 
                            as={getIconForType(exercise.type)} 
                            color={(lessonIndex > 0 || exerciseIndex > 0) ? "gray.500" : "white"} 
                            w={6} 
                            h={6} 
                          />
                        </Button>
                        <Text 
                          fontSize="md" 
                          fontWeight="medium"
                          color={(lessonIndex > 0 || exerciseIndex > 0) ? "gray.500" : "inherit"}
                        >
                          {exercise.title}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
};

export default Lessons;
