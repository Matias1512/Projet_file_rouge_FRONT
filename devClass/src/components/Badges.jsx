import { Box, Flex, Text, Progress, Badge, Button, Container, Heading, VStack, useToast, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { useState, useEffect, useContext, useCallback } from "react";
import { FaFire, FaFlask, FaFileAlt, FaShieldAlt, FaBullseye, FaTrophy, FaStar, FaBolt, FaLock, FaPlay, FaLeaf, FaHeart, FaCheckCircle, FaTarget, FaCompass } from "react-icons/fa";
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

// Mapping des icônes
const getIcon = (iconName, size = 32) => {
  const iconMap = {
    'FaFire': <FaFire size={size} />,
    'FaFlask': <FaFlask size={size} />,
    'FaFileAlt': <FaFileAlt size={size} />,
    'FaShieldAlt': <FaShieldAlt size={size} />,
    'FaBullseye': <FaBullseye size={size} />,
    'FaTrophy': <FaTrophy size={size} />,
    'FaStar': <FaStar size={size} />,
    'FaBolt': <FaBolt size={size} />,
    'FaPlay': <FaPlay size={size} />,
    'FaLeaf': <FaLeaf size={size} />,
    'FaHeart': <FaHeart size={size} />,
    'FaCheckCircle': <FaCheckCircle size={size} />,
    'FaTarget': <FaTarget size={size} />,
    'FaCompass': <FaCompass size={size} />
  };
  
  return iconMap[iconName] || <FaStar size={size} />;
};

const AchievementCard = ({ achievement }) => {
  const { badge, current } = achievement;
  const { title, description, icon, level, color, total } = badge;
  const progress = Math.round((current / total) * 100);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex alignItems="center">
        <Box p={3} bg={color} borderRadius="lg" color="white" position="relative">
          {getIcon(icon)}
          <Badge position="absolute" bottom={-1} right={-1} bg="white" color="gray.800" fontSize="xs" px={1.5} py={0.5} border="1px solid" borderColor="gray.200">
            {level}
          </Badge>
        </Box>
        <Box ml={4} flex={1}>
          <Flex justifyContent="space-between" alignItems="start" mb={1}>
            <Heading size="md">{title}</Heading>
            <Text fontSize="sm" color="gray.500">{current}/{total}</Text>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={2}>{description}</Text>
          <Progress value={progress} size="sm" colorScheme={color.replace(".500", "")} />
        </Box>
      </Flex>
    </Box>
  );
};

AchievementCard.propTypes = {
  achievement: PropTypes.shape({
    badge: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired
    }).isRequired,
    current: PropTypes.number.isRequired,
    unlocked: PropTypes.bool.isRequired
  }).isRequired
};

const AchievementLocked = ({ achievement }) => {
  const { badge, current } = achievement;
  const { title, description, icon, level, unlockRequirement, total } = badge;
  const progress = Math.round((current / total) * 100);
  
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.100" borderStyle="dashed">
      <Flex alignItems="center">
        <Box p={3} bg="gray.300" borderRadius="lg" color="gray.500" position="relative">
          {getIcon(icon)}
          <Badge position="absolute" bottom={-1} right={-1} bg="white" color="gray.800" fontSize="xs" px={1.5} py={0.5} border="1px solid" borderColor="gray.200">
            {level}
          </Badge>
        </Box>
        <Box ml={4} flex={1}>
          <Flex justifyContent="space-between" alignItems="center" mb={1}>
            <Flex alignItems="center">
              <Heading size="md" color="gray.500">{title}</Heading>
              <Box ml={2}>
                <FaLock color="gray.400" />
              </Box>
            </Flex>
            <Text fontSize="sm" color="gray.500">{current}/{total}</Text>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={2}>{description}</Text>
          {unlockRequirement && (
            <Text fontSize="xs" color="orange.600" fontWeight="medium" mb={2}>
              Condition: {unlockRequirement.replace(/_/g, ' ').replace(':', ' - ')}
            </Text>
          )}
          <Progress value={progress} size="sm" colorScheme="gray" />
        </Box>
      </Flex>
    </Box>
  );
};

AchievementLocked.propTypes = {
  achievement: PropTypes.shape({
    badge: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      level: PropTypes.number.isRequired,
      unlockRequirement: PropTypes.string,
      total: PropTypes.number.isRequired
    }).isRequired,
    current: PropTypes.number.isRequired,
    unlocked: PropTypes.bool.isRequired
  }).isRequired
};

const AchievementsPage = () => {
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`https://schooldev.duckdns.org/api/userbadges/user/${user.userId}`);
      setUserBadges(response.data);
      
    } catch (err) {
      console.error('Erreur lors de la récupération des badges:', err);
      setError('Impossible de charger les badges. Veuillez réessayer.');
      toast({
        title: "Erreur",
        description: "Impossible de charger les badges",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user && user.userId) {
      fetchUserBadges();
    }
  }, [user, fetchUserBadges]);

  if (loading) {
    return (
      <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Chargement de vos badges...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box h="100vh" overflowY="auto">
        <Container maxW="3xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
          <Button mt={4} onClick={fetchUserBadges}>
            Réessayer
          </Button>
        </Container>
      </Box>
    );
  }

  const unlockedBadges = userBadges.filter(ub => ub.unlocked);
  const lockedBadges = userBadges.filter(ub => !ub.unlocked);

  return (
    <Box h="100vh" overflowY="auto">
      <Container maxW="3xl" py={8} pb={10}>
        <Heading size="xl" mb={6}>Mes succès</Heading>
        
        {unlockedBadges.length > 0 && (
          <VStack spacing={4} align="stretch" mb={8}>
            <Heading size="md" color="green.600">Succès débloqués ({unlockedBadges.length})</Heading>
            {unlockedBadges.map(userBadge => (
              <AchievementCard key={userBadge.badge.id} achievement={userBadge} />
            ))}
          </VStack>
        )}
        
        {lockedBadges.length > 0 && (
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="gray.600">Succès à débloquer ({lockedBadges.length})</Heading>
            {lockedBadges.map(userBadge => (
              <AchievementLocked key={userBadge.badge.id} achievement={userBadge} />
            ))}
          </VStack>
        )}
        
        {userBadges.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500">Aucun badge disponible pour le moment.</Text>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AchievementsPage;
