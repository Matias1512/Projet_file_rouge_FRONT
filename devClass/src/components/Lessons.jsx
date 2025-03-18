import React, { useState } from "react";
import { Box, VStack, Text, Icon, Flex } from "@chakra-ui/react";
import { FaBook, FaStar, FaDumbbell } from "react-icons/fa";

const pathExercice = [
  { id: 1, idLesson: 1, title: "Titre1", icon: FaStar, description: "COMMENCER", locked: false },
  { id: 2, idLesson: 1, title: "Titre2", icon: FaBook, description: "Lire un article", locked: true },
  { id: 3, idLesson: 1, title: "Titre3", icon: FaBook, description: "Apprendre une leçon", locked: true },
  { id: 4, idLesson: 1, title: "Titre4", icon: FaStar, description: "Atteindre un objectif", locked: true },
  { id: 5, idLesson: 2, title: "Titre5", icon: FaDumbbell, description: "S'entraîner avec des exercices", locked: true },
  { id: 6, idLesson: 2, title: "Titre6", icon: FaBook, description: "Étudier un concept", locked: true },
  { id: 7, idLesson: 2, title: "Titre7", icon: FaStar, description: "Gagner des points", locked: true },
  { id: 8, idLesson: 1, title: "Titre8", icon: FaStar, description: "Débloquer un nouveau niveau", locked: true }
];

const pathLessons = [
  { id: 1, title: "Lesson1", description: "JAVA", color: "blue.400" },
  { id: 2, title: "Lesson2", description: "PYTHON", color: "orange.400" }
];

export default function Lessons() {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <Box minH="100vh" bg="gray.50" p={6} display="flex" flexDirection="column" alignItems="center">
      {/* Parcours toutes les lessons */}
      {pathLessons.map((lesson) => {
        const exercises = pathExercice.filter(ex => ex.idLesson === lesson.id);

        return (
          <Box key={lesson.id} w="full" mb={10}>
            {/* Bandeau de la lesson */}
            <Box w="full" bg={lesson.color} p={4} borderRadius="lg" textAlign="center" color="white">
              <Text fontSize="lg" fontWeight="bold">{lesson.title.toUpperCase()}</Text>
              <Text fontSize="xl">{lesson.description}</Text>
            </Box>

            {/* Liste des exercices liés */}
            <VStack spacing={6} mt={6} align="center">
              {exercises.map((item) => (
                <Flex key={item.id} align="center" direction="row" position="relative">
                  
                  {/* Affichage de la description en cas de survol */}
                  {hoveredItem === item.id && (
                    <Box
                      position="absolute"
                      right="-170px"
                      bg="gray.700"
                      color="white"
                      p={2}
                      borderRadius="md"
                      width="150px"
                      textAlign="center"
                      fontSize="sm"
                      zIndex="1"
                    >
                      {item.description}
                    </Box>
                  )}

                  {/* Icône de l'exercice */}
                  <Box
                    w={12} h={12} display="flex" alignItems="center" justifyContent="center"
                    borderRadius="full" bg={item.locked ? "gray.300" : "blue.400"}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Icon as={item.icon} color={item.locked ? "gray.500" : "white"} w={6} h={6} />
                  </Box>
                </Flex>
              ))}
            </VStack>
          </Box>
        );
      })}
    </Box>
  );
}
