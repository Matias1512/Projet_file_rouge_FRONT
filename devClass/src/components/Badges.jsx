import { Box, Flex, Text, Progress, Badge, Button, Container, Heading, VStack, useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaFire, FaFlask, FaFileAlt, FaShieldAlt, FaBullseye, FaTrophy, FaRocket, FaStar, FaBolt, FaMedal, FaLock } from "react-icons/fa";

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

const AchievementLocked = ({ achievement, onUnlock }) => {
  const { title, description, icon, level, color, unlockRequirement } = achievement;
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

const AchievementsPage = () => {
  const toast = useToast();
  const [achievements, setAchievements] = useState([]);

  const unlockAchievement = (id) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === id 
          ? { ...achievement, unlocked: true, current: achievement.total }
          : achievement
      )
    );
    toast({
      title: "Succès débloqué !",
      description: "Félicitations pour ce nouveau succès !",
      status: "success",
      duration: 3000,
      isClosable: true
    });
  };

  useEffect(() => {
    axios.get("https://schooldev.duckdns.org/api/badges")
      .then(response => {
        const badges = response.data.map((badge, index) => ({
          id: badge.badgeId || index, // fallback au cas où badgeId est manquant
          title: badge.name,
          description: badge.description,
          icon: <FaStar size={32} />, // 🔁 remplace par une logique plus spécifique si tu as plusieurs icônes
          level: 1, // à adapter si tu as un niveau à afficher
          color: "blue.500", // idem
          current: 0,
          total: 1,
          unlocked: false // ou logique future si tu veux gérer ça par utilisateur
        }));
        setAchievements(badges);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des badges :", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les succès.",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      });
  }, []);

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
