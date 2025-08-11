import { Box, Button, Text, useToast, VStack, HStack, Badge, Divider, Alert, AlertIcon, AlertTitle, AlertDescription} from "@chakra-ui/react";
import { useState } from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { executeCode, getUserExercises, updateUserExercise } from "../api";
import { useAuth } from "../hooks/useAuth";
import { CODE_SNIPPETS } from "../constants";

const Output = ({editorRef, language, exercise, onChallengeCompleted}) => {
    const toast = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isExerciseCompleted, setIsExerciseCompleted] = useState(false);

    const runCode = async () => {
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
    
    const handleRestart = () => {
        // Remettre le code de départ ou le snippet par défaut
        if (exercise && exercise.starterCode) {
            editorRef.current.setValue(exercise.starterCode);
        } else {
            editorRef.current.setValue(CODE_SNIPPETS[language] || CODE_SNIPPETS.javascript);
        }
        
        // Réinitialiser les états
        setOutput(null);
        setTestResults(null);
        setIsExerciseCompleted(false);
        setIsError(false);
        
        toast({
            title: "Exercice réinitialisé",
            description: "Vous pouvez recommencer l'exercice",
            status: "info",
            duration: 2000,
        });
    };
    
    const handleReturnToLessons = () => {
        navigate('/lessons');
    };
    
    const checkTestCases = async (actualOutput, testCases) => {
        let results = [];
        
        // Validation spéciale pour l'exerciceId 7
        if (exercise && exercise.exerciseId === 7) {
            const sourceCode = editorRef.current.getValue();
            
            // Test 1: Vérifier que l'output contient les messages attendus
            const expectedOutput = testCases.trim();
            // Normaliser les sauts de ligne et supprimer les espaces en trop
            const normalizedActual = actualOutput.replace(/\r\n/g, '\n').replace(/\n+$/, '').trim();
            const normalizedExpected = expectedOutput.replace(/\r\n/g, '\n').replace(/^ +/gm, '').trim();
            const outputMatches = normalizedActual === normalizedExpected;
            
            // Test 2: Vérifier qu'il y a exactement deux instructions System.out.println
            const printlnMatches = (sourceCode.match(/System\.out\.println/g) || []).length === 2;
            
            results = [
                {
                    index: 1,
                    expected: normalizedExpected,
                    actual: normalizedActual,
                    passed: outputMatches,
                    description: "Sortie attendue"
                },
                {
                    index: 2,
                    expected: "Deux instructions System.out.println",
                    actual: `${(sourceCode.match(/System\.out\.println/g) || []).length} instruction(s) trouvée(s)`,
                    passed: printlnMatches,
                    description: "Nombre d'instructions d'affichage"
                }
            ];
        } 
        // Validation spéciale pour l'exerciceId 8
        else if (exercise && exercise.exerciseId === 8) {
            const sourceCode = editorRef.current.getValue();
            
            // Test 1: Vérifier que l'output contient la valeur attendue
            const expectedOutput = testCases.trim();
            const normalizedActual = actualOutput.replace(/\r\n/g, '\n').replace(/\n+$/, '').trim();
            const normalizedExpected = expectedOutput.replace(/\r\n/g, '\n').trim();
            const outputMatches = normalizedActual === normalizedExpected;
            
            // Test 2: Vérifier qu'une variable int age = 25 est déclarée
            const ageDeclarationRegex = /int\s+age\s*=\s*25\s*;/;
            const hasAgeDeclaration = ageDeclarationRegex.test(sourceCode);
            
            // Test 3: Vérifier qu'il y a une instruction System.out.println avec age
            const printAgeRegex = /System\.out\.println\s*\(\s*age\s*\)/;
            const hasPrintAge = printAgeRegex.test(sourceCode);
            
            results = [
                {
                    index: 1,
                    expected: normalizedExpected,
                    actual: normalizedActual,
                    passed: outputMatches,
                    description: "Sortie attendue (25)"
                },
                {
                    index: 2,
                    expected: "Déclaration: int age = 25;",
                    actual: hasAgeDeclaration ? "Variable age déclarée correctement" : "Variable age non trouvée ou incorrecte",
                    passed: hasAgeDeclaration,
                    description: "Déclaration de la variable age"
                },
                {
                    index: 3,
                    expected: "System.out.println(age);",
                    actual: hasPrintAge ? "Instruction d'affichage trouvée" : "Instruction d'affichage de age non trouvée",
                    passed: hasPrintAge,
                    description: "Affichage de la variable age"
                }
            ];
        }
        // Validation spéciale pour l'exerciceId 9
        else if (exercise && exercise.exerciseId === 9) {
            const sourceCode = editorRef.current.getValue();
            
            // Test 1: Vérifier que l'output contient une valeur (le prénom)
            const hasOutput = actualOutput.trim().length > 0;
            
            // Test 2: Vérifier qu'une variable String prenom est déclarée
            const prenomDeclarationRegex = /String\s+prenom\s*=\s*"[^"]+"\s*;/;
            const hasPrenomDeclaration = prenomDeclarationRegex.test(sourceCode);
            
            // Test 3: Vérifier qu'il y a une instruction System.out.println avec prenom
            const printPrenomRegex = /System\.out\.println\s*\(\s*prenom\s*\)/;
            const hasPrintPrenom = printPrenomRegex.test(sourceCode);
            
            // Extraire la valeur du prénom pour vérification
            let expectedPrenom = "";
            const prenomMatch = sourceCode.match(/String\s+prenom\s*=\s*"([^"]+)"\s*;/);
            if (prenomMatch) {
                expectedPrenom = prenomMatch[1];
            }
            
            const outputMatchesPrenom = actualOutput.trim() === expectedPrenom;
            
            results = [
                {
                    index: 1,
                    expected: expectedPrenom || "Une valeur de prénom",
                    actual: actualOutput.trim(),
                    passed: outputMatchesPrenom && hasOutput,
                    description: "Sortie attendue (valeur de prenom)"
                },
                {
                    index: 2,
                    expected: "Déclaration: String prenom = \"...\";",
                    actual: hasPrenomDeclaration ? "Variable prenom déclarée correctement" : "Variable prenom non trouvée ou incorrecte",
                    passed: hasPrenomDeclaration,
                    description: "Déclaration de la variable prenom"
                },
                {
                    index: 3,
                    expected: "System.out.println(prenom);",
                    actual: hasPrintPrenom ? "Instruction d'affichage trouvée" : "Instruction d'affichage de prenom non trouvée",
                    passed: hasPrintPrenom,
                    description: "Affichage de la variable prenom"
                }
            ];
        }
        // Validation spéciale pour l'exerciceId 11
        else if (exercise && exercise.exerciseId === 11) {
            const sourceCode = editorRef.current.getValue();
            
            // Test 1: Vérifier que l'output contient la valeur attendue
            const expectedOutput = testCases.trim();
            const normalizedActual = actualOutput.replace(/\r\n/g, '\n').replace(/\n+$/, '').trim();
            const normalizedExpected = expectedOutput.replace(/\r\n/g, '\n').trim();
            const outputMatches = normalizedActual === normalizedExpected;
            
            // Test 2: Vérifier qu'une variable double temperature = 23.5 est déclarée
            const temperatureDeclarationRegex = /double\s+temperature\s*=\s*23\.5\s*;/;
            const hasTemperatureDeclaration = temperatureDeclarationRegex.test(sourceCode);
            
            // Test 3: Vérifier qu'il y a une instruction System.out.println avec temperature
            const printTemperatureRegex = /System\.out\.println\s*\(\s*temperature\s*\)/;
            const hasPrintTemperature = printTemperatureRegex.test(sourceCode);
            
            results = [
                {
                    index: 1,
                    expected: normalizedExpected,
                    actual: normalizedActual,
                    passed: outputMatches,
                    description: "Sortie attendue (23.5)"
                },
                {
                    index: 2,
                    expected: "Déclaration: double temperature = 23.5;",
                    actual: hasTemperatureDeclaration ? "Variable temperature déclarée correctement" : "Variable temperature non trouvée ou incorrecte",
                    passed: hasTemperatureDeclaration,
                    description: "Déclaration de la variable temperature"
                },
                {
                    index: 3,
                    expected: "System.out.println(temperature);",
                    actual: hasPrintTemperature ? "Instruction d'affichage trouvée" : "Instruction d'affichage de temperature non trouvée",
                    passed: hasPrintTemperature,
                    description: "Affichage de la variable temperature"
                }
            ];
        } else {
            // Comportement par défaut pour les autres exercices
            const expectedOutput = testCases.trim();
            const matches = actualOutput === expectedOutput;
            
            results = [{
                index: 1,
                expected: expectedOutput,
                actual: actualOutput,
                passed: matches
            }];
        }
        
        setTestResults(results);
        
        // Vérifier si tous les tests passent
        const allPassed = results.every(result => result.passed);
        
        // Si c'est un défi, traitement spécial sans sauvegarde ni défaite
        if (exercise && exercise.type === "challenge") {
            if (allPassed) {
                setIsExerciseCompleted(true);
                // Stop the timer in the Challenge component
                if (onChallengeCompleted) {
                    onChallengeCompleted();
                }
                toast({
                    title: "🏆 DÉFI RÉUSSI !",
                    description: "Félicitations ! Vous avez relevé le défi avec succès !",
                    status: "success",
                    duration: 8000,
                });
            } else {
                // Pour les défis, pas de message d'échec, juste l'état des tests
                toast({
                    title: "Continuez !",
                    description: `${results.filter(r => r.passed).length}/${results.length} tests réussis - Vous pouvez y arriver !`,
                    status: "info",
                    duration: 4000,
                });
            }
        }
        // Si tous les tests passent, marquer l'exercice comme réussi (pour les exercices normaux)
        else if (allPassed && user && exercise) {
            try {
                const userExercises = await getUserExercises(user.userId);
                const userExercise = userExercises.find(ue => 
                    ue.exercise.exerciseId === exercise.exerciseId
                );
                
                if (userExercise && !userExercise.success) {
                    await updateUserExercise(userExercise.id, true);
                    setIsExerciseCompleted(true);
                    toast({
                        title: "🎉 Exercice réussi !",
                        description: "Tous les tests sont passés. L'exercice a été marqué comme réussi.",
                        status: "success",
                        duration: 6000,
                    });
                } else if (userExercise && userExercise.success) {
                    setIsExerciseCompleted(true);
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
                {/* Message de félicitations */}
                {isExerciseCompleted && (
                    <Alert status="success" borderRadius="md">
                        <AlertIcon />
                        <Box>
                            {exercise && exercise.type === "challenge" ? (
                                <>
                                    <AlertTitle>🏆 DÉFI RELEVÉ ! Bravo Champion !</AlertTitle>
                                    <AlertDescription>
                                        Félicitations ! Vous avez brillamment réussi ce défi de programmation ! 
                                        Votre persévérance et vos compétences ont payé.
                                    </AlertDescription>
                                </>
                            ) : (
                                <>
                                    <AlertTitle>🎉 Bravo ! Exercice réussi !</AlertTitle>
                                    <AlertDescription>
                                        Félicitations ! Vous avez réussi cet exercice avec succès.
                                    </AlertDescription>
                                    <HStack spacing={3} mt={3}>
                                        <Button size="sm" colorScheme="blue" onClick={handleRestart}>
                                            Recommencer
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleReturnToLessons}>
                                            Retour aux leçons
                                        </Button>
                                    </HStack>
                                </>
                            )}
                        </Box>
                    </Alert>
                )}
                
                {/* Zone d'output standard */}
                <Box
                    height={testResults ? '40vh' : (isExerciseCompleted ? '50vh' : '75vh')}
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
                                            <Text fontSize='sm' fontWeight='bold'>
                                                Test {result.index}{result.description && `: ${result.description}`}
                                            </Text>
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
        testCases: PropTypes.string,
        starterCode: PropTypes.string,
        type: PropTypes.string
    }),
    onChallengeCompleted: PropTypes.func
};

export default Output;