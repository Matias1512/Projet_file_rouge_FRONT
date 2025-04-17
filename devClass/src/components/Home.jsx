import { Box, Button, Flex, Grid, Heading, Progress, Text, useColorModeValue } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"

import axios from "axios";

const chapters = [
  { id: 1, title: "Chapitre 1", progress: 0, total: 8, message: "Les bases!" },
  { id: 2, title: "Chapitre 2", progress: 2, total: 10, message: "La suite" },
  { id: 3, title: "Chapitre 3", progress: 0, total: 12, message: "Mdium" },
  { id: 4, title: "Chapitre 4", progress: 5, total: 8, message: "Expert" },
]

export default function Home() {
  const [courses, setCourses] = useState([]);

  

  const bgPage = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={bgPage} py={6} px={4} display="flex" flexDir="column" alignItems="center">
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full" maxW="4xl">
        {chapters.map((chapter) => (
          <CoursesCard key={chapter.id} chapter={chapter} />
        ))}
      </Grid>
    </Box>
  )
}

function CoursesCard({ chapter }) {
  const navigate = useNavigate()

  const cardBg = useColorModeValue("gray.50", "gray.900");
  const cardText = useColorModeValue("gray.800", "white");
  const bubbleBg = useColorModeValue("gray.100", "gray.700");
  const bubbleArrow = useColorModeValue("#E2E8F0", "#4A5568");

  const progressPercentage = (chapter.progress / chapter.total) * 100

  return (
    <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="lg" display="flex" flexDir="column" h="100%">
      <Heading as="h2" size="md" color={cardText} mb={4}>
        {chapter.title}
      </Heading>

      <Flex align="center" mb={6}>
        <Box flex="1" mr={2}>
          <Progress value={progressPercentage} size="sm" colorScheme="green" />
        </Box>
        <Text color={cardText} mr={2}>
          {chapter.progress}/{chapter.total}
        </Text>
      </Flex>

      <Flex flex="1" direction="column" justify="space-between" mb={6}>
        <Box position="relative" bg={bubbleBg} p={4} borderRadius="lg" mb={4}>
          <Box
            position="absolute"
            bottom="-10px"
            right="10px"
            width="0"
            height="0"
            borderLeft="10px solid transparent"
            borderRight="10px solid transparent"
            borderTop={`10px solid ${bubbleArrow}`}
          />
          <Text color={cardText}>{chapter.message}</Text>
        </Box>

        <Flex justify="flex-end">
          <Box w="64px" h="64px">
            <img
              src="/placeholder.svg"
              alt="Mascotte"
              width="64"
              height="64"
              style={{ borderRadius: "9999px", backgroundColor: "#84cc16" }}
            />
          </Box>
        </Flex>
      </Flex>

      <Button colorScheme="blue" size="lg" fontWeight="bold" w="full" onClick={() => navigate("/lessons")}>
        CONTINUER
      </Button>
    </Box>
  )
}
