import { Box, Button, Text, useToast, VStack, HStack, Badge, Divider} from "@chakra-ui/react";
import { useState } from "react";
import PropTypes from 'prop-types';
import { executeCode, getUserExercises, updateUserExercise } from "../api";
import { useAuth } from "../hooks/useAuth";

const Output = ({editorRef, language, exercise}) => {
    const toast = useToast();
    const { user } = useAuth();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [testResults, setTestResults] = useState(null);

    const runCode = async () => {
        // eslint-disable-next-line react/prop-types
        const sourceCode = editorRef.current.getValue();
        if(!sourceCode) return;
        try {
            setIsLoading(true);
            const { run: result } = await executeCode(language, sourceCode);
            const outputLines = result.output.split("\n");
            setOutput(outputLines);
            result.stderr ? setIsError(true) : setIsError(false);
            
            // Si c'est un exercice avec des test cases, vérifier les résultats
            if (exercise && exercise.testCases && exercise.testCases.trim().length > 0) {
                await checkTestCases(result.output.trim(), exercise.testCases);
            }
        } catch (error) {
            console.log(error);
            toast({
              title: "An error occurred.",
              description: error.message || "Unable to run code",
              status: "error",
              duration: 6000,
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    const checkTestCases = async (actualOutput, testCases) => {
        // Si testCases est un texte, on le traite comme un seul test case
        const expectedOutput = testCases.trim();
        const matches = actualOutput === expectedOutput;
        
        const results = [{
            index: 1,
            expected: expectedOutput,
            actual: actualOutput,
            passed: matches
        }];
        
        setTestResults(results);
        
        // Vérifier si tous les tests passent
        const allPassed = results.every(result => result.passed);
        
        // Si tous les tests passent, marquer l'exercice comme réussi
        if (allPassed && user && exercise) {
            try {
                const userExercises = await getUserExercises(user.userId);
                const userExercise = userExercises.find(ue => 
                    ue.exercise.exerciseId === exercise.exerciseId
                );
                
                if (userExercise && !userExercise.success) {
                    await updateUserExercise(userExercise.id, true);
                    toast({
                        title: "🎉 Exercice réussi !",
                        description: "Tous les tests sont passés. L'exercice a été marqué comme réussi.",
                        status: "success",
                        duration: 6000,
                    });
                } else if (userExercise && userExercise.success) {
                    toast({
                        title: "Tous les tests réussis!",
                        description: "L'exercice était déjà marqué comme réussi.",
                        status: "success",
                        duration: 4000,
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour de UserExercise:', error);
                toast({
                    title: "Tous les tests réussis!",
                    description: "Impossible de sauvegarder le progrès, mais tous les tests sont passés.",
                    status: "warning",
                    duration: 4000,
                });
            }
        } else {
            toast({
                title: allPassed ? "Tous les tests réussis!" : "Certains tests ont échoué",
                description: `${results.filter(r => r.passed).length}/${results.length} tests réussis`,
                status: allPassed ? "success" : "warning",
                duration: 4000,
            });
        }
    }
    
    return (
        <Box w='50%'>
            <Text mb={2} fontSize='lg'>Output</Text>
            <Button variant='outline' colorScheme="green" mb={4} isLoading={isLoading} onClick={runCode}>
                Run Code
            </Button>
            
            <VStack spacing={4} align="stretch">
                {/* Zone d'output standard */}
                <Box
                    height={testResults ? '40vh' : '75vh'}
                    p={2}
                    color={isError ? 'red.400' : ""}
                    border='1px solid'
                    borderRadius={4}
                    borderColor={isError ? 'red.500' : '#333'}
                >
                    {output
                        ? output.map((line, i) => <Text key={i}>{line}</Text>)
                        : 'Click "Run Code" to see the output here'}
                </Box>
                
                {/* Zone des résultats de tests */}
                {testResults && (
                    <Box>
                        <Divider mb={2} />
                        <Text fontSize='md' fontWeight='bold' mb={2}>
                            Résultats des Tests
                        </Text>
                        <Box
                            height='30vh'
                            p={2}
                            border='1px solid'
                            borderRadius={4}
                            borderColor='#333'
                            overflowY='auto'
                        >
                            <VStack spacing={2} align="stretch">
                                {testResults.map((result) => (
                                    <Box key={result.index} p={2} border='1px solid' borderRadius={4}
                                         borderColor={result.passed ? 'green.500' : 'red.500'}>
                                        <HStack justify="space-between" mb={1}>
                                            <Text fontSize='sm' fontWeight='bold'>Test {result.index}</Text>
                                            <Badge colorScheme={result.passed ? 'green' : 'red'}>
                                                {result.passed ? 'RÉUSSI' : 'ÉCHOUÉ'}
                                            </Badge>
                                        </HStack>
                                        <Text fontSize='xs' color='gray.500'>Attendu: {result.expected}</Text>
                                        <Text fontSize='xs' color='gray.500'>Obtenu: {result.actual}</Text>
                                    </Box>
                                ))}
                            </VStack>
                        </Box>
                    </Box>
                )}
            </VStack>
        </Box>
    )
}

Output.propTypes = {
    editorRef: PropTypes.shape({
        current: PropTypes.object
    }).isRequired,
    language: PropTypes.string.isRequired,
    exercise: PropTypes.shape({
        exerciseId: PropTypes.number,
        testCases: PropTypes.string
    })
};

export default Output;