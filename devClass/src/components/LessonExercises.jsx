import { Box, VStack, Text, Icon, Flex, Button, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { FaDumbbell, FaBook, FaStar, FaArrowLeft } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const getIconForType = (type) => {
  switch(type) {
    case 'exercise': return FaDumbbell;
    case 'reading': return FaBook;
    case 'challenge': return FaStar;
    default: return FaStar;
  }
};

const LessonExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { lessonId } = useParams();

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

    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les exercices de la leçon
        const exercisesResponse = await axios.get(`https://schooldev.duckdns.org/api/exercises/lesson/${lessonId}`);
        setExercises(exercisesResponse.data);
        
        // Récupérer les informations de la leçon
        const lessonResponse = await axios.get(`https://schooldev.duckdns.org/api/lessons`);
        const currentLesson = lessonResponse.data.find(l => l.lessonId === parseInt(lessonId));
        setLesson(currentLesson);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des exercices:', error);
        setError('Impossible de charger les exercices de cette leçon');
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchExercises();
    }
  }, [lessonId, isAuthenticated, logout, navigate, isLoading]);

  if (loading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement des exercices...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box h="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <Alert status="error" maxW="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Erreur</Text>
            <Text>{error}</Text>
            <Button mt={4} onClick={() => navigate('/lessons')} leftIcon={<FaArrowLeft />}>
              Retour aux leçons
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box h="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <Alert status="warning" maxW="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Leçon introuvable</Text>
            <Button mt={4} onClick={() => navigate('/lessons')} leftIcon={<FaArrowLeft />}>
              Retour aux leçons
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  const lessonColor = getLessonColor(lesson.course?.language);

  return (
    <Box h="100vh" p={6} display="flex" flexDirection="column" alignItems="center" overflowY="auto">
      <VStack spacing={10} w="full" align="center" pb={10}>
        <Box w="full" maxW="lg">
          <Button 
            leftIcon={<FaArrowLeft />} 
            variant="ghost" 
            onClick={() => navigate('/lessons')}
            mb={4}
          >
            Retour aux leçons
          </Button>
          
          <Box w="full" bg={lessonColor} p={4} borderRadius="lg" textAlign="center" color="white">
            <Text fontSize="lg" fontWeight="bold">Lesson {lesson.orderInCourse}</Text>
            <Text fontSize="xl">{lesson.title}</Text>
          </Box>
          
          {exercises.length === 0 ? (
            <Box textAlign="center" mt={6}>
              <Text color="gray.500">Aucun exercice disponible pour cette leçon</Text>
            </Box>
          ) : (
            <VStack spacing={6} mt={6} align="center">
              {exercises.map((exercise, index) => (
                <Flex key={exercise.id} align="center" direction="row" gap={4}>
                  <Button
                    onClick={() => {
                      if (exercise.type?.toLowerCase() === 'qcm') {
                        navigate(`/exercise/${exercise.exerciseId}/qcm`);
                      } else {
                        navigate('/editor');
                      }
                    }}
                    isDisabled={index > 0}
                    borderRadius="full"
                    w={12}
                    h={12}
                    bg={index > 0 ? "gray.300" : lessonColor}
                    _hover={{ bg: index > 0 ? "gray.300" : lessonColor.replace('400', '500') }}
                    p={0}
                  >
                    <Icon as={getIconForType(exercise.type)} color={index > 0 ? "gray.500" : "white"} w={6} h={6} />
                  </Button>
                  <Text 
                    fontSize="md" 
                    fontWeight="medium"
                    color={index > 0 ? "gray.500" : "inherit"}
                  >
                    {exercise.title || exercise.description}
                  </Text>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default LessonExercises;