import { Box, Flex, Text, Progress, Badge, Button, Container, Heading, VStack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { FaFire, FaFlask, FaFileAlt, FaShieldAlt, FaBullseye, FaTrophy, FaStar, FaBolt, FaLock } from "react-icons/fa";
import PropTypes from 'prop-types';

const AchievementCard = ({ achievement }) => {
  const { title, description, icon, level, color, current, total } = achievement;
  const progress = Math.round((current / total) * 100);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Flex alignItems="center">
        <Box p={3} bg={color} borderRadius="lg" color="white" position="relative">
          {icon}
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
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    level: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    current: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  }).isRequired
};

const AchievementLocked = ({ achievement, onUnlock }) => {
  const { title, description, icon, level, unlockRequirement } = achievement;
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.100" borderStyle="dashed">
      <Flex alignItems="center">
        <Box p={3} bg="gray.300" borderRadius="lg" color="gray.500" position="relative">
          {icon}
          <Badge position="absolute" bottom={-1} right={-1} bg="white" color="gray.800" fontSize="xs" px={1.5} py={0.5} border="1px solid" borderColor="gray.200">
            {level}
          </Badge>
        </Box>
        <Box ml={4} flex={1}>
          <Flex justifyContent="space-between" alignItems="center" mb={1}>
            <Flex alignItems="center">
              <Heading size="md" color="gray.500">{title}</Heading>
              <FaLock color="gray.400" ml={2} />
            </Flex>
          </Flex>
          <Text fontSize="sm" color="gray.500" mb={2}>{description}</Text>
          {unlockRequirement && (
            <Text fontSize="xs" color="orange.600" fontWeight="medium" mb={2}>Requis: {unlockRequirement}</Text>
          )}
          <Button size="sm" variant="outline" mt={1} fontSize="xs" onClick={onUnlock}>
            Débloquer (démo)
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

AchievementLocked.propTypes = {
  achievement: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    level: PropTypes.number.isRequired,
    unlockRequirement: PropTypes.string
  }).isRequired,
  onUnlock: PropTypes.func.isRequired
};

const AchievementsPage = () => {
  const toast = useToast();
  const [achievements, setAchievements] = useState([
    { id: "streak", title: "Tout feu tout flamme", description: "Réaliser une série de 50 jours", icon: <FaFire size={32} />, level: 5, color: "red.500", current: 35, total: 50, unlocked: true },
    { id: "xp", title: "Puits de science", description: "Gagner 4000 XP", icon: <FaFlask size={32} />, level: 6, color: "green.500", current: 3555, total: 4000, unlocked: true },
    { id: "words", title: "Spécialiste", description: "Apprendre 350 nouveaux mots", icon: <FaFileAlt size={32} />, level: 5, color: "red.500", current: 315, total: 350, unlocked: true },
    { id: "division", title: "Redoutable", description: "Rejoindre la Division Saphir", icon: <FaShieldAlt size={32} />, level: 4, color: "purple.500", current: 3, total: 4, unlocked: true },
    { id: "perfect", title: "Sans-faute", description: "Terminer 100 leçons sans faute", icon: <FaBullseye size={32} />, level: 5, color: "green.500", current: 61, total: 100, unlocked: true },
    { id: "gold", title: "Médaille d'or", description: "Terminer 1er dans la ligue", icon: <FaTrophy size={32} />, level: 1, color: "purple.500", current: 0, total: 1, unlocked: true },
    { id: "speed", title: "Éclair de génie", description: "Compléter 10 leçons en moins de 2 min", icon: <FaBolt size={32} />, level: 3, color: "yellow.500", current: 0, total: 10, unlocked: false, unlockRequirement: "Atteindre le niveau 5" },
    { id: "master", title: "Maître linguiste", description: "Atteindre le niveau max dans 3 compétences", icon: <FaStar size={32} />, level: 7, color: "blue.500", current: 0, total: 3, unlocked: false, unlockRequirement: "Compléter 'Spécialiste'" },
  ]);

  const unlockAchievement = (id) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, unlocked: true } : a));
    toast({ title: "Succès débloqué!", description: "Vous avez débloqué un nouveau succès!", status: "success", duration: 2000, isClosable: true });
  };

  return (
    <Container maxW="3xl" py={8}>
      <Heading size="xl" mb={6}>Mes succès</Heading>
      <VStack spacing={4} align="stretch">
        <Heading size="md">Succès débloqués</Heading>
        {achievements.filter(a => a.unlocked).map(a => <AchievementCard key={a.id} achievement={a} />)}
      </VStack>
      <VStack spacing={4} align="stretch" mt={8}>
        <Heading size="md">Succès à débloquer</Heading>
        {achievements.filter(a => !a.unlocked).map(a => (
          <AchievementLocked key={a.id} achievement={a} onUnlock={() => unlockAchievement(a.id)} />
        ))}
      </VStack>
    </Container>
  );
};

export default AchievementsPage;
