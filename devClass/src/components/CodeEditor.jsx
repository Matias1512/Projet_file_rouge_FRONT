import { Box, HStack, Text, Spinner, VStack, useColorModeValue } from "@chakra-ui/react"
import { Editor } from "@monaco-editor/react"
import { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import axios from "axios";


const CodeEditor = () => {
    const editorRef = useRef()
    const location = useLocation()
    const [value, setvalue] = useState(CODE_SNIPPETS.javascript);
    const [language, setLanguage] = useState('javascript')
    const [exercise, setExercise] = useState(null)
    const [loading, setLoading] = useState(false)
    
    // Theme colors
    const exerciseBg = useColorModeValue("blue.50", "blue.900")
    const exerciseTitleColor = useColorModeValue("blue.800", "blue.100")
    const exerciseDescColor = useColorModeValue("blue.600", "blue.200")
    const exerciseBadgeBg = useColorModeValue("blue.200", "blue.700")
    const freeModeBoxBg = useColorModeValue("gray.50", "gray.700")
    const freeModeTextColor = useColorModeValue("gray.600", "gray.300")

    // Fonction pour mapper les langages de l'API vers Monaco Editor
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
        return languageMap[normalizedLanguage] || 'javascript'; // javascript par défaut
    }

    // Récupérer l'exerciceId depuis l'URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const exerciseId = searchParams.get('exerciseId');
        
        if (exerciseId) {
            const fetchExercise = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`https://schooldev.duckdns.org/api/exercises/${exerciseId}`);
                    const exerciseData = response.data;
                    console.log('Données de l\'exercice récupérées:', exerciseData);
                    setExercise(exerciseData);
                    
                    // Récupérer le langage depuis lesson.course.language
                    let monacoLanguage = 'javascript'; // défaut
                    if (exerciseData.lesson?.course?.language) {
                        monacoLanguage = mapApiLanguageToMonaco(exerciseData.lesson.course.language);
                        console.log(`Langage détecté: ${exerciseData.lesson.course.language} → Monaco: ${monacoLanguage}`);
                        setLanguage(monacoLanguage);
                    } else {
                        console.log('Aucun langage trouvé dans exerciseData.lesson.course.language, utilisation de javascript par défaut');
                    }
                    
                    // Ensuite définir le code selon la priorité : starterCode > snippet du langage
                    if (exerciseData.starterCode) {
                        setvalue(exerciseData.starterCode);
                    } else {
                        // Utiliser le snippet du langage détecté
                        setvalue(CODE_SNIPPETS[monacoLanguage] || CODE_SNIPPETS.javascript);
                    }
                    
                } catch (error) {
                    console.error('Erreur lors de la récupération de l\'exercice:', error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchExercise();
        } else {
            // Pas d'exerciceId, mode libre
            setLoading(false);
        }
    }, [location.search]);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    }

    const onSelect = (language) => {
        setLanguage(language);
        // Toujours charger le snippet du langage sélectionné
        setvalue(CODE_SNIPPETS[language]);
    }

    return (
        <Box>
            {loading && (
                <Box textAlign="center" p={4}>
                    <Spinner size="lg" />
                    <Text mt={2}>Chargement de l&apos;exercice...</Text>
                </Box>
            )}
            
            {exercise && (
                <Box p={4} bg={exerciseBg} borderRadius="md" mb={4}>
                    <VStack align="start" spacing={2}>
                        <Text fontWeight="bold" color={exerciseTitleColor} fontSize="lg">{exercise.title}</Text>
                        <Text color={exerciseDescColor} fontSize="sm">{exercise.description}</Text>
                        {exercise.lesson?.course?.language && (
                            <Box display="inline-block" px={2} py={1} bg={exerciseBadgeBg} borderRadius="md">
                                <Text fontSize="xs" fontWeight="bold" color={exerciseTitleColor}>
                                    Langage: {exercise.lesson.course.language.toUpperCase()}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </Box>
            )}
            
            {!exercise && !loading && (
                <Box p={4} bg={freeModeBoxBg} borderRadius="md" mb={4}>
                    <Text color={freeModeTextColor} fontSize="sm" textAlign="center">
                        💡 Mode libre - Sélectionnez un langage et commencez à coder !
                    </Text>
                </Box>
            )}
            
            {/* Afficher l'éditeur seulement après chargement de l'exercice ou en mode libre */}
            {(!loading && (exercise || !new URLSearchParams(location.search).get('exerciseId'))) && (
                <HStack spacing={4}>
                    <Box w='50%'>
                        <LanguageSelector language={language} onSelect={onSelect} />
                        <Editor
                            height="75vh"
                            theme="vs-dark"
                            language={language}
                            value={value}
                            onMount={ 
                                onMount
                            }
                            onChange={
                                (value, ) => setvalue(value)
                            }
                        />
                    </Box>
                    <Output editorRef={editorRef} language={language} exercise={exercise}/>
                </HStack>
            )}
            
        </Box>
    );
};

export default CodeEditor;