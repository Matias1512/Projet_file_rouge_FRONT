import { Box, Button, Flex, Grid, Heading, Progress, Text, useColorModeValue } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { useAuth } from "../AuthContext";

import axios from "axios";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get('https://schooldev.duckdns.org/api/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    fetchCourses();
  }, [isAuthenticated, logout, navigate]);

  const bgPage = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={bgPage} py={6} px={4} display="flex" flexDir="column" alignItems="center">
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full" maxW="4xl">
        {courses.map((course) => (
          <CoursesCard key={course.courseId} course={course} />
        ))}
      </Grid>
    </Box>
  )
}

function CoursesCard({ course }) {
  const navigate = useNavigate()

  const cardBg = useColorModeValue("gray.50", "gray.900");
  const cardText = useColorModeValue("gray.800", "white");
  const bubbleBg = useColorModeValue("gray.100", "gray.700");
  const bubbleArrow = useColorModeValue("#E2E8F0", "#4A5568");

  const progressPercentage = 0;

  return (
    <Box bg={cardBg} borderRadius="lg" p={6} boxShadow="lg" display="flex" flexDir="column" h="100%">
      <Heading as="h2" size="md" color={cardText} mb={4}>
        {course.title}
      </Heading>

      <Flex align="center" mb={6}>
        <Box flex="1" mr={2}>
          <Progress value={progressPercentage} size="sm" colorScheme="green" />
        </Box>
        <Text color={cardText} mr={2}>
          0/1
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
          <Text color={cardText}>Langage: {course.language} - Niveau: {course.difficultyLevel}</Text>
        </Box>

        <Flex justify="flex-end">
          <Box w="64px" h="64px">
            <img
              src="/images/mascotte.png"
              alt="Mascotte"
              width="64"
              height="64"
              style={{ borderRadius: "9999px" }}
            />
          </Box>
        </Flex>
      </Flex>

      <Button colorScheme="red" size="lg" fontWeight="bold" w="full" onClick={() => navigate("/lessons")}>
        CONTINUER
      </Button>
    </Box>
  )
}
