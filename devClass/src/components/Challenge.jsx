import { Box, HStack, Text, Spinner, VStack, useColorModeValue, Flex } from "@chakra-ui/react"
import { Editor } from "@monaco-editor/react"
import { useRef, useState, useEffect } from "react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import HintText from "./HintText";
import axios from "axios";

const Challenge = () => {
    const editorRef = useRef()
    const [value, setvalue] = useState(`function fibonacci(n) {
    // Complétez cette fonction pour calculer le n-ième nombre de Fibonacci
    // La suite: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...
    
}

// Tests - ne pas modifier
console.log("fibonacci(0) = " + fibonacci(0));
console.log("fibonacci(1) = " + fibonacci(1));
console.log("fibonacci(5) = " + fibonacci(5));
console.log("fibonacci(8) = " + fibonacci(8));`);
    const [language, setLanguage] = useState('javascript')
    const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
    const [isTimerActive, setIsTimerActive] = useState(true) // Start timer immediately
    const [isDefeated, setIsDefeated] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [blockedUntil, setBlockedUntil] = useState(null)
    const [blockTimeLeft, setBlockTimeLeft] = useState(0) // Time left in blocking in seconds
    
    // Hardcoded challenge exercise
    const exercise = {
        title: "Série de Fibonacci",
        description: "Implémentez une fonction qui calcule le n-ième nombre de la suite de Fibonacci. La suite commence par 0, 1 et chaque nombre suivant est la somme des deux précédents. Testez avec fibonacci(0), fibonacci(1), fibonacci(5) et fibonacci(8).",
        type: "challenge", // Mark as challenge instead of exercise
        testCases: `fibonacci(0) = 0
fibonacci(1) = 1
fibonacci(5) = 5
fibonacci(8) = 21`,
        lesson: {
            course: {
                language: "JAVASCRIPT"
            }
        }
    }
    
    // Theme colors
    const exerciseBg = useColorModeValue("orange.50", "orange.900")
    const exerciseTitleColor = useColorModeValue("orange.800", "orange.100")
    const exerciseDescColor = useColorModeValue("orange.600", "orange.200")
    const exerciseBadgeBg = useColorModeValue("orange.200", "orange.700")
    const freeModeBoxBg = useColorModeValue("gray.50", "gray.700")
    const freeModeTextColor = useColorModeValue("gray.600", "gray.300")
    const timerBg = useColorModeValue("red.100", "red.800")
    const timerColor = useColorModeValue("red.800", "red.100")

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
            // Here you could add logic for when timer expires
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft]);

    // Format time to MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Function to map API language to Monaco Editor
    const mapApiLanguageToMonaco = (apiLanguage) => {
        const languageMap = {
            'JAVA': 'java',
            'JAVASCRIPT': 'javascript',
            'TYPESCRIPT': 'typescript', 
            'PYTHON': 'python',
            'C#': 'csharp',
            'CSHARP': 'csharp',
            'PHP': 'php'
        };
        
        const normalizedLanguage = apiLanguage?.toUpperCase();
        return languageMap[normalizedLanguage] || 'javascript';
    }

    // Check if challenge is blocked on component mount
    useEffect(() => {
        const blockedUntilTime = localStorage.getItem('challengeBlockedUntil');
        if (blockedUntilTime) {
            const blockedTime = new Date(blockedUntilTime);
            const now = new Date();
            if (now < blockedTime) {
                setBlockedUntil(blockedTime);
                setIsTimerActive(false);
                // Calculate initial block time left
                setBlockTimeLeft(Math.floor((blockedTime - now) / 1000));
            } else {
                // Block period expired, clear it
                localStorage.removeItem('challengeBlockedUntil');
            }
        }
    }, []);

    // Update blocking countdown every second
    useEffect(() => {
        let interval = null;
        if (blockedUntil && blockTimeLeft > 0) {
            interval = setInterval(() => {
                setBlockTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        // Block period expired
                        localStorage.removeItem('challengeBlockedUntil');
                        setBlockedUntil(null);
                        window.location.reload(); // Refresh to reset the challenge
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [blockedUntil, blockTimeLeft]);

    // Timer effect
    useEffect(() => {
        let interval = null;
        if (isTimerActive && timeLeft > 0 && !isCompleted && !isDefeated && !blockedUntil) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => {
                    if (timeLeft <= 1) {
                        // Timer reached 0 - DEFEAT
                        setIsDefeated(true);
                        setIsTimerActive(false);
                        
                        // Block access for 2 hours
                        const blockUntil = new Date();
                        blockUntil.setHours(blockUntil.getHours() + 2);
                        localStorage.setItem('challengeBlockedUntil', blockUntil.toISOString());
                        setBlockedUntil(blockUntil);
                        setBlockTimeLeft(2 * 60 * 60); // 2 hours in seconds
                        
                        return 0;
                    }
                    return timeLeft - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft, isCompleted, isDefeated, blockedUntil]);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    const onSelect = (language) => {
        setLanguage(language);
        setvalue(CODE_SNIPPETS[language]);
    }

    // Helper function to format blocking time countdown (similar to main timer)
    const formatBlockTime = (seconds) => {
        if (seconds <= 0) return "00:00:00";
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // If blocked, show blocking message
    if (blockedUntil && new Date() < blockedUntil) {
        return (
            <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={6}>
                <VStack spacing={6} textAlign="center">
                    <Text fontSize="6xl">⏰</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.500">
                        Accès temporairement bloqué
                    </Text>
                    <Text fontSize="lg" color="gray.600">
                        Vous avez échoué au défi précédent. Revenez dans :
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" fontFamily="mono" color="red.400">
                        {formatBlockTime(blockTimeLeft)}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Utilisez ce temps pour réviser et vous préparer !
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Timer in top right - positioned absolutely */}
            <Box 
                position="fixed" 
                top="20px" 
                right="20px" 
                zIndex={1000}
                pointerEvents="none"
            >
                <Flex 
                    align="center" 
                    bg={isDefeated ? useColorModeValue("red.100", "red.800") : timerBg} 
                    px={4} 
                    py={3} 
                    borderRadius="xl" 
                    boxShadow="xl"
                    border="2px solid"
                    borderColor={isDefeated ? useColorModeValue("red.500", "red.400") : useColorModeValue("red.300", "red.600")}
                >
                    <Text 
                        fontSize="2xl" 
                        fontWeight="bold" 
                        color={isDefeated ? useColorModeValue("red.700", "red.200") : timerColor}
                        fontFamily="mono"
                    >
                        {isDefeated ? "💥 TEMPS ÉCOULÉ" : `⏱️ ${formatTime(timeLeft)}`}
                    </Text>
                </Flex>
            </Box>

            {/* Defeat message */}
            {isDefeated && (
                <Box p={4} bg={useColorModeValue("red.50", "red.900")} borderRadius="md" mb={4} mt={16} border="2px solid" borderColor="red.500">
                    <VStack align="center" spacing={3}>
                        <Text fontSize="3xl">💥</Text>
                        <Text fontWeight="bold" color={useColorModeValue("red.800", "red.100")} fontSize="xl">
                            DÉFI ÉCHOUÉ !
                        </Text>
                        <Text color={useColorModeValue("red.600", "red.200")} textAlign="center">
                            Le temps est écoulé ! Vous ne pouvez pas accéder aux défis pendant 2 heures. 
                            Utilisez ce temps pour étudier et revenir plus fort !
                        </Text>
                    </VStack>
                </Box>
            )}

            {/* Challenge exercise display */}
            <Box p={4} bg={exerciseBg} borderRadius="md" mb={4} mt={16}>
                <VStack align="start" spacing={2}>
                    <Text fontWeight="bold" color={exerciseTitleColor} fontSize="lg">
                        🏆 DÉFI: {exercise.title}
                    </Text>
                    <HintText text={exercise.description} color={exerciseDescColor} />
                    <Box display="inline-block" px={2} py={1} bg={exerciseBadgeBg} borderRadius="md">
                        <Text fontSize="xs" fontWeight="bold" color={exerciseTitleColor}>
                            Langage: {exercise.lesson.course.language.toUpperCase()}
                        </Text>
                    </Box>
                </VStack>
            </Box>
            
            {/* Code editor */}
            {!isDefeated && (
                <HStack spacing={4}>
                    <Box w='50%'>
                        <LanguageSelector language={language} onSelect={onSelect} />
                        <Editor
                            height="75vh"
                            theme="vs-dark"
                            language={language}
                            value={value}
                            onMount={onMount}
                            onChange={(value) => setvalue(value)}
                            options={{
                                readOnly: isCompleted || isDefeated
                            }}
                        />
                    </Box>
                    <Output 
                        editorRef={editorRef} 
                        language={language} 
                        exercise={exercise}
                        onChallengeCompleted={() => {
                            setIsCompleted(true);
                            setIsTimerActive(false);
                        }}
                    />
                </HStack>
            )}
        </Box>
    );
};

export default Challenge;