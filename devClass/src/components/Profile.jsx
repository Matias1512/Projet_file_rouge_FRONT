import { 
  Box, 
  Container, 
  Heading, 
  VStack, 
  HStack, 
  Text, 
  Avatar, 
  Badge, 
  Divider,
  Flex,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { FaUser, FaEnvelope, FaCalendarAlt, FaShieldAlt, FaEdit } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById, getUserExercises } from "../api";

import PropTypes from "prop-types";

const ProfileInfoItem = ({ icon, label, value, color }) => (
  <HStack spacing={3} align="center" w="100%">
    <Icon as={icon} color={color} boxSize={5} />
    <Box flex={1}>
      <Text fontSize="sm" color="gray.500" mb={1}>
        {label}
      </Text>
      <Text fontSize="md" fontWeight="medium">
        {value}
      </Text>
    </Box>
  </HStack>
);

ProfileInfoItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string
};

const Profile = () => {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userExercises, setUserExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Couleurs adaptatives pour le thème
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const primaryColor = useColorModeValue("red.500", "red.400");
  const iconColor = useColorModeValue("red.500", "red.300");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      if (!authUser?.userId) return;

      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les données utilisateur et les exercices en parallèle
        const [userResponse, exercisesResponse] = await Promise.all([
          getUserById(authUser.userId),
          getUserExercises(authUser.userId)
        ]);
        
        setUserData(userResponse);
        setUserExercises(exercisesResponse || []);
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        setError(err.message || 'Erreur lors du chargement des données utilisateur');
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.userId) {
      fetchUserData();
    }
  }, [authUser?.userId, isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={primaryColor} />
          <Text>Chargement des informations du profil...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" p={4}>
        <Alert status="error" maxW="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text>Aucune information utilisateur disponible</Text>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'teacher':
        return 'blue';
      case 'student':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Calculer les statistiques des exercices
  const totalExercises = userExercises.length;
  const completedExercises = userExercises.filter(exercise => exercise.success === true).length;
  const exerciseSuccessRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="4xl">
        <VStack spacing={8} align="stretch">
          {/* En-tête du profil */}
          <Card bg={cardBgColor} shadow="lg">
            <CardBody>
              <Flex direction={{ base: "column", md: "row" }} align="center" gap={6}>
                <Avatar 
                  size="2xl" 
                  name={userData.username} 
                  bg={primaryColor}
                  color="white"
                  fontSize="2xl"
                />
                <VStack align={{ base: "center", md: "start" }} spacing={2} flex={1}>
                  <Heading size="xl" color={textColor}>
                    {userData.username}
                  </Heading>
                  <HStack>
                    <Badge 
                      colorScheme={getRoleBadgeColor(userData.role)} 
                      variant="solid"
                      fontSize="sm"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {userData.role || 'Utilisateur'}
                    </Badge>
                  </HStack>
                </VStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Informations détaillées */}
          <Card bg={cardBgColor} shadow="lg">
            <CardHeader>
              <Heading size="md" color={textColor} display="flex" alignItems="center" gap={2}>
                <Icon as={FaUser} color={iconColor} />
                Informations personnelles
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={6} align="stretch">
                <ProfileInfoItem
                  icon={FaUser}
                  label="Nom d'utilisateur"
                  value={userData.username}
                  color={iconColor}
                />
                
                <Divider />
                
                <ProfileInfoItem
                  icon={FaEnvelope}
                  label="Adresse e-mail"
                  value={userData.email}
                  color={iconColor}
                />
                
                <Divider />
                
                <ProfileInfoItem
                  icon={FaShieldAlt}
                  label="Rôle"
                  value={userData.role || 'Utilisateur'}
                  color={iconColor}
                />
                
                <Divider />
                
                <ProfileInfoItem
                  icon={FaCalendarAlt}
                  label="Date d'inscription"
                  value={formatDate(userData.signupDate)}
                  color={iconColor}
                />
                
                {userData.updatedAt && userData.updatedAt !== userData.signupDate && (
                  <>
                    <Divider />
                    <ProfileInfoItem
                      icon={FaEdit}
                      label="Dernière mise à jour"
                      value={formatDate(userData.updatedAt)}
                      color={iconColor}
                    />
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Statistiques utilisateur */}
          <Card bg={cardBgColor} shadow="lg">
            <CardHeader>
              <Heading size="md" color={textColor}>
                Statistiques
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <HStack spacing={6} justify="space-around" wrap="wrap">
                <VStack minW="120px">
                  <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                    {completedExercises}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Exercices réussis
                  </Text>
                </VStack>
                <VStack minW="120px">
                  <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                    {totalExercises}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Exercices tentés
                  </Text>
                </VStack>
                <VStack minW="120px">
                  <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                    {exerciseSuccessRate}%
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Taux de réussite
                  </Text>
                </VStack>
                <VStack minW="120px">
                  <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                    {new Date().getFullYear() - new Date(userData.signupDate).getFullYear() || '< 1'}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Année(s) sur DevClass
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export { ProfileInfoItem };
export default Profile;