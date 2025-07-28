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
    <Box w="100%" h="100%" bg={bgPage} p={0} overflow="hidden">
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={0} w="100%" h="100%" sx={{ "& > *": { overflow: "visible" } }}>
        {courses.map((course) => (
          <CoursesCard key={course.courseId} course={course} />
        ))}
      </Grid>
    </Box>
  )
}

function CoursesCard({ course }) {
  const navigate = useNavigate()

  const cardBg = useColorModeValue("white", "gray.900");
  const cardText = useColorModeValue("gray.800", "white");
  const languageColors = {
    'JAVA': '#f89500',
    'PYTHON': '#3776ab',
    'ANGULAR': '#dd0031',
    'PHP': '#777bb4'
  };
  
  const languageColor = languageColors[course.language?.toUpperCase()] || '#666';
  const progressPercentage = 0;

  return (
    <Box 
      position="relative"
      h="100%"
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="visible"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bg={cardBg}
        border="2px solid"
        borderColor={languageColor}
        transform="skewX(-10deg)"
        transformOrigin="center"
        clipPath="inset(0)"
      />
      
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        h="90%"
        w="90%"
        gap={4}
      >
        <img
          src="/images/mascotte.png"
          alt={`${course.language} mascot`}
          width="550"
          height="550"
        />

        <Heading as="h2" size="md" color={cardText} textAlign="center" fontWeight="bold">
          {course.language?.toUpperCase() || course.title}
        </Heading>

        <Box w="60%">
          <Progress value={progressPercentage} size="sm" colorScheme="green" bg="white" />
          <Text color={cardText} fontSize="sm" textAlign="center" mt={1}>
            0/9
          </Text>
        </Box>

        <Button 
          colorScheme="red" 
          size="sm" 
          fontWeight="bold" 
          px={6}
          onClick={() => navigate("/lessons")}
        >
          CONTINUER
        </Button>
      </Flex>
    </Box>
  )
}
