import { 
  Box, 
  VStack, 
  Text, 
  Radio, 
  RadioGroup, 
  Button, 
  //Progress, 
  Alert, 
  AlertIcon, 
  Flex,
  Spinner,
  useToast
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { createUserExercise, getUserExercises, updateUserExercise } from "../api";

const QCMExercise = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, logout, isLoading, user } = useAuth();
  const toast = useToast();

  const [exercise, setExercise] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userExercise, setUserExercise] = useState(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchExercise = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://schooldev.duckdns.org/api/exercises/${exerciseId}`);
        const exerciseData = response.data;
        
        if (exerciseData.type !== 'QCM') {
          toast({
            title: "Erreur",
            description: "Cet exercice n'est pas un QCM",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate('/lessons');
          return;
        }

        setExercise(exerciseData);
        
        // Gérer le UserExercise (vérifier l'existence avant création)
        const userId = user?.userId || user?.userid || user?.id || user?.user_id;
        
        if (user && userId && exerciseData.exerciseId) {
          try {
            const userExercisesResponse = await getUserExercises(userId);
            const existingUserExercise = userExercisesResponse.find(ue => ue.exercise.exerciseId === exerciseData.exerciseId) || null;
            
            if (existingUserExercise) {
              console.log("QCMExercise - UserExercise already exists:", existingUserExercise);
              setUserExercise(existingUserExercise);
            } else {
              console.log("QCMExercise - Creating new UserExercise - userId:", userId, "exerciseId:", exerciseData.exerciseId);
              const newUserExercise = await createUserExercise(userId, exerciseData.exerciseId, false);
              setUserExercise(newUserExercise);
            }
          } catch (userExerciseError) {
            console.warn('Erreur lors de la gestion du UserExercise:', userExerciseError);
          }
        }
        
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'exercice:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger l'exercice",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate('/lessons');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, isAuthenticated, logout, navigate, isLoading, toast, user]);

  const handleAnswerSelect = (propositionId) => {
    setSelectedAnswer(propositionId.toString());
  };

  const handleSubmitQCM = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une réponse",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedProposition = exercise.propositions.find(p => p.propositionId.toString() === selectedAnswer);
      const isCorrect = selectedProposition?.correct || false;

      // Mettre à jour le UserExercise avec le résultat
      if (userExercise && isCorrect && userExercise.success === false) {
        try {
          await updateUserExercise(userExercise.id, true);
          console.log('UserExercise mis à jour avec success=true');
        } catch (updateError) {
          console.warn('Erreur lors de la mise à jour du UserExercise:', updateError);
        }
      }

      setShowResults(true);
      
      toast({
        title: isCorrect ? "Correct !" : "Incorrect",
        description: isCorrect ? "Bonne réponse !" : "Ce n'est pas la bonne réponse",
        status: isCorrect ? "success" : "error",
        duration: 5000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre réponse",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Chargement de l&apos;exercice...</Text>
        </VStack>
      </Box>
    );
  }

  if (!exercise || !exercise.propositions || exercise.propositions.length === 0) {
    return (
      <Box minH="100vh" p={6} display="flex" alignItems="center" justifyContent="center">
        <Alert status="error">
          <AlertIcon />
          Exercice non trouvé ou aucune proposition disponible
        </Alert>
      </Box>
    );
  }

  if (showResults) {
    const selectedProposition = exercise.propositions.find(p => p.propositionId.toString() === selectedAnswer);
    const isCorrect = selectedProposition?.correct || false;
    
    return (
      <Box 
        minH="100vh" 
        p={6} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={6} w="full" maxW="lg">
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            textAlign="center"
            color="gray.900"
            _dark={{ color: "white" }}
          >
            Résultat du QCM
          </Text>
          <Text 
            fontSize="xl" 
            textAlign="center"
            color="gray.700"
            _dark={{ color: "gray.200" }}
          >
            {exercise.title}
          </Text>
          
          <Box 
            w="full" 
            p={6} 
            bg="gray.50"
            borderRadius="lg" 
            border="1px solid" 
            borderColor={isCorrect ? "green.200" : "red.200"}
            _dark={{ 
              bg: "gray.700", 
              borderColor: isCorrect ? "green.600" : "red.600" 
            }}
          >
            <VStack spacing={4}>
              <Text 
                fontSize="3xl" 
                fontWeight="bold" 
                color={isCorrect ? "green.600" : "red.600"}
                _dark={{ color: isCorrect ? "green.200" : "red.200" }}
              >
                {isCorrect ? "Correct !" : "Incorrect"}
              </Text>
              <Text 
                fontSize="lg" 
                textAlign="center"
                color="gray.700"
                _dark={{ color: "gray.200" }}
              >
                Votre réponse : {selectedProposition?.text}
              </Text>
              
              <Box 
                p={4} 
                borderRadius="md" 
                bg={isCorrect ? "green.100" : "red.100"}
                border="1px solid"
                borderColor={isCorrect ? "green.300" : "red.300"}
                _dark={{ 
                  bg: isCorrect ? "green.700" : "red.700",
                  borderColor: isCorrect ? "green.500" : "red.500"
                }}
              >
                <Text 
                  color={isCorrect ? "green.800" : "red.800"}
                  _dark={{ color: isCorrect ? "green.100" : "red.100" }}
                  fontWeight="medium"
                >
                  {isCorrect 
                    ? "Félicitations ! Vous avez donné la bonne réponse."
                    : `Ce n'est pas la bonne réponse. La bonne réponse était : ${exercise.propositions.find(p => p.correct)?.text}`
                  }
                </Text>
              </Box>
            </VStack>
          </Box>

          <Flex gap={4}>
            <Button onClick={() => navigate('/lessons')} variant="outline">
              Retour aux leçons
            </Button>
            <Button onClick={() => {
              setSelectedAnswer("");
              setShowResults(false);
            }} colorScheme="blue">
              Recommencer
            </Button>
          </Flex>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      p={6}
    >
      <VStack spacing={6} w="full" maxW="4xl" mx="auto">
        <VStack spacing={2} w="full">
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            textAlign="center"
            color="gray.900"
            _dark={{ color: "white" }}
          >
            {exercise.title}
          </Text>
          <Text 
            fontSize="sm" 
            color="gray.600"
            _dark={{ color: "gray.400" }}
          >
            QCM - 1 question
          </Text>
        </VStack>

        <Box w="full" p={6} bg="gray.50" _dark={{ bg: "gray.700" }} borderRadius="lg" shadow="md">
          <VStack spacing={6} align="stretch">
            <Text 
              fontSize="lg" 
              fontWeight="medium"
              color="gray.900"
              _dark={{ color: "white" }}
            >
              {exercise.description}
            </Text>

            <RadioGroup 
              value={selectedAnswer} 
              onChange={handleAnswerSelect}
            >
              <VStack spacing={3} align="stretch">
                {exercise.propositions.map((proposition) => (
                  <Radio 
                    key={proposition.propositionId} 
                    value={proposition.propositionId.toString()}
                    size="lg"
                    p={3}
                    borderRadius="md"
                    _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
                  >
                    <Text 
                      ml={2}
                      color="gray.900"
                      _dark={{ color: "white" }}
                    >
                      {proposition.text}
                    </Text>
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </VStack>
        </Box>

        <Flex w="full" justify="space-between" align="center">
          <Button onClick={() => navigate('/lessons')} variant="outline">
            Retour aux leçons
          </Button>

          <Button 
            onClick={handleSubmitQCM}
            colorScheme="green"
            isLoading={submitting}
            loadingText="Soumission..."
            isDisabled={!selectedAnswer}
          >
            Valider ma réponse
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
};

export default QCMExercise;