import { Box, VStack, Text, Icon, Flex, Button, Spinner } from "@chakra-ui/react";
import { FaBook, FaDumbbell, FaStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createUserExercise, getUserExercises } from "../api";

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
  const [userExercises, setUserExercises] = useState([]);
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const getLessonColor = (language) => {
    if (language?.toLowerCase() === 'java') {
      return "red.400";
    }
    return "blue.400";
  };

  // Nouvelle logique de déverrouillage des exercices
  const isExerciseUnlocked = (lessonIndex, exerciseIndex) => {
    // Le premier exercice de la première leçon est toujours déverrouillé
    if (lessonIndex === 0 && exerciseIndex === 0) {
      return true;
    }

    // Vérifier si l'exercice précédent dans la même leçon est complété
    if (exerciseIndex > 0) {
      const currentLessonExercises = exercisesByLesson[lessons[lessonIndex].lessonId] || [];
      const previousExercise = currentLessonExercises[exerciseIndex - 1];
      
      if (previousExercise) {
        const previousUserExercise = userExercises.find(ue => 
          ue.exercise.exerciseId === previousExercise.exerciseId
        );
        return previousUserExercise && previousUserExercise.success === true;
      }
      return false;
    }

    // Premier exercice d'une leçon (exerciseIndex === 0)
    // Vérifier si tous les exercices de la leçon précédente sont complétés
    if (lessonIndex > 0) {
      const previousLesson = lessons[lessonIndex - 1];
      const previousLessonExercises = exercisesByLesson[previousLesson.lessonId] || [];
      
      // Si la leçon précédente n'a pas d'exercices, débloquer cette leçon
      if (previousLessonExercises.length === 0) {
        return true;
      }
      
      // Vérifier que tous les exercices de la leçon précédente sont complétés avec succès
      return previousLessonExercises.every(prevExercise => {
        const prevUserExercise = userExercises.find(ue => 
          ue.exercise.exerciseId === prevExercise.exerciseId
        );
        return prevUserExercise && prevUserExercise.success === true;
      });
    }

    return false;
  };

  // Vérifier si un exercice est complété avec succès
  const isExerciseCompleted = (exercise) => {
    const userExercise = userExercises.find(ue => 
      ue.exercise.exerciseId === exercise.exerciseId
    );
    return userExercise && userExercise.success === true;
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
          // Trier les exercices par exerciseId pour garantir l'ordre
          exercisesMap[result.lessonId] = result.exercises.sort((a, b) => a.exerciseId - b.exerciseId);
        });
        setExercisesByLesson(exercisesMap);

        // Récupérer les UserExercises de l'utilisateur
        if (user && user.userId) {
          try {
            const userExercisesResponse = await getUserExercises(user.userId);
            setUserExercises(userExercisesResponse);
          } catch (userExerciseError) {
            console.warn('Erreur lors de la récupération des UserExercises:', userExerciseError);
            setUserExercises([]);
          }
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
  }, [isAuthenticated, logout, navigate, isLoading, user]);

  const handleExerciseStart = async (exercise) => {
    if (user && user.userId && exercise.exerciseId) {
      try {
        let userExercisesResponse = await getUserExercises(user.userId);
        const existingUserExercise = userExercisesResponse.find(ue => ue.exercise.exerciseId === exercise.exerciseId);
        
        if (!existingUserExercise) {
          await createUserExercise(user.userId, exercise.exerciseId, false);
          
          // Rafraîchir la liste des UserExercises
          userExercisesResponse = await getUserExercises(user.userId);
          setUserExercises(userExercisesResponse);
        }
      } catch (userExerciseError) {
        // Ne pas bloquer l'utilisateur si la création échoue
        console.warn('Erreur lors de la gestion du UserExercise:', userExerciseError);
      }
    }

    // Naviguer vers l'exercice
    if (exercise.type?.toLowerCase() === 'qcm') {
      navigate(`/exercise/${exercise.exerciseId}/qcm`);
    } else {
      navigate(`/editor?exerciseId=${exercise.exerciseId}`);
    }
  };

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
                    {exercisesArray.map((exercise, exerciseIndex) => {
                      const isUnlocked = isExerciseUnlocked(lessonIndex, exerciseIndex);
                      const isCompleted = isExerciseCompleted(exercise);
                      
                      return (
                        <Flex key={exercise.exerciseId} align="center" direction="row" gap={4}>
                          <Button
                            onClick={() => handleExerciseStart(exercise)}
                            isDisabled={!isUnlocked}
                            borderRadius="full"
                            w={12}
                            h={12}
                            bg={isCompleted ? "green.400" : (isUnlocked ? lessonColor : "gray.300")}
                            _hover={{ 
                              bg: isCompleted ? "green.500" : (isUnlocked ? lessonColor.replace('400', '500') : "gray.300")
                            }}
                            p={0}
                          >
                            <Icon 
                              as={getIconForType(exercise.type)} 
                              color={isUnlocked ? "white" : "gray.500"} 
                              w={6} 
                              h={6} 
                            />
                          </Button>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium"
                            color={isUnlocked ? "inherit" : "gray.500"}
                          >
                            {exercise.title}
                            {isCompleted && " ✓"}
                          </Text>
                        </Flex>
                      );
                    })}
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
