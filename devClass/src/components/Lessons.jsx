import { Box, VStack, Text, Icon, Flex, Button, useColorModeValue } from "@chakra-ui/react";
import { FaDumbbell, FaBook, FaStar } from "react-icons/fa";
import React, { useState } from "react";

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

const Lessons = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const lessonColor = "blue.400"; // couleur de la leçon statique

  const exercises = pathExercice.filter(ex => ex.idLesson === 1); // tu peux changer l'ID ici si nécessaire

  return (
    <Box minH="100vh" p={6} display="flex" flexDirection="column" alignItems="center">
      <Box w="full" mb={10}>
        <Box w="full" bg={lessonColor} p={4} borderRadius="lg" textAlign="center" color={"white"}>
          <Text fontSize="lg" fontWeight="bold">JAVA</Text>
          <Text fontSize="xl">Lesson1</Text>
        </Box>
        <VStack spacing={6} mt={6} align="center">
          {exercises.map((item) => (
            <Flex key={item.id} align="center" direction="row" position="relative">
              {hoveredItem === item.id && (
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
                  {item.description}
                </Box>
              )}
              <Button
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => console.log("Clicked", item.title)}
                isDisabled={item.locked}
                borderRadius="full"
                w={12}
                h={12}
                bg={item.locked ? "gray.300" : "blue.400"}
                _hover={{ bg: item.locked ? "gray.300" : "blue.500" }}
                p={0}
              >
                <Icon as={item.icon} color={item.locked ? "gray.500" : "white"} w={6} h={6} />
              </Button>
            </Flex>
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default Lessons;
